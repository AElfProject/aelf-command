import { Command } from 'commander';
import path from 'path';
import GetTxResultCommand from '../../src/command/getTxResult.js';
import { userHomeDir } from '../../src/utils/userHomeDir.js';
import { endpoint as endPoint, account, password, dataDir } from '../constants.js';

jest.mock('../../src/utils/myLogger');

describe('GetTxResultCommand', () => {
  let getTxResultCommand;
  let oraInstanceMock;
  const sampleRc = { getConfigs: jest.fn() };

  beforeEach(() => {
    oraInstanceMock = {
      start: jest.fn(),
      clear: jest.fn(),
      succeed: jest.fn(),
      fail: jest.fn()
    };
    getTxResultCommand = new GetTxResultCommand(sampleRc);
    getTxResultCommand.oraInstance = oraInstanceMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should get transaction result and succeed', async () => {
    const txId = 'ef17ac2078c2b31a702b9edc754bfa56f1c37931f52f9dd8e2b9dc65769966b1';
    const commander = new Command();
    commander.option('-e, --endpoint <URI>', 'The URI of an AElf node. Eg: http://127.0.0.1:8000');
    commander.option('-a, --account <account>', 'The address of AElf wallet');
    commander.option('-p, --password <password>', 'The password of encrypted keyStore');
    commander.option(
      '-d, --datadir <directory>',
      `The directory that contains the AElf related files. Default to be ${userHomeDir}/aelf`
    );
    commander.parse([process.argv[0], '', 'get-tx-result', '-e', endPoint, '-a', account, '-p', password, '-d', dataDir]);
    await getTxResultCommand.run(commander, txId);
    expect(oraInstanceMock.succeed).toHaveBeenCalled();
  });
  test('should log error and fail on validation error', async () => {
    jest.spyOn(process, 'exit').mockImplementation(() => {});
    const commander = new Command();
    commander.option('-e, --endpoint <URI>', 'The URI of an AElf node. Eg: http://127.0.0.1:8000');
    commander.option('-a, --account <account>', 'The address of AElf wallet');
    commander.option('-p, --password <password>', 'The password of encrypted keyStore');
    commander.option(
      '-d, --datadir <directory>',
      `The directory that contains the AElf related files. Default to be ${userHomeDir}/aelf`
    );
    commander.parse([process.argv[0], '', 'get-tx-result', '-e', endPoint, '-a', account, '-p', password, '-d', dataDir]);
    await getTxResultCommand.run(commander, true);
    expect(process.exit).toHaveBeenCalledWith(1);
    expect(oraInstanceMock.fail).toHaveBeenCalled();
  });
});
