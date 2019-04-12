const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const dns = require('dns');
const url = require('url');
const spawn = require('cross-spawn');
const chalk = require('chalk');
const semver = require('semver');
const validateProjectName = require('validate-npm-package-name');

const FES_SCRIPTS_INSTALL_PATH = '../packages/fes-scripts';

function install(useYarn, dependencies, verbose, isOnline) {
  // for dev test
  if (process.env.FES_DEV && FES_SCRIPTS_INSTALL_PATH) {
    dependencies = dependencies.map((dep) => { // eslint-disable-line
      if (dep.indexOf('fes-scripts') >= 0) {
        return FES_SCRIPTS_INSTALL_PATH;
      }
      return dep;
    });
  }

  return new Promise((resolve, reject) => {
    let command;
    let args;
    if (useYarn) {
      command = 'yarnpkg';
      args = ['add', '--exact'];
      if (!isOnline) {
        args.push('--offline');
      }
      [].push.apply(args, dependencies);

      if (!isOnline) {
        console.log(chalk.yellow('You appear to be offline.'));
        console.log(chalk.yellow('Falling back to the local Yarn cache.'));
        console.log();
      }
    } else {
      command = 'npm';
      args = [
        'install',
        '--save',
        '--production=false',
        '--save-exact',
        '--loglevel',
        'error',
      ].concat(dependencies);
    }

    if (verbose) {
      args.push('--verbose');
    }

    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('close', (code) => {
      if (code !== 0) {
        reject({ command: `${command} ${args.join(' ')}`}); // eslint-disable-line
        return;
      }
      resolve();
    });
  });
}

// If project only contains files generated by GH, it’s safe.
// We also special case IJ-based products .idea because it integrates with CRA:
// https://github.com/facebookincubator/create-react-app/pull/368#issuecomment-243446094
function isSafeToCreateProjectIn(root, name) {
  const validFiles = [
    '.DS_Store',
    'Thumbs.db',
    '.git',
    '.gitignore',
    '.idea',
    'README.md',
    'LICENSE',
    'web.iml',
    '.hg',
    '.hgignore',
    '.hgcheck',
  ];
  console.log();

  const conflicts = fs
    .readdirSync(root)
    .filter(file => !validFiles.includes(file));
  if (conflicts.length < 1) {
    return true;
  }

  console.log(
    `The directory ${chalk.green(name)} contains files that could conflict:`
  );
  console.log();
  conflicts.forEach(file => console.log(`  ${file}`));
  console.log();
  console.log(
    'Either try using a new directory name, or remove the files listed above.'
  );

  return false;
}

/**
 * getInstallPackage
 */

function getInstallPackage(version) {
  let packageToInstall = 'fes-scripts';
  const validSemver = semver.valid(version);
  if (validSemver) {
    packageToInstall += `@${validSemver}`;
  } else if (version) {
    // for tar.gz or alternative paths
    packageToInstall = version;
  }
  return packageToInstall;
}


function getPackageName(installPackage) {
  if (installPackage.match(/.+@/)) {
    // Do not match @scope/ when stripping off @version or @tag
    return Promise.resolve(
      installPackage.charAt(0) + installPackage.substr(1).split('@')[0]
    );
  }
  return Promise.resolve(installPackage);
}

// setCaretRangeForRuntimeDeps
function setCaretRangeForRuntimeDeps(packageName) {
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageJson = require(packagePath); // eslint-disable-line

  if (typeof packageJson.dependencies === 'undefined') {
    console.error(chalk.red('Missing dependencies in package.json'));
    process.exit(1);
  }
  const packageVersion = packageJson.dependencies[packageName];
  if (typeof packageVersion === 'undefined') {
    console.error(chalk.red(`Unable to find ${packageName} in package.json`));
    process.exit(1);
  }

  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
}


function printValidationResults(results) {
  if (typeof results !== 'undefined') {
    results.forEach((error) => {
      console.error(chalk.red(`  *  ${error}`));
    });
  }
}

/**
 * check utilities
 */

function checkIfOnline(useYarn) {
  if (!useYarn) {
    // Don't ping the Yarn registry.
    // We'll just assume the best case.
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    dns.lookup('registry.yarnpkg.com', (err) => {
      if (err != null && process.env.https_proxy) {
        // If a proxy is defined, we likely can't resolve external hostnames.
        // Try to resolve the proxy name as an indication of a connection.
        dns.lookup(url.parse(process.env.https_proxy).hostname, (proxyErr) => {
          resolve(proxyErr == null);
        });
      } else {
        resolve(err == null);
      }
    });
  });
}


function shouldUseYarn() {
  try {
    execSync('yarnpkg --version', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

function checkNpmVersion() {
  let hasMinNpm = false;
  let npmVersion = null;
  try {
    npmVersion = execSync('npm --version').toString().trim();
    hasMinNpm = semver.gte(npmVersion, '3.0.0');
  } catch (err) {
    // ignore
  }
  return {
    hasMinNpm,
    npmVersion,
  };
}


function checkNodeVersion(packageName) {
  const packageJsonPath = path.resolve(
    process.cwd(),
    'node_modules',
    packageName,
    'package.json'
  );
  const packageJson = require(packageJsonPath); // eslint-disable-line
  if (!packageJson.engines || !packageJson.engines.node) {
    return;
  }

  if (!semver.satisfies(process.version, packageJson.engines.node)) {
    console.error(
      chalk.red(
        `You are running Node %s.
         Create React App requires Node %s or higher.
         Please update your version of Node.`
      ),
      process.version,
      packageJson.engines.node
    );
    process.exit(1);
  }
}

function checkAppName(appName) {
  const validationResult = validateProjectName(appName);
  if (!validationResult.validForNewPackages) {
    console.error(
      `Could not create a project called ${chalk.red(
        `"${appName}"`
      )} because of npm naming restrictions:`
    );
    printValidationResults(validationResult.errors);
    printValidationResults(validationResult.warnings);
    process.exit(1);
  }

  // TODO: there should be a single place that holds the dependencies
  const dependencies = ['fes-scripts'].sort();
  if (dependencies.indexOf(appName) >= 0) {
    console.error(
      chalk.red(
        `We cannot create a project called ${chalk.green(appName)}
        because a dependency with the same name exists.
        Due to the way npm works, the following names are not allowed:\n`
      )
      + chalk.cyan(dependencies.map(depName => `  ${depName}`).join('\n'))
      + chalk.red('\n\nPlease choose a different project name.')
    );
    process.exit(1);
  }
}

module.exports = {
  install,
  isSafeToCreateProjectIn,
  setCaretRangeForRuntimeDeps,
  getInstallPackage,
  getPackageName,
  checkIfOnline,
  shouldUseYarn,
  checkNpmVersion,
  checkAppName,
  checkNodeVersion,
};
