/**
 * @file test commands
 * @author atom-yang
 */
const path = require('path');
const aelfCommand = require('../src/index');

const commandBin = path.resolve(__dirname, '../bin/aelf-command.js');

process.env.NODE_ENV = 'test';

function execCommand(cmd, args) {
  process.env.mockArgs = [process.argv[0], commandBin, cmd, ...args];
  return aelfCommand.run();
}

describe('test index', () => {
  test('test', async () => {
    execCommand('send', [123, 123, 123]);
  })
});
