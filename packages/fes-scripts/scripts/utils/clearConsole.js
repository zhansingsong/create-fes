function clearConsole(isTTY = process.stdout.isTTY) {
  if (isTTY) {
    process.stdout.write(process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H');
  }
}

module.exports = clearConsole;
