const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const program = require('commander');
const packageJson = require('../package.json');
const {
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
} = require('./utils');

// 项目名
let projectName;

// 命令
program
  .arguments('<project-directory>')
  .usage(`${chalk.green('<project-directory>')} [options]`)
  .action((name) => {
    projectName = name;
  })
  .option(
    '--scripts-version <alternative-package>',
    'use a non-standard version of fes-scripts'
  )
  .option('-t, --typescript', 'use typescript')
  .option('-B, --no-babel', 'not use babel')
  .option('-n, --npm', 'use npm')
  .option('--verbose', 'print additional logs')
  // .allowUnknownOption()
  .version(packageJson.version, '-v, --version')
  .parse(process.argv);

if (typeof projectName === 'undefined') {
  console.error('Please specify the project directory:');
  console.log(`  ${chalk.cyan(program.name())} ${chalk.green('<project-directory>')}`);
  console.log();
  console.log('For example:');
  console.log(`  ${chalk.cyan(program.name())} ${chalk.green('my-fes-app')}`);
  console.log();
  console.log(`Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`);
  process.exit(1);
}

function run(root, appName, version, verbose, originalDirectory, useYarn, useBabel, useTypescript) {
  const packageToInstall = getInstallPackage(version);
  const allDependencies = [packageToInstall];
  let babelrc = {};

  if (useBabel || useTypescript) {
    allDependencies.push('@babel/core', '@babel/preset-env', 'babel-loader');
    babelrc = { presets: ['@babel/preset-env'] };
  }
  if (useTypescript) {
    allDependencies.push('@babel/preset-typescript', 'typescript');
    fs.copySync(path.join(__dirname, '..', 'tsconfig.json'), path.join(root, 'tsconfig.json'));
    babelrc.presets.push('@babel/preset-typescript');
  }
  if (useBabel || useTypescript) {
    fs.writeFileSync(path.join(root, '.babelrc'), JSON.stringify(babelrc, null, 2));
  }

  console.log('Installing packages. This might take a couple of minutes.');

  getPackageName(packageToInstall).then((packageName) => {
    checkIfOnline(useYarn)
      .then(isOnline => ({
        isOnline,
        packageName,
      }))
      .then((info) => {
        const isOnline = info.isOnline; // eslint-disable-line
        const packageName = info.packageName; // eslint-disable-line
        console.log(`Installing ${chalk.cyan(packageName)}...`);
        console.log();

        return install(useYarn, allDependencies, verbose, isOnline).then(() => ({ packageName, isOnline }));
      })
      .then(({packageName, isOnline}) => {// eslint-disable-line
        checkNodeVersion(packageName);
        setCaretRangeForRuntimeDeps(packageName);

        const scriptsPath = path.resolve(
          process.cwd(),
          'node_modules',
          packageName,
          'scripts',
          'init.js'
        );
        const init = require(scriptsPath); // eslint-disable-line
        init(root, appName, verbose, originalDirectory, isOnline);
      })
      .catch((reason) => {
        console.log();
        console.log('Aborting installation.');
        if (reason.command) {
          console.log(`  ${chalk.cyan(reason.command)} has failed.`);
        } else {
          console.log(chalk.red('Unexpected error. Please report it as a bug:'));
          console.log(reason);
        }
        console.log();
      });
  });
}

function createApp(name, verbose, version, useBabel, useTypescript, useNpm) {
  const root = path.resolve(name);
  const appName = path.basename(root);

  checkAppName(appName);
  fs.ensureDirSync(name);

  if (!isSafeToCreateProjectIn(root, name)) {
    process.exit(1);
  }

  console.log(`Creating a new Fes app in ${chalk.green(root)}.`);
  console.log();

  const appPackageJson = {
    name: appName,
    version: '0.1.0',
    private: true,
  };

  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(appPackageJson, null, 2));

  const originalDirectory = process.cwd();
  process.chdir(root);

  let useYarn = useNpm ? false : shouldUseYarn(); // eslint-disable-line
  process.env.FES_DEV_USE_YARN = useYarn;
  // as yarn is disable to install locale package，it is intetional to set to false for test.
  if (process.env.FES_DEV) {
    useYarn = false; // test
  }
  if (!useYarn) {
    const npmInfo = checkNpmVersion();
    if (!npmInfo.hasMinNpm) {
      if (npmInfo.npmVersion) {
        console.log(
          chalk.yellow(
            `You are using npm ${
              npmInfo.npmVersion
            } so the project will be boostrapped with an old unsupported version of tools.
             Please update to npm 3 or higher for a better, fully supported experience.\n`
          )
        );
      }
    }
  }

  run(root, appName, version, verbose, originalDirectory, useYarn, useBabel, useTypescript);
}

// createApp
createApp(
  projectName,
  program.verbose,
  program.scriptsVersion || packageJson.version,
  program.babel,
  program.typescript,
  program.npm
);
