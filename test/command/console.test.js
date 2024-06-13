import boxen from 'boxen';
import repl from 'repl';
import path from 'path';
import { Command } from 'commander';
import ConsoleCommand from '../../src/command/console.js';
import { userHomeDir } from '../../src/utils/userHomeDir.js';
import { logger } from '../../src/utils/myLogger';

jest.mock('boxen');
jest.mock('repl');
jest.mock('../../src/utils/myLogger');

describe('ConsoleCommand', () => {
  let consoleCommand;
  let oraInstance;
  const sampleRc = {
    getConfigs: jest.fn()
  };
  const endPoint = 'https://tdvw-test-node.aelf.io/';
  const account = 'GyQX6t18kpwaD9XHXe1ToKxfov8mSeTLE9q9NwUAeTE8tULZk';
  const password = '1234*Qwer';
  const dataDir = path.resolve(__dirname, '../datadir/aelf');
  beforeEach(() => {
    oraInstance = {
      succeed: jest.fn(),
      fail: jest.fn()
    };
    consoleCommand = new ConsoleCommand(sampleRc);
    consoleCommand.oraInstance = oraInstance;
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should run the console command successfully', async () => {
    const commander = new Command();
    commander.option('-e, --endpoint <URI>', 'The URI of an AElf node. Eg: http://127.0.0.1:8000');
    commander.option('-a, --account <account>', 'The address of AElf wallet');
    commander.option('-p, --password <password>', 'The password of encrypted keyStore');
    commander.option(
      '-d, --datadir <directory>',
      `The directory that contains the AElf related files. Default to be ${userHomeDir}/aelf`
    );
    boxen.mockReturnValue('mockBoxen');
    repl.start.mockReturnValue({ context: {} });
    commander.parse([process.argv[0], '', 'console', '-e', endPoint, '-a', account, '-p', password, '-d', dataDir]);
    await consoleCommand.run(commander);
    expect(oraInstance.succeed).toHaveBeenCalledWith('Succeed!');
    expect(logger.info).toHaveBeenCalledTimes(2);
  }, 20000);
  it('should handle errors correctly', async () => {
    const commander = new Command();
    commander.option('-e, --endpoint <URI>', 'The URI of an AElf node. Eg: http://127.0.0.1:8000');
    commander.option('-a, --account <account>', 'The address of AElf wallet');
    commander.option('-p, --password <password>', 'The password of encrypted keyStore');
    commander.option(
      '-d, --datadir <directory>',
      `The directory that contains the AElf related files. Default to be ${userHomeDir}/aelf`
    );
    commander.parse([process.argv[0], '', 'console', '-e', endPoint, '-a', account, '-p', password, '-d', dataDir]);
    boxen.mockImplementation(() => {
      throw new Error('boxen error');
    });
    await consoleCommand.run(commander);
    expect(oraInstance.fail).toHaveBeenCalledWith('Failed!');
    expect(logger.error).toHaveBeenCalled();
  }, 20000);
});
