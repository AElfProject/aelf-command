import { Command } from 'commander';
import { userHomeDir } from '../../../src/utils/userHomeDir.js';
import DeployCommand from '../../../src/command/dappServer/index';
import Socket from '../../../src/command/dappServer/socket';
import { logger } from '../../../src/utils/myLogger';
import { endpoint as endPoint, account, password, dataDir } from '../../constants.js';

jest.mock('../../../src/command/dappServer/socket');
jest.mock('../../../src/utils/myLogger');
describe('DeployCommand', () => {
  let deployCommand;
  let oraInstanceMock;
  const sampleRc = { getConfigs: jest.fn() };
  beforeEach(() => {
    oraInstanceMock = {
      start: jest.fn(),
      clear: jest.fn(),
      succeed: jest.fn(),
      fail: jest.fn()
    };
    deployCommand = new DeployCommand(sampleRc);
    deployCommand.oraInstance = oraInstanceMock;
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  test('should run and start the server successfully', async () => {
    const commander = new Command();
    commander.option('-e, --endpoint <URI>', 'The URI of an AElf node. Eg: http://127.0.0.1:8000');
    commander.option('-a, --account <account>', 'The address of AElf wallet');
    commander.option('-p, --password <password>', 'The password of encrypted keyStore');
    commander.option(
      '-d, --datadir <directory>',
      `The directory that contains the AElf related files. Default to be ${userHomeDir}/aelf`
    );
    commander.parse([process.argv[0], '', 'wallet', '-e', endPoint, '-a', account, '-p', password, '-d', dataDir]);
    await deployCommand.run(commander);
    expect(logger.info).toHaveBeenCalledWith('DApp server is listening on port 35443');
  });
  test('should handle errors during server startup', async () => {
    Socket.mockImplementation(_ => {
      throw new Error('socket error');
    });
    const commander = new Command();
    commander.option('-e, --endpoint <URI>', 'The URI of an AElf node. Eg: http://127.0.0.1:8000');
    commander.option('-a, --account <account>', 'The address of AElf wallet');
    commander.option('-p, --password <password>', 'The password of encrypted keyStore');
    commander.option(
      '-d, --datadir <directory>',
      `The directory that contains the AElf related files. Default to be ${userHomeDir}/aelf`
    );
    commander.parse([process.argv[0], '', 'wallet', '-e', endPoint, '-a', account, '-p', password, '-d', dataDir]);
    await deployCommand.run(commander);
    expect(oraInstanceMock.fail).toHaveBeenCalledWith('Failed!');
    expect(logger.error).toHaveBeenCalled();
  });
});
