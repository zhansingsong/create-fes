const inquirer = require('inquirer');
const detect = require('detect-port-alt');
const isRoot = require('is-root');
const chalk = require('chalk');
const getProcessForPort = require('./getProcessForPort');
const clearConsole = require('./clearConsole');


const isInteractive = process.stdout.isTTY;
module.exports = (host, defaultPort) => detect(defaultPort, host).then(port => new Promise(
  /* eslint consistent-return: [0] */
  (resolve) => {
    if (port === defaultPort) {
      return resolve(port);
    }
    const message = process.platform !== 'win32' && defaultPort < 1024 && !isRoot()
      ? 'Admin permissions are required to run a server on a port below 1024.'
      : `Something is already running on port ${defaultPort}.`;
    if (isInteractive) {
      clearConsole();
      const existingProcess = getProcessForPort(defaultPort);

      const question = {
        type: 'confirm',
        name: 'shouldChangePort',
        message: `${chalk.green(`Something is already running on port: ${chalk.yellow(`${chalk.red(defaultPort)}. ${existingProcess ? `Probably:\n  ${existingProcess}` : ''}`)} \n Would you like to run the app on another port: ${chalk.yellowBright(port)} instead?`)}`,
        default: true,
      };
      inquirer.prompt(question).then((answer) => {
        if (answer.shouldChangePort) {
          resolve(port);
        } else {
          resolve(null);
        }
      });
    } else {
      console.log(chalk.red(message));
      resolve(null);
    }
  },
  (err) => {
    throw new Error(`${chalk.red(`Could not find an open port at ${chalk.bold(host)}.`)}\n${`Network error message: ${err.message}` || err}\n`);
  },
));
