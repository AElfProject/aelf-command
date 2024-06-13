import ora from 'ora';
import path from 'path';
import { Command } from 'commander';
import ConfigCommand from '../../src/command/config.js';
import { logger } from '../../src/utils/myLogger.js';

jest.mock('ora');
jest.mock('inquirer');
jest.mock('../../src/utils/myLogger.js');

describe('ConfigCommand', () => {
  let configCommand;
  let mockOraInstance;
  const sampleRc = {
    getConfigs: jest.fn(),
    getOption: jest.fn(),
    saveOption: jest.fn(),
    getFileConfigs: jest.fn(),
    deleteConfig: jest.fn()
  };
  const endPoint = 'https://tdvw-test-node.aelf.io/';
  const dataDir = path.resolve(__dirname, '../datadir/aelf');
  beforeEach(() => {
    mockOraInstance = {
      start: jest.fn(),
      succeed: jest.fn(),
      fail: jest.fn()
    };
    ora.mockReturnValue(mockOraInstance);
    configCommand = new ConfigCommand(sampleRc);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  test('should validate parameters successfully', async () => {
    const rule = {
      key: { type: 'string', required: true }
    };
    const parameters = { key: 'someKey' };
    await expect(configCommand.validateParameters(rule, parameters)).resolves.not.toThrow();
  });
  test('should handle invalid parameters', async () => {
    const rule = {
      key: { type: 'string', required: true }
    };
    const parameters = {};
    jest.spyOn(configCommand, 'handleUniOptionsError').mockImplementation(() => {});

    await configCommand.validateParameters(rule, parameters);
    expect(configCommand.handleUniOptionsError).toHaveBeenCalled();
  });
  it('should handle list correctly', () => {
    const content = {
      key1: 'value1',
      key2: '',
      key3: 'value3'
    };
    const result = configCommand.handleList(content);
    expect(result).toBe('key1=value1\nkey3=value3\n');
  });
  it('should run with flag "get"', async () => {
    configCommand.rc.getConfigs.mockReturnValue({
      endpoint: endPoint,
      datadir: dataDir
    });
    configCommand.rc.getOption.mockReturnValue(endPoint);
    const commander = new Command();
    await configCommand.run(commander, 'get', 'endpoint');
    expect(logger.info).toHaveBeenCalledWith(endPoint);
  });

  it('should run with flag "set"', async () => {
    configCommand.rc.getConfigs.mockReturnValue({
      endpoint: endPoint,
      datadir: dataDir
    });
    configCommand.rc.saveOption.mockReturnValue(endPoint);
    const commander = new Command();
    await configCommand.run(commander, 'set', 'endpoint', endPoint);
    expect(mockOraInstance.succeed).toHaveBeenCalledWith('Succeed!');
  });

  it('should run with flag "list"', async () => {
    configCommand.rc.getConfigs.mockReturnValue({
      endpoint: endPoint,
      datadir: dataDir
    });
    configCommand.rc.getFileConfigs.mockReturnValue('endpoint=https://tdvw-test-node.aelf.io/');
    const commander = new Command();
    await configCommand.run(commander, 'list');
    expect(configCommand.rc.getFileConfigs).toHaveBeenCalled();
  });

  it('should run with flag "delete"', async () => {
    configCommand.rc.getConfigs.mockReturnValue({
      endpoint: endPoint,
      datadir: dataDir
    });
    configCommand.rc.deleteConfig.mockReturnValue(endPoint);
    const commander = new Command();
    await configCommand.run(commander, 'delete', 'endpoint');
    expect(mockOraInstance.succeed).toHaveBeenCalledWith('Succeed!');
  });

  //   it('should run with flag "list"', async () => {
  //     const subOptions = { flag: 'list' };
  //     jest.spyOn(configCommand, 'validateParameters').mockResolvedValue();
  //     configCommand.rc.getFileConfigs.mockReturnValue({ key1: 'value1' });

  //     await configCommand.run({} /* commander */, subOptions);

  //     expect(configCommand.rc.getFileConfigs).toHaveBeenCalled();
  //     expect(console.log).toHaveBeenCalledWith('\nkey1=value1\n');
  //   });

  //   it('should run with flag "delete"', async () => {
  //     const subOptions = { flag: 'delete', key: 'testKey' };
  //     jest.spyOn(configCommand, 'validateParameters').mockResolvedValue();

  //     await configCommand.run({} /* commander */, subOptions);

  //     expect(configCommand.rc.deleteConfig).toHaveBeenCalledWith('testKey');
  //     expect(mockOraInstance.succeed).toHaveBeenCalledWith('Succeed!');
  //   });

  //   it('should handle invalid flag', async () => {
  //     const subOptions = { flag: 'invalid' };
  //     jest.spyOn(configCommand, 'validateParameters').mockResolvedValue();

  //     await expect(configCommand.run({} /* commander */, subOptions)).rejects.toThrow(
  //       'invalid is not a valid flag, must one of set, get, list, delete'
  //     );
  //   });

  //   it('should handle validation error', async () => {
  //     const subOptions = { flag: 'get', key: 'testKey' };
  //     const error = new Error('Validation failed');
  //     jest.spyOn(configCommand, 'validateParameters').mockRejectedValue(error);

  //     await configCommand.run({} /* commander */, subOptions);

  //     expect(mockOraInstance.fail).toHaveBeenCalledWith('Failed!');
  //     expect(logger.error).toHaveBeenCalledWith(error);
  //   });
});
