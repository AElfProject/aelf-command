import { Command } from 'commander';
import path from 'path';
import CreateCommand from '../../src/command/create.js';
import { saveKeyStore } from '../../src/utils/wallet';
import { logger } from '../../src/utils/myLogger';
import { userHomeDir } from '../../src/utils/userHomeDir.js';

jest.mock('../../src/utils/wallet');
jest.mock('../../src/utils/myLogger');

describe('CreateCommand', () => {
  let createCommand;
  let oraInstance;
  const sampleRc = { getConfigs: jest.fn() };
  const endPoint = 'https://tdvw-test-node.aelf.io/';
  const account = 'GyQX6t18kpwaD9XHXe1ToKxfov8mSeTLE9q9NwUAeTE8tULZk';
  const password = '1234*Qwer';
  const dataDir = path.resolve(__dirname, '../datadir/aelf');
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

  it('should create a new wallet and log info', async () => {
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

  it('should succeed without saving to file', async () => {
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

  it('should handle saveKeyStore error', async () => {
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

  //   it('should succeed without saving to file', async () => {
  //     BaseSubCommand.mockImplementation(() => ({
  //       oraInstance,
  //       run: jest.fn().mockResolvedValue({
  //         localOptions: { cipher: 'aes-128-ctr' },
  //         options: { datadir: 'testDir' },
  //         subOptions: { saveToFile: false }
  //       })
  //     }));
  //     const mockWallet = {
  //       mnemonic: 'test mnemonic',
  //       privateKey: 'test privateKey',
  //       keyPair: { getPublic: () => ({ encode: () => 'test publicKey' }) },
  //       address: 'test address'
  //     };
  //     AElf.wallet.createNewWallet.mockReturnValue(mockWallet);

  //     await createCommand.run();

  //     expect(AElf.wallet.createNewWallet).toHaveBeenCalled();
  //     expect(oraInstance.succeed).toHaveBeenCalledWith('Succeed!');
  //   });
});
