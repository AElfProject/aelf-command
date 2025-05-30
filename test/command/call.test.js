import { Command } from 'commander';
import AElf from 'aelf-sdk';
import inquirer from 'inquirer';
import { CallCommand } from '../../src/command';
import { callCommandUsages, callCommandParameters } from '../../src/utils/constants.js';
import { userHomeDir } from '../../src/utils/userHomeDir.js';
import { logger } from '../../src/utils/myLogger.js';
import { endpoint as endPoint, account, password, dataDir, csvDir, jsonDir } from '../constants.js';

const sampleRc = { getConfigs: jest.fn() };
jest.mock('../../src/utils/myLogger');

describe('CallCommand', () => {
  let callCommand;
  let backup, mockOraInstance;
  const aelf = new AElf(new AElf.providers.HttpProvider(endPoint));
  const wallet = AElf.wallet.getWalletByPrivateKey('943df6d39fd1e1cc6ae9813e54f7b9988cf952814f9c31e37744b52594cb4096');
  const address = 'ASh2Wt7nSEmYqnGxPPzp4pnVDU4uhj1XW9Se5VeZcX2UDdyjx';

  beforeEach(() => {
    backup = inquirer.prompt;
    mockOraInstance = {
      start: jest.fn(),
      succeed: jest.fn(),
      fail: jest.fn()
    };
    callCommand = new CallCommand(sampleRc);
    callCommand.oraInstance = mockOraInstance;
  });
  test('with default params', async () => {
    expect(callCommand.commandName).toBe('call');
    expect(callCommand.parameters).toEqual(callCommandParameters);
    expect(callCommand.description).toBe('Call a read-only method on a contract.');
    expect(callCommand.options).toEqual([]);
    expect(callCommand.usage).toEqual(callCommandUsages);
    expect(callCommand.rc).toEqual(sampleRc);
  });
  test('should call method successfully', async () => {
    const tokenContract = await aelf.chain.contractAt(address, wallet);
    const method = tokenContract.GetTokenInfo;
    const params = {
      symbol: 'ELF'
    };
    const result = await callCommand.callMethod(method, params);
    expect(mockOraInstance.start).toHaveBeenCalledWith('Calling method...');
    expect(mockOraInstance.succeed).toHaveBeenCalledWith('Calling method successfully!');
  });
  test('should process address after prompt', async () => {
    const answerInput = { contractAddress: address };
    const result = await callCommand.processAddressAfterPrompt(aelf, wallet, answerInput);
    expect(result.address).toBe(address);
  });
  test('should run with valid inputs', async () => {
    const commander = new Command();
    commander.option('-e, --endpoint <URI>', 'The URI of an AElf node. Eg: http://127.0.0.1:8000');
    commander.option('-a, --account <account>', 'The address of AElf wallet');
    commander.option('-p, --password <password>', 'The password of encrypted keyStore');
    commander.option(
      '-d, --datadir <directory>',
      `The directory that contains the AElf related files. Default to be ${userHomeDir}/aelf`
    );
    commander.parse([process.argv[0], '', 'call', '-e', endPoint, '-a', account, '-p', password, '-d', dataDir]);
    await callCommand.run(
      commander,
      'AElf.ContractNames.Token',
      'GetTokenInfo',
      JSON.stringify({
        symbol: 'ELF'
      })
    );
    expect(logger.info).toHaveBeenCalled();
  });
  test('should run without account', async () => {
    const commander = new Command();
    commander.option('-e, --endpoint <URI>', 'The URI of an AElf node. Eg: http://127.0.0.1:8000');
    commander.option('-a, --account <account>', 'The address of AElf wallet');
    commander.option('-p, --password <password>', 'The password of encrypted keyStore');
    commander.option(
      '-d, --datadir <directory>',
      `The directory that contains the AElf related files. Default to be ${userHomeDir}/aelf`
    );
    commander.parse([process.argv[0], '', 'call', '-e', endPoint, '-d', dataDir]);
    await callCommand.run(
      commander,
      'AElf.ContractNames.Token',
      'GetTokenInfo',
      JSON.stringify({
        symbol: 'ELF'
      })
    );
    expect(logger.info).toHaveBeenCalled();
  });
  test('should run without contractAddress', async () => {
    inquirer.prompt = questions => Promise.resolve('');
    const commander = new Command();
    commander.option('-e, --endpoint <URI>', 'The URI of an AElf node. Eg: http://127.0.0.1:8000');
    commander.option('-a, --account <account>', 'The address of AElf wallet');
    commander.option('-p, --password <password>', 'The password of encrypted keyStore');
    commander.option(
      '-d, --datadir <directory>',
      `The directory that contains the AElf related files. Default to be ${userHomeDir}/aelf`
    );
    commander.parse([process.argv[0], '', 'call', '-e', endPoint, '-a', account, '-p', password, '-d', dataDir]);
    await callCommand.run(commander);
    expect(logger.fatal).toHaveBeenCalled();
  });

  test('should run without params', async () => {
    inquirer.prompt = questions => Promise.resolve({ symbol: 'ELF' });
    const commander = new Command();
    commander.option('-e, --endpoint <URI>', 'The URI of an AElf node. Eg: http://127.0.0.1:8000');
    commander.option('-a, --account <account>', 'The address of AElf wallet');
    commander.option('-p, --password <password>', 'The password of encrypted keyStore');
    commander.option(
      '-d, --datadir <directory>',
      `The directory that contains the AElf related files. Default to be ${userHomeDir}/aelf`
    );
    commander.parse([process.argv[0], '', 'call', '-e', endPoint, '-a', account, '-p', password, '-d', dataDir]);
    await callCommand.run(commander, 'AElf.ContractNames.Token', 'GetTokenInfo');
    expect(logger.info).toHaveBeenCalled();
  });

  test('should run with csv', async () => {
    inquirer.prompt = questions =>
      Promise.resolve({
        symbol: 'ELF',
        owner: 'GyQX6t18kpwaD9XHXe1ToKxfov8mSeTLE9q9NwUAeTE8tULZk'
      });
    const commander = new Command();
    commander.option('-e, --endpoint <URI>', 'The URI of an AElf node. Eg: http://127.0.0.1:8000');
    commander.option('-a, --account <account>', 'The address of AElf wallet');
    commander.option('-p, --password <password>', 'The password of encrypted keyStore');
    commander.option(
      '-d, --datadir <directory>',
      `The directory that contains the AElf related files. Default to be ${userHomeDir}/aelf`
    );
    commander.option('-c, --csv <csv>', 'The location of the CSV file containing the parameters.');
    commander.parse([process.argv[0], '', 'call', '-e', endPoint, '-a', account, '-p', password, '-d', dataDir, '-c', csvDir]);
    await callCommand.run(commander, 'AElf.ContractNames.Token', 'GetBalance');
    expect(logger.info).toHaveBeenCalled();
  });

  test('should run with json', async () => {
    inquirer.prompt = questions =>
      Promise.resolve({
        symbol: 'ELF',
        owner: 'GyQX6t18kpwaD9XHXe1ToKxfov8mSeTLE9q9NwUAeTE8tULZk'
      });
    const commander = new Command();
    commander.option('-e, --endpoint <URI>', 'The URI of an AElf node. Eg: http://127.0.0.1:8000');
    commander.option('-a, --account <account>', 'The address of AElf wallet');
    commander.option('-p, --password <password>', 'The password of encrypted keyStore');
    commander.option(
      '-d, --datadir <directory>',
      `The directory that contains the AElf related files. Default to be ${userHomeDir}/aelf`
    );
    commander.option('-j, --json <json>', 'The location of the JSON file containing the parameters.');
    commander.parse([process.argv[0], '', 'call', '-e', endPoint, '-a', account, '-p', password, '-d', dataDir, '-j', jsonDir]);
    await callCommand.run(commander, 'AElf.ContractNames.Token', 'GetBalance');
    expect(logger.info).toHaveBeenCalled();
  });

  test('should run with invalid parameters', async () => {
    inquirer.prompt = backup;
    callCommand = new CallCommand(sampleRc, 'call', 'Call a read-only method on a contract.', [
      ...callCommandParameters,
      {
        type: 'input',
        name: 'fake-prop',
        message: 'This is a fake prop',
        suffix: ':'
      }
    ]);
    const commander = new Command();
    commander.option('-e, --endpoint <URI>', 'The URI of an AElf node. Eg: http://127.0.0.1:8000');
    commander.option('-a, --account <account>', 'The address of AElf wallet');
    commander.option('-p, --password <password>', 'The password of encrypted keyStore');
    commander.option(
      '-d, --datadir <directory>',
      `The directory that contains the AElf related files. Default to be ${userHomeDir}/aelf`
    );
    commander.parse([process.argv[0], '', 'call', '-e', endPoint, '-a', account, '-p', password, '-d', dataDir]);
    await callCommand.run(
      commander,
      'AElf.ContractNames.Token',
      'GetTokenInfo',
      JSON.stringify({
        symbol: 'ELF'
      })
    );
    expect(logger.info).toHaveBeenCalled();
  });

  afterEach(() => {
    inquirer.prompt = backup;
  });
});

