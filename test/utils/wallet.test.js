import inquirer from 'inquirer';
import fs from 'fs';
import { mkdirpSync } from 'mkdirp';
import { getWallet, saveKeyStore } from '../../src/utils/wallet';
import { endpoint, account, password, dataDir } from '../constants.js';
import keyJSON from '../datadir/aelf/keys/GyQX6t18kpwaD9XHXe1ToKxfov8mSeTLE9q9NwUAeTE8tULZk.json';

jest.mock('inquirer');
jest.mock('mkdirp');

describe('wallet', () => {
  describe('getWallet', () => {
    test('should get wallet', () => {
      const result = getWallet(dataDir, account, password);
      expect(result.privateKey).toBe('9a2c6023e8b2221f4b02f4ccc5128392c1bd968ae45a42fa62848d793fff148f');
      expect(result.mnemonic).toBe('impact fork bulk museum swap design draw arctic load option ticket across');
    });
    test('should handle error', () => {
      expect(() => getWallet(dataDir, 'test', password)).toThrow('Make sure you entered the correct account address');
      expect(() => getWallet(dataDir, account, 'test')).toThrow('Make sure you entered the correct password');
    });
  });
  describe('saveKeyStore', () => {
    let existsSyncMock;
    let writeFileSyncMock;
    const wallet = getWallet(dataDir, account, password);
    const keyStorePath = `${dataDir}/keys/${wallet.address}.json`;

    beforeEach(() => {
      jest.clearAllMocks();
      inquirer.prompt.mockResolvedValue({
        password: '1234*Qwer',
        confirmPassword: '1234*Qwer'
      });
    });

    beforeAll(() => {
      // Mock fs methods
      existsSyncMock = jest.spyOn(fs, 'existsSync').mockImplementation(() => true);
      writeFileSyncMock = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    });

    afterAll(() => {
      // Restore fs methods
      existsSyncMock.mockRestore();
      writeFileSyncMock.mockRestore();
    });

    test('should save keystore file and return its path', async () => {
      existsSyncMock.mockReturnValueOnce(false);
      const result = await saveKeyStore(wallet, dataDir);
      expect(mkdirpSync).toHaveBeenCalled();
      expect(writeFileSyncMock).toHaveBeenCalled();
      expect(result).toBe(keyStorePath);
    });

    test('should throw error if passwords do not match', async () => {
      inquirer.prompt.mockResolvedValueOnce({
        password: 'test-password',
        confirmPassword: 'wrong-password'
      });
      await expect(saveKeyStore(wallet, dataDir)).rejects.toThrow('Passwords are different');
    });

    test('should throw error if password is too short', async () => {
      inquirer.prompt.mockResolvedValueOnce({
        password: 'short',
        confirmPassword: 'short'
      });
      await expect(saveKeyStore(wallet, dataDir)).rejects.toThrow('password is too short');
    });

    test('should not create directory if it already exists', async () => {
      existsSyncMock.mockReturnValueOnce(true);
      const result = await saveKeyStore(wallet, dataDir);
      expect(mkdirpSync).not.toHaveBeenCalled();
      expect(writeFileSyncMock).toHaveBeenCalled();
      expect(result).toBe(keyStorePath);
    });
  });
});
