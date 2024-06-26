import { Command } from 'commander';
import path from 'path';
import CreateCommand from '../../src/command/create.js';
import { saveKeyStore } from '../../src/utils/wallet';
import { logger } from '../../src/utils/myLogger';
import { userHomeDir } from '../../src/utils/userHomeDir.js';
import { endpoint as endPoint, account, password, dataDir } from '../constants.js';

jest.mock('../../src/utils/wallet');
jest.mock('../../src/utils/myLogger');

describe('CreateCommand', () => {
  let createCommand;
  let oraInstance;
  const sampleRc = { getConfigs: jest.fn() };
  beforeEach(() => {
    oraInstance = {
      succeed: jest.fn(),
      fail: jest.fn()
    };
    createCommand = new CreateCommand(sampleRc);
    createCommand.oraInstance = oraInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should create a new wallet and log info', async () => {
    const commander = new Command();
    commander.option('-e, --endpoint <URI>', 'The URI of an AElf node. Eg: http://127.0.0.1:8000');
    commander.option('-a, --account <account>', 'The address of AElf wallet');
    commander.option('-p, --password <password>', 'The password of encrypted keyStore');
    commander.option(
      '-d, --datadir <directory>',
      `The directory that contains the AElf related files. Default to be ${userHomeDir}/aelf`
    );
    commander.parse([process.argv[0], '', 'console', '-e', endPoint, '-a', account, '-p', password, '-d', dataDir]);
    const keyStore = '/path/to/keystore';
    saveKeyStore.mockResolvedValue(keyStore);
    await createCommand.run(commander, true);
    expect(logger.info).toHaveBeenCalledWith('Your wallet info is :');
    expect(saveKeyStore).toHaveBeenCalled();
  });

  test('should succeed without saving to file', async () => {
    const commander = new Command();
    commander.option('-e, --endpoint <URI>', 'The URI of an AElf node. Eg: http://127.0.0.1:8000');
    commander.option('-a, --account <account>', 'The address of AElf wallet');
    commander.option('-p, --password <password>', 'The password of encrypted keyStore');
    commander.option(
      '-d, --datadir <directory>',
      `The directory that contains the AElf related files. Default to be ${userHomeDir}/aelf`
    );
    commander.parse([process.argv[0], '', 'console', '-e', endPoint, '-a', account, '-p', password, '-d', dataDir]);
    const keyStore = '/path/to/keystore';
    saveKeyStore.mockResolvedValue(keyStore);
    await createCommand.run(commander, false);
    expect(logger.info).toHaveBeenCalledWith('Your wallet info is :');
    expect(oraInstance.succeed).toHaveBeenCalledWith('Succeed!');
  });

  test('should handle saveKeyStore error', async () => {
    const commander = new Command();
    commander.option('-e, --endpoint <URI>', 'The URI of an AElf node. Eg: http://127.0.0.1:8000');
    commander.option('-a, --account <account>', 'The address of AElf wallet');
    commander.option('-p, --password <password>', 'The password of encrypted keyStore');
    commander.option(
      '-d, --datadir <directory>',
      `The directory that contains the AElf related files. Default to be ${userHomeDir}/aelf`
    );
    commander.parse([process.argv[0], '', 'console', '-e', endPoint, '-a', account, '-p', password, '-d', dataDir]);
    saveKeyStore.mockImplementation(() => {
      throw new Error('saveKeyStore error');
    });
    await createCommand.run(commander, true);
    expect(oraInstance.fail).toHaveBeenCalledWith('Failed!');
    expect(logger.error).toHaveBeenCalled();
  });
});