describe('run call method when only account is provided', () => {
  let callCommand;
  let mockCommander;
  let mockOraInstance;
  let mockInquirer;
  let getWallet;
  let AElf;
  beforeEach(() => {
    jest.resetModules();
    jest.mock('inquirer');
    jest.mock('../../src/utils/wallet.js');
    jest.mock('aelf-sdk');
    mockInquirer = require('inquirer');
    mockOraInstance = {
      start: jest.fn(),
      succeed: jest.fn(),
      fail: jest.fn()
    };
    getWallet = require('../../src/utils/wallet.js').getWallet;
    AElf = require('aelf-sdk');
    mockCommander = {
      name: 'call',
      opts: jest.fn(() => ({
        account,
        endpoint: endPoint,
        datadir: dataDir,
        password: null
      }))
    };

    callCommand = new CallCommand(sampleRc, 'call', 'Test description', [], [], []);
    callCommand.oraInstance = mockOraInstance;
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  test('should prompt for password when only account is provided', async () => {
    // Mock getWallet to ensure it's called correctly
    getWallet.mockReturnValueOnce({
      address: 'testAddress'
    });

    // Mock AElf instance creation
    AElf.providers.HttpProvider.mockImplementation(() => ({
      send: jest.fn()
    }));
    inquirer.prompt = jest.fn();
    // Run the method
    await callCommand.run(mockCommander);
    // Assertions
    expect(inquirer.prompt).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'password',
        name: 'password',
        message: 'Please enter your password:',
        mask: '*'
      })
    );
  });
});
