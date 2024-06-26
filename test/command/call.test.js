import { Command } from 'commander';
import path from 'path';
import AElf from 'aelf-sdk';
import { CallCommand } from '../../src/command';
import { callCommandUsages, callCommandParameters } from '../../src/utils/constants.js';
import { getContractInstance } from '../../src/utils/utils.js';
import { userHomeDir } from '../../src/utils/userHomeDir.js';
import { logger } from '../../src/utils/myLogger.js';
import inquirer from 'inquirer';

const sampleRc = { getConfigs: jest.fn() };
jest.mock('../../src/utils/myLogger');

describe('CallCommand', () => {
  let callCommand;
  let mockOraInstance;
  const endPoint = 'https://tdvw-test-node.aelf.io/';
  const aelf = new AElf(new AElf.providers.HttpProvider(endPoint));
  const wallet = AElf.wallet.getWalletByPrivateKey('943df6d39fd1e1cc6ae9813e54f7b9988cf952814f9c31e37744b52594cb4096');
  const address = 'ASh2Wt7nSEmYqnGxPPzp4pnVDU4uhj1XW9Se5VeZcX2UDdyjx';
  const account = 'GyQX6t18kpwaD9XHXe1ToKxfov8mSeTLE9q9NwUAeTE8tULZk';
  const password = '1234*Qwer';
  const dataDir = path.resolve(__dirname, '../dataDir/aelf');
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
