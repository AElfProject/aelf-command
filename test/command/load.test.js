/* eslint-disable max-len */
import { Command } from 'commander';
import path from 'path';
import LoadCommand from '../../src/command/load.js';
import { userHomeDir } from '../../src/utils/userHomeDir.js';
import { logger } from '../../src/utils/myLogger';
import { saveKeyStore } from '../../src/utils/wallet';

jest.mock('../../src/utils/wallet');
jest.mock('../../src/utils/myLogger');

describe('LoadCommand', () => {
  let loadCommand;
  let oraInstanceMock;
  const sampleRc = { getConfigs: jest.fn() };
  const endPoint = 'https://tdvw-test-node.aelf.io/';
  const account = 'GyQX6t18kpwaD9XHXe1ToKxfov8mSeTLE9q9NwUAeTE8tULZk';
  const password = '1234*Qwer';
  const dataDir = path.resolve(__dirname, '../dataDir/aelf');
  const privateKey = '9a2c6023e8b2221f4b02f4ccc5128392c1bd968ae45a42fa62848d793fff148f';
  beforeEach(() => {
    oraInstanceMock = {
      start: jest.fn(),
      clear: jest.fn(),
      succeed: jest.fn(),
      fail: jest.fn()
    };
    loadCommand = new LoadCommand(sampleRc);
    loadCommand.oraInstance = oraInstanceMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should load wallet from private key and succeed', async () => {
    const commander = new Command();
    commander.option('-e, --endpoint <URI>', 'The URI of an AElf node. Eg: http://127.0.0.1:8000');
    commander.option('-a, --account <account>', 'The address of AElf wallet');
    commander.option('-p, --password <password>', 'The password of encrypted keyStore');
    commander.option(
      '-d, --datadir <directory>',
      `The directory that contains the AElf related files. Default to be ${userHomeDir}/aelf`
    );
    commander.parse([process.argv[0], '', 'load', '-e', endPoint, '-a', account, '-p', password, '-d', dataDir]);
    const keyStore = '/path/to/keystore';
    saveKeyStore.mockResolvedValue(keyStore);
    await loadCommand.run(commander, privateKey, false, true);
    expect(logger.info).toHaveBeenCalledWith('Your wallet info is :');
    expect(logger.info).toHaveBeenCalledWith(
      'Private Key         : 9a2c6023e8b2221f4b02f4ccc5128392c1bd968ae45a42fa62848d793fff148f'
    );
    expect(logger.info).toHaveBeenCalledWith(
      'Public Key          : 04703bbe95e986c9d901f28edd60975a7a6c3b2dce41dfec2e7983d293c600e8249642a3da379c4194a6d62bd89afe6753e81acfc2b6bbf3b40736ee0949102071'
    );
    expect(logger.info).toHaveBeenCalledWith('Address             : GyQX6t18kpwaD9XHXe1ToKxfov8mSeTLE9q9NwUAeTE8tULZk');
    expect(saveKeyStore).toHaveBeenCalled();
  });
  test('should load wallet from Mnemonic and succeed', async () => {
    const commander = new Command();
    commander.option('-e, --endpoint <URI>', 'The URI of an AElf node. Eg: http://127.0.0.1:8000');
    commander.option('-a, --account <account>', 'The address of AElf wallet');
    commander.option('-p, --password <password>', 'The password of encrypted keyStore');
    commander.option(
      '-d, --datadir <directory>',
      `The directory that contains the AElf related files. Default to be ${userHomeDir}/aelf`
    );
    commander.parse([process.argv[0], '', 'load', '-e', endPoint, '-a', account, '-p', password, '-d', dataDir]);
    const mnemonic = 'orange learn result add snack curtain double state expose bless also clarify';
    await loadCommand.run(commander, mnemonic, false, false);
    expect(logger.info).toHaveBeenCalledWith('Your wallet info is :');
    expect(logger.info).toHaveBeenCalledWith(
      'Mnemonic            : orange learn result add snack curtain double state expose bless also clarify'
    );
    expect(logger.info).toHaveBeenCalledWith(
      'Private Key         : cc2895b46707a34eefd3c61bd4a8487266e0398a93309a9910a2b88e587b6582'
    );
    expect(logger.info).toHaveBeenCalledWith(
      'Public Key          : 04449094b89d0445c920434ea09d87ba8d9bf95d8a3971ee03572a1f666ef2241cc3ada03d47736c005d28bbef8468042e77a084ea11b8aca395ac7686335f4712'
    );
    expect(logger.info).toHaveBeenCalledWith('Address             : SbWhnq3XU8yeiUTYJmZBSgt7ekgszRXHxh8qNqkFj9g6d3bWh');
  });
  test('should load wallet from privateKey and succeed without saving to file', async () => {
    const commander = new Command();
    commander.option('-e, --endpoint <URI>', 'The URI of an AElf node. Eg: http://127.0.0.1:8000');
    commander.option('-a, --account <account>', 'The address of AElf wallet');
    commander.option('-p, --password <password>', 'The password of encrypted keyStore');
    commander.option(
      '-d, --datadir <directory>',
      `The directory that contains the AElf related files. Default to be ${userHomeDir}/aelf`
    );
    commander.parse([process.argv[0], '', 'load', '-e', endPoint, '-a', account, '-p', password, '-d', dataDir]);
    await loadCommand.run(commander, privateKey, false, false);
    expect(logger.info).toHaveBeenCalledWith('Your wallet info is :');
    expect(logger.info).toHaveBeenCalledWith(
      'Private Key         : 9a2c6023e8b2221f4b02f4ccc5128392c1bd968ae45a42fa62848d793fff148f'
    );
    expect(logger.info).toHaveBeenCalledWith(
      'Public Key          : 04703bbe95e986c9d901f28edd60975a7a6c3b2dce41dfec2e7983d293c600e8249642a3da379c4194a6d62bd89afe6753e81acfc2b6bbf3b40736ee0949102071'
    );
    expect(logger.info).toHaveBeenCalledWith('Address             : GyQX6t18kpwaD9XHXe1ToKxfov8mSeTLE9q9NwUAeTE8tULZk');
    expect(oraInstanceMock.succeed).toHaveBeenCalledWith('Succeed!');
  });

  test('should log error and fail on validation error', async () => {
    const commander = new Command();
    commander.option('-e, --endpoint <URI>', 'The URI of an AElf node. Eg: http://127.0.0.1:8000');
    commander.option('-a, --account <account>', 'The address of AElf wallet');
    commander.option('-p, --password <password>', 'The password of encrypted keyStore');
    commander.option(
      '-d, --datadir <directory>',
      `The directory that contains the AElf related files. Default to be ${userHomeDir}/aelf`
    );
    commander.parse([process.argv[0], '', 'load', '-e', endPoint, '-a', account, '-p', password, '-d', dataDir]);
    saveKeyStore.mockImplementation(() => {
      throw new Error('saveKeyStore error');
    });
    await loadCommand.run(commander, privateKey, false, true);
    expect(oraInstanceMock.fail).toHaveBeenCalled();
  });
  test('should fail when trying to use old version SDK', async () => {
    const commander = new Command();
    commander.option('-e, --endpoint <URI>', 'The URI of an AElf node. Eg: http://127.0.0.1:8000');
    commander.option('-a, --account <account>', 'The address of AElf wallet');
    commander.option('-p, --password <password>', 'The password of encrypted keyStore');
    commander.option(
      '-d, --datadir <directory>',
      `The directory that contains the AElf related files. Default to be ${userHomeDir}/aelf`
    );
    commander.parse([process.argv[0], '', 'load', '-e', endPoint, '-a', account, '-p', password, '-d', dataDir]);
    await loadCommand.run(commander, 'xxx xxx', true, false);
    expect(oraInstanceMock.fail).toHaveBeenCalledWith('Please install older versions of aelf-command before v1.0.0!');
  });
});
