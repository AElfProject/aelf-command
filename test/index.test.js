import path from 'path';
import { run as aelfCommandRun } from '../src/index';


const commandBin = path.resolve(__dirname, '../bin/aelf-command.js');

process.env.NODE_ENV = 'test';

function execCommand(cmd, args) {
  process.env.mockArgs = [process.argv[0], commandBin, cmd, ...args];
  console.log(process.env.mockArgs);
  return aelfCommandRun();
}

describe('test index', () => {
  test('test', async () => {
    await execCommand('get-chain-status', []);
  }, 30000);
});
