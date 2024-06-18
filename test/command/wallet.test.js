/* eslint-disable max-len */
import { Command } from 'commander';
import path from 'path';
import GetTxResultCommand from '../../src/command/wallet.js';
import { userHomeDir } from '../../src/utils/userHomeDir.js';
import { logger } from '../../src/utils/myLogger.js';
import { getWallet } from '../../src/utils/wallet.js';

jest.mock('../../src/utils/myLogger');

describe('WalletCommand', () => {
  let walletCommand;
  let oraInstanceMock;
  const sampleRc = { getConfigs: jest.fn() };
  const endPoint = 'https://tdvw-test-node.aelf.io/';
  const account = 'GyQX6t18kpwaD9XHXe1ToKxfov8mSeTLE9q9NwUAeTE8tULZk';
  const password = '1234*Qwer';
  const dataDir = path.resolve(__dirname, '../datadir/aelf');

  beforeEach(() => {
    oraInstanceMock = {
      start: jest.fn(),
      clear: jest.fn(),
      succeed: jest.fn(),
      fail: jest.fn()
    };
    walletCommand = new GetTxResultCommand(sampleRc);
    walletCommand.oraInstance = oraInstanceMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should show wallet details', async () => {
    const commander = new Command();
    commander.option('-e, --endpoint <URI>', 'The URI of an AElf node. Eg: http://127.0.0.1:8000');
    commander.option('-a, --account <account>', 'The address of AElf wallet');
    commander.option('-p, --password <password>', 'The password of encrypted keyStore');
    commander.option(
      '-d, --datadir <directory>',
      `The directory that contains the AElf related files. Default to be ${userHomeDir}/aelf`
    );
    commander.parse([process.argv[0], '', 'wallet', '-e', endPoint, '-a', account, '-p', password, '-d', dataDir]);
    await walletCommand.run(commander);
    expect(oraInstanceMock.succeed).toHaveBeenCalledWith('Succeed!');
    expect(logger.info).toHaveBeenCalledWith(
      'Mnemonic            : impact fork bulk museum swap design draw arctic load option ticket across'
    );
    expect(logger.info).toHaveBeenCalledWith(
      'Private Key         : 9a2c6023e8b2221f4b02f4ccc5128392c1bd968ae45a42fa62848d793fff148f'
    );
    expect(logger.info).toHaveBeenCalledWith(
      'Public Key          : 04703bbe95e986c9d901f28edd60975a7a6c3b2dce41dfec2e7983d293c600e8249642a3da379c4194a6d62bd89afe6753e81acfc2b6bbf3b40736ee0949102071'
    );
    expect(logger.info).toHaveBeenCalledWith('Address             : GyQX6t18kpwaD9XHXe1ToKxfov8mSeTLE9q9NwUAeTE8tULZk');
  }, 20000);
  test('should handle errors and fail', async () => {
    jest.spyOn(require('../../src/utils/wallet'), 'getWallet').mockReturnValue(new Error('test error'));
    const commander = new Command();
    commander.option('-e, --endpoint <URI>', 'The URI of an AElf node. Eg: http://127.0.0.1:8000');
    commander.option('-a, --account <account>', 'The address of AElf wallet');
    commander.option('-p, --password <password>', 'The password of encrypted keyStore');
    commander.option(
      '-d, --datadir <directory>',
      `The directory that contains the AElf related files. Default to be ${userHomeDir}/aelf`
    );
    commander.parse([process.argv[0], '', 'wallet', '-e', endPoint, '-a', account, '-p', password, '-d', dataDir]);
    await walletCommand.run(commander);
    expect(oraInstanceMock.fail).toHaveBeenCalledWith('Failed!');
    expect(logger.error).toHaveBeenCalled();
  }, 20000);
});
