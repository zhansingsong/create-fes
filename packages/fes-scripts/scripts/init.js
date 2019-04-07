// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => err);

const path = require('path');
const fs = require('fs-extra');
const inquirer = require('inquirer');
const chalk = require('chalk');
// const spawn = require('cross-spawn');

module.exports = (appPath, appName, verbose, originalDirectory, template) => { // eslint-disable-line
  // fes-scripts
  const ownPackageName = require(path.join(__dirname, '..', 'package.json')).name; // eslint-disable-line
  // node_modules/fes-scripts
  const ownPath = path.join(appPath, 'node_modules', ownPackageName);
  const appPackage = require(path.join(appPath, 'package.json')); // eslint-disable-line
  const useYarn = fs.existsSync(path.join(appPath, 'yarn.lock'));

  console.log(appPath, appName, verbose, originalDirectory);
  console.log(ownPackageName, ownPath, appPackage, useYarn);
  // Copy over some of the devDependencies
  appPackage.dependencies = appPackage.dependencies || {};

  // Setup the script rules
  appPackage.scripts = {
    start: 'fes-scripts start',
    build: 'fes-scripts build',
    preview: 'fes-scripts preview',
    tmpl: 'fes-scripts tmpl',
  };

  fs.writeFileSync(
    path.join(appPath, 'package.json'),
    JSON.stringify(appPackage, null, 2)
  );

  // 如果存在 README.md 将其重命名 README.old.md
  // const readmeExists = fs.existsSync(path.join(appPath, 'README.md'));
  // if (readmeExists) {
  //   fs.renameSync(
  //     path.join(appPath, 'README.md'),
  //     path.join(appPath, 'README.old.md')
  //   );
  // }

  inquirer.prompt([{
    type: 'list',
    name: 'tmpl',
    message: 'What template do you need',
    choices: [
      {
        name: 'pc',
        value: 'pc',
      },
      {
        name: 'h5',
        value: 'h5',
      },
      {
        name: 'other custom template(<path-to-template>)?',
        value: 'other',
      }],
  },
  ]).then(({ tmpl }) => {
    if (tmpl === 'other') {
      return inquirer.prompt({
        type: 'input',
        name: 'tmpl',
        message: 'Please input a valid path of template?',
        validate: (value) => {
          if (fs.existsSync(value)) {
            return true;
          }
          return `${chalk.red(`${chalk.bold(value)} is a invalid template path`)}. ${chalk.green('please enter again!')}`;
        },
      }).then(t => t);
    }
    return path.join(ownPath, 'templates', tmpl);
  }).then((templatePath) => {
    fs.copySync(templatePath, appPath);

    // Display the most elegant way to cd.
    // This needs to handle an undefined originalDirectory for
    // backward compatibility with old global-cli's.
    let cdpath;
    if (originalDirectory && path.join(originalDirectory, appName) === appPath) {
      cdpath = appName;
    } else {
      cdpath = appPath;
    }
    // Change displayed command to yarn instead of yarnpkg
    const displayedCommand = useYarn ? 'yarn' : 'npm';

    console.log();
    console.log(`Success! Created ${appName} at ${appPath}`);
    console.log('Inside that directory, you can run several commands:');
    console.log();
    console.log(chalk.cyan(`  ${displayedCommand} start`));
    console.log('    Starts the development server.');
    console.log();
    console.log(chalk.cyan(`  ${displayedCommand} ${useYarn ? '' : 'run '}build`));
    console.log('    Bundles the app into static files for production.');
    console.log();
    // console.log(chalk.cyan(`  ${displayedCommand} test`));
    // console.log('    Starts the test runner.');
    // console.log();
    console.log(chalk.cyan(`  ${displayedCommand} ${useYarn ? '' : 'run '}eject`));
    console.log('    Removes this tool and copies build dependencies, configuration files');
    console.log('    and scripts into the app directory. If you do this, you can’t go back!');
    console.log();
    console.log('We suggest that you begin by typing:');
    console.log();
    console.log(chalk.cyan('  cd'), cdpath);
    console.log(`  ${chalk.cyan(`${displayedCommand} start`)}`);
    // if (readmeExists) {
    //   console.log();
    //   console.log(
    //     chalk.yellow(
    //       'You had a `README.md` file, we renamed it to `README.old.md`'
    //     )
    //   );
    // }
    console.log();
    console.log('Happy hacking!');
  });
};
