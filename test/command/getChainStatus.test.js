import { Command } from 'commander';
import path from 'path';
import GetChainStatusCommand from '../../src/command/getChainStatus.js';
import { userHomeDir } from '../../src/utils/userHomeDir.js';
import { endpoint as endPoint, account, password, dataDir } from '../constants.js';

jest.mock('../../src/utils/myLogger');

describe('GetChainStatusCommand', () => {
  let getChainStatusCommand;
  let oraInstanceMock;
  const sampleRc = { getConfigs: jest.fn() };

  beforeEach(() => {
    oraInstanceMock = {
      start: jest.fn(),
      clear: jest.fn(),
      succeed: jest.fn(),
      fail: jest.fn()
    };
    getChainStatusCommand = new GetChainStatusCommand(sampleRc);
    getChainStatusCommand.oraInstance = oraInstanceMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should get chain status and succeed', async () => {
    const commander = new Command();
    commander.option('-e, --endpoint <URI>', 'The URI of an AElf node. Eg: http://127.0.0.1:8000');
    commander.option('-a, --account <account>', 'The address of AElf wallet');
    commander.option('-p, --password <password>', 'The password of encrypted keyStore');
    commander.option(
      '-d, --datadir <directory>',
      `The directory that contains the AElf related files. Default to be ${userHomeDir}/aelf`
    );
    commander.parse([process.argv[0], '', 'get-chain-status', '-e', endPoint, '-a', account, '-p', password, '-d', dataDir]);
    await getChainStatusCommand.run(commander);
    expect(oraInstanceMock.succeed).toHaveBeenCalled();
  });
  test('should log error and fail on exception', async () => {
    jest.spyOn(process, 'exit').mockImplementation(() => {});
    const commander = new Command();
    commander.option('-e, --endpoint <URI>', 'The URI of an AElf node. Eg: http://127.0.0.1:8000');
    commander.option('-a, --account <account>', 'The address of AElf wallet');
    commander.option('-p, --password <password>', 'The password of encrypted keyStore');
    commander.option(
      '-d, --datadir <directory>',
      `The directory that contains the AElf related files. Default to be ${userHomeDir}/aelf`
    );
    commander.parse([process.argv[0], '', 'get-chain-status', '-e', endPoint, '-a', account, '-p', password, '-d', dataDir]);
    oraInstanceMock.start.mockImplementation(() => {
      throw new Error('mock error');
    });
    await getChainStatusCommand.run(commander);
    expect(oraInstanceMock.fail).toHaveBeenCalled();
  });
});
