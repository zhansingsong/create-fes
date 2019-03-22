const chalk = require('chalk');
const { execSync } = require('child_process');
const path = require('path');

const execOptions = {
  encoding: 'utf8',
  stdio: [
    'pipe', // stdin (default)
    'pipe', // stdout (default)
    'ignore', // stderr
  ],
};

function isProcessAFesApp(processCommand) {
  return /^node .*fes-scripts\/scripts\/start\.js\s?$/.test(processCommand);
}

function getProcessIdOnPort(port) {
  return execSync(`lsof -i:${port} -P -t -sTCP:LISTEN`, execOptions)
    .split('\n')[0]
    .trim();
}

function getPackageNameInDirectory(directory) {
  const packagePath = path.join(directory.trim(), 'package.json');

  try {
    return require(packagePath).name; // eslint-disable-line
  } catch (e) {
    return null;
  }
}

function getProcessCommand(processId, processDirectory) {
  let command = execSync(
    `ps -o command -p ${processId} | sed -n 2p`,
    execOptions
  );

  command = command.replace(/\n$/, '');

  if (isProcessAFesApp(command)) {
    const packageName = getPackageNameInDirectory(processDirectory) || command;
    return packageName;
  }

  return command;
}

function getDirectoryOfProcessById(processId) {
  return execSync(
    `lsof -p ${processId} | awk '$4=="cwd" {for (i=9; i<=NF; i++) printf "%s ", $i}'`,
    execOptions
  ).trim();
}

function getProcessForPort(port) {
  try {
    const processId = getProcessIdOnPort(port);
    const directory = getDirectoryOfProcessById(processId);
    const command = getProcessCommand(processId, directory);
    return (
      chalk.cyan(command)
      + chalk.grey(` (pid ${processId})\n`)
      + chalk.blue('  in ')
      + chalk.cyan(directory)
    );
  } catch (e) {
    return null;
  }
}

module.exports = getProcessForPort;
