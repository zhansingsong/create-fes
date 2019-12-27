const spawn = require('cross-spawn');
const chalk = require('chalk');

function install(useYarn, dependencies, verbose, isOnline) {
  return new Promise((resolve, reject) => {
    if (dependencies.length === 0) {
      resolve();
      return;
    }
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
      args = ['install', '--save', '--production=false', '--save-exact', '--loglevel', 'error'].concat(dependencies);
    }

    if (verbose) {
      args.push('--verbose');
    }

    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('close', (code) => {
      if (code !== 0) {
        reject({ command: `${command} ${args.join(' ')}` }); // eslint-disable-line
        return;
      }
      resolve();
    });
  });
}

module.exports = install;
