import path from 'path';
import inquirer from 'inquirer';
import moment from 'moment';
import { v4 as uuid } from 'uuid';
import AElf from 'aelf-sdk';
import {
  promisify,
  camelCase,
  getContractMethods,
  getContractInstance,
  getMethod,
  promptTolerateSeveralTimes,
  isAElfContract,
  getTxResult,
  parseJSON,
  randomId,
  getParams,
  deserializeLogs
} from '../../src/utils/utils';
import { plainLogger } from '../../src/utils/myLogger';
import { endpoint, account, password, dataDir } from '../constants.js';

jest.mock('inquirer');

describe('utils', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('promisify', () => {
    test('should resolve with result when no error', async () => {
      const mockFn = jest.fn((arg1, cb) => cb(null, arg1 + 1));
      const promiseFn = promisify(mockFn);
      const result = await promiseFn(5);
      expect(result).toBe(6);
    });
    test('should reject with error when callback has error', async () => {
      const mockFn = jest.fn((_, cb) => cb(new Error('Callback error')));
      const promiseFn = promisify(mockFn);
      await expect(promiseFn(5)).rejects.toThrow('Callback error');
    });
    test('should handle firstData parameter correctly', async () => {
      const mockFn = jest.fn((_, cb) => cb('result'));
      const promiseFn = promisify(mockFn, true);
      const result = await promiseFn(5);
      expect(result).toBe('result');
    });
  });

  describe('camelCase', () => {
    test('should convert string to camelCase', () => {
      expect(camelCase('hello_world')).toBe('helloWorld');
    });
  });

  describe('isAElfContract', () => {
    test('should return true for valid AElf contract name', () => {
      expect(isAElfContract('aelf.contract')).toBe(true);
    });

    test('should return false for non-AElf contract name', () => {
      expect(isAElfContract('not.aelf.contract')).toBe(false);
    });
  });

  describe('getContractMethods', () => {
    test('should return methods starting with uppercase letters', () => {
      const contract = {
        Transfer: () => {},
        approve: () => {}
      };
      const methods = getContractMethods(contract);
      expect(methods).toEqual(['Transfer']);
    });

    test('should call plainLogger.fatal and exit process if no contract provided', () => {
      const spyFatal = jest.spyOn(plainLogger, 'fatal').mockReturnValue();
      const spyExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
      getContractMethods('');
      expect(spyFatal).toHaveBeenCalled();
      expect(spyExit).toHaveBeenCalledWith(1);
    });
  });

  describe('getContractInstance', () => {
    let oraInstance;
    const aelf = new AElf(new AElf.providers.HttpProvider(endpoint));
    const contractAddress = '2cVQrFiXNaedBYmUrovmUV2jcF9Hf6AXbh12gWsD4P49NaX99y';
    const wallet = AElf.wallet.getWalletByPrivateKey('9a2c6023e8b2221f4b02f4ccc5128392c1bd968ae45a42fa62848d793fff148f');

    beforeEach(() => {
      oraInstance = {
        start: jest.fn(),
        succeed: jest.fn(),
        fail: jest.fn()
      };
    });

    test('should fetch contract by address if not AElf contract', async () => {
      const contractInstance = await getContractInstance(contractAddress, aelf, wallet, oraInstance);
      expect(oraInstance.start).toHaveBeenCalledWith('Fetching contract');
      expect(oraInstance.succeed).toHaveBeenCalledWith('Fetching contract successfully!');
      expect(contractInstance).toMatchObject({ address: contractAddress });
    });

    test('should fetch AElf contract by name', async () => {
      // contract Token
      const contractInstance = await getContractInstance('AElf.ContractNames.Token', aelf, wallet, oraInstance);
      expect(oraInstance.start).toHaveBeenCalledWith('Fetching contract');
      expect(oraInstance.succeed).toHaveBeenCalledWith('Fetching contract successfully!');
      expect(contractInstance).toMatchObject({ address: 'ASh2Wt7nSEmYqnGxPPzp4pnVDU4uhj1XW9Se5VeZcX2UDdyjx' });
    });

    test('should fail and exit process if contract retrieval fails', async () => {
      const spyFail = jest.spyOn(oraInstance, 'fail').mockReturnValue();
      const spyError = jest.spyOn(plainLogger, 'error').mockReturnValue('Error message');
      const spyExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
      await expect(getContractInstance('invalidAddress', aelf, wallet, oraInstance));
      expect(spyFail).toHaveBeenCalled();
      expect(spyError).toHaveBeenCalled();
      expect(spyExit).toHaveBeenCalledWith(1);
    });

    test('should handle contract address which is not string', async () => {
      // contract Token
      const contractInstance = await getContractInstance({}, aelf, wallet, oraInstance);
      expect(contractInstance).toEqual({});
    });
  });

  describe('getMethod', () => {
    test('should return method if exists in contract', () => {
      const contract = { method: jest.fn() };
      const method = getMethod('method', contract);
      expect(method).toBe(contract.method);
    });

    test('should throw error if method does not exist in contract', () => {
      const contract = {};
      expect(() => getMethod('nonexistentMethod', contract)).toThrow('Not exist method nonexistentMethod');
    });

    test('should return method directly if not a string', () => {
      const contract = {};
      const method = getMethod(null, contract);
      expect(method).toBeNull();
    });
  });

  describe('promptTolerateSeveralTimes', () => {
    let oraInstance;

    beforeEach(() => {
      oraInstance = {
        start: jest.fn(),
        fail: jest.fn()
      };
    });

    test('should return valid input according to pattern', async () => {
      inquirer.prompt.mockResolvedValueOnce({ input: 'validInput' });
      const processAfterPrompt = jest.fn().mockResolvedValue('processedInput');
      const input = await promptTolerateSeveralTimes(
        {
          processAfterPrompt,
          pattern: /valid/,
          times: 3,
          prompt: [{ name: 'input', message: 'Enter input' }]
        },
        oraInstance
      );
      expect(input).toBe('processedInput');
      expect(processAfterPrompt).toHaveBeenCalledWith({ input: 'validInput' });
    });

    test('should retry prompt if input does not match pattern', async () => {
      inquirer.prompt.mockResolvedValue({ input: 'invalidInput' });
      const processAfterPrompt = jest.fn().mockResolvedValue('processedInput');
      await promptTolerateSeveralTimes(
        {
          processAfterPrompt,
          pattern: /valid/,
          times: 3,
          prompt: [{ name: 'input', message: 'Enter input' }]
        },
        oraInstance
      );
      expect(inquirer.prompt).toHaveBeenCalledTimes(3);
    });

    test('should exit process if maximum attempts exceeded', async () => {
      inquirer.prompt.mockResolvedValue({ input: null });
      const spyFail = jest.spyOn(oraInstance, 'fail').mockReturnValue();
      const spyFatal = jest.spyOn(plainLogger, 'fatal').mockReturnValue();
      const spyExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
      const processAfterPrompt = jest.fn().mockResolvedValue(null);
      await promptTolerateSeveralTimes(
        {
          processAfterPrompt,
          pattern: /valid/,
          times: 3,
          prompt: [{ name: 'input', message: 'Enter input' }]
        },
        oraInstance
      );
      expect(spyFail).toHaveBeenCalled();
      expect(spyFatal).toHaveBeenCalled();
      expect(spyExit).toHaveBeenCalledWith(1);
    });
    test('should handle error pattern', async () => {
      await expect(
        promptTolerateSeveralTimes(
          {
            pattern: {},
            times: 3,
            prompt: [{ name: 'input', message: 'Enter input' }]
          },
          oraInstance
        )
      ).rejects.toThrow("param 'pattern' must be a regular expression!");
    });

    test('should handle error processAfterPrompt', async () => {
      await expect(
        promptTolerateSeveralTimes(
          {
            processAfterPrompt: {},
            times: 3,
            prompt: [{ name: 'input', message: 'Enter input' }]
          },
          oraInstance
        )
      ).rejects.toThrow("Param 'processAfterPrompt' must be a function!");
    });

    test('should handle no pattern', async () => {
      inquirer.prompt.mockImplementation(() => {
        throw new Error();
      });
      await promptTolerateSeveralTimes(
        {
          times: 3,
          prompt: [{ name: 'input', message: 'Enter input' }]
        },
        oraInstance
      );
      const spyFail = jest.spyOn(oraInstance, 'fail');
      expect(spyFail).toHaveBeenCalledWith('Failed');
    });
  });

  describe('getTxResult', () => {
    let aelf;

    beforeEach(() => {
      aelf = { chain: { getTxResult: jest.fn() } };
    });

    test('should return tx result when Status is MINED', async () => {
      aelf.chain.getTxResult.mockResolvedValueOnce({ Status: 'MINED' });
      const tx = await getTxResult(aelf, 'txId');
      expect(tx).toEqual({ Status: 'MINED' });
    });

    test('should throw error if Status is not MINED after retries', async () => {
      aelf.chain.getTxResult.mockResolvedValue({ Status: 'PENDING' });
      const tx = await getTxResult(aelf, 'txId');
      expect(tx).toEqual({ Status: 'PENDING' });
    });

    test('should retry if Status is PENDING', async () => {
      aelf.chain.getTxResult.mockResolvedValueOnce({ Status: 'PENDING' }).mockResolvedValueOnce({ Status: 'MINED' });
      const tx = await getTxResult(aelf, 'txId');
      expect(tx).toEqual({ Status: 'MINED' });
    });

    test('should retry if Status is FAILED', async () => {
      aelf.chain.getTxResult.mockResolvedValueOnce({ Status: 'FAILED' });
      await expect(getTxResult(aelf, 'txId')).rejects.toEqual({ Status: 'FAILED' });
    });
  });

  describe('parseJSON', () => {
    test('should correctly parse JSON', function () {
      expect(parseJSON('{"key": "value"}')).toEqual({ key: 'value' });
      expect(parseJSON('invalid')).toBe('invalid');
      expect(parseJSON('')).toBe('');
    });
  });

  describe('randomId', () => {
    it('should generate a random UUID without dashes', function () {
      const uuid = randomId();
      expect(typeof uuid).toBe('string');
      expect(uuid.length).toBe(32);
    });
  });

  describe('getParams', () => {
    let oraInstance;
    const aelf = new AElf(new AElf.providers.HttpProvider(endpoint));
    const contractAddress = '2cVQrFiXNaedBYmUrovmUV2jcF9Hf6AXbh12gWsD4P49NaX99y';
    const wallet = AElf.wallet.getWalletByPrivateKey('9a2c6023e8b2221f4b02f4ccc5128392c1bd968ae45a42fa62848d793fff148f');
    beforeEach(() => {
      oraInstance = {
        start: jest.fn(),
        succeed: jest.fn(),
        fail: jest.fn()
      };
    });
    test('should get parameters by method', async () => {
      const contractInstance = await getContractInstance(contractAddress, aelf, wallet, oraInstance);
      const method = getMethod('GetProposal', contractInstance);
      inquirer.prompt.mockResolvedValue({ value: 'proposal' });
      const params = await getParams(method);
      expect(params).toBe('proposal');
    });

    test('should get parameters by method with not special params', async () => {
      const contractInstance = await getContractInstance(contractAddress, aelf, wallet, oraInstance);
      //   console.log(Object.keys(contractInstance));
      const method = getMethod('GetMethodFee', contractInstance);
      inquirer.prompt.mockResolvedValue({ value: 'method fee' });
      const params = await getParams(method);
      expect(params).toEqual({ value: 'method fee' });
    });
  });

  describe('deserializeLogs', () => {
    let oraInstance;
    const aelf = new AElf(new AElf.providers.HttpProvider(endpoint));
    beforeEach(() => {
      oraInstance = {
        start: jest.fn(),
        succeed: jest.fn(),
        fail: jest.fn()
      };
    });
    test('test deserialize log', async () => {
      const logs = [
        {
          Address: 'ELF_2sGZFRtqQ57F55Z2KvhmoozKrf7ik2htNVQawEAo3Vyvcx9Qwr_tDVW',
          Name: '.aelf.Hash',
          NonIndexed: 'CgNFTEYQoI/hGQ=='
        }
      ];
      const result = await deserializeLogs(aelf, logs);
      expect(result).toEqual(['454c46']);
    }, 40000);
    test('test deserialize log with VirtualTransactionCreated', async () => {
      const logs = [
        {
          Address: '238X6iw1j8YKcHvkDYVtYVbuYk2gJnK8UoNpVCtssynSpVC8hb',
          Name: 'VirtualTransactionCreated',
          Indexed: [
            'CiIKIA8J04pLJGNHl4y2KWuBJipdXjtJ2ForrSRRuRx9w2LY',
            'EiIKIAR/b9iJa/+kT2+h9XAdQE0UX9wFZogfPtn9YvtlCnB2',
            'GiIKICeR6ZKlfyjnWhHxOvLArsiw6zXS8EjULrqJAckuA3jc',
            'IghUcmFuc2Zlcg==',
            'MiIKICWmXUMWhKDuXFdYz8/uF7ze4kC5r3i7boxM5Dj+RE4G'
          ],
          NonIndexed: 'KjAKIgogIKCTibOwFJNFp0zUNEXymkyazYKz8LLwLqOZxEqKRF0SA09NSRiA0NvD9AI='
        }
      ];
      const result = await deserializeLogs(aelf, logs);
      expect(result).toEqual([
        {
          from: '2ytdtA2PDX7VLYWkqf36MQQ8wUtcXWRdpovX7Wxy8tJZXumaY',
          methodName: 'Transfer',
          params: 'CiIKICCgk4mzsBSTRadM1DRF8ppMms2Cs/Cy8C6jmcRKikRdEgNPTUkYgNDbw/QC',
          signatory: 'HaiUnezHpBieiVZNuyQV4uLFspYDGxsEwt8wSFYqGSpXY3CzJ',
          to: 'JRmBduh4nXWi1aXgdUsj5gJrzeZb2LxmrAbf7W99faZSvoAaE',
          virtualHash: '0f09d38a4b246347978cb6296b81262a5d5e3b49d85a2bad2451b91c7dc362d8'
        }
      ]);
    });
    test('test deserialize log with empty NonIndexed', async () => {
      const logs = [
        {
          Indexed: ['CiIKIPoq3y6L7T71F5BynCBXISeMFKrCt4QayljkLE4U8St4', 'EiIKIKt0P1P3+jKuU4Y5rSGOfzleHFw0YXn5eNM88jWfUWYR'],
          Name: '.aelf.Hash',
          Address: 'ELF_2sGZFRtqQ57F55Z2KvhmoozKrf7ik2htNVQawEAo3Vyvcx9Qwr_tDVW'
        }
      ];
      const result = await deserializeLogs(aelf, logs);
      expect(result).toEqual(['0a20fa2adf2e8bed3ef51790729c205721278c14aac2b7841aca58e42c4e14f12b78']);
    });
    test('test deserialize log with empty logs', async () => {
      const result = await deserializeLogs(aelf);
      expect(result).toEqual(null);
    });
  });
});
