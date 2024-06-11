import inquirer from 'inquirer';
import path from 'path';
import ora from 'ora';
import asyncValidator from 'async-validator';
import BaseSubCommand from '../../src/command/baseSubCommand.js';
import { logger } from '../../src/utils/myLogger.js';
import RC from '../../src/rc/index.js'
import { strictGlobalOptionValidatorDesc } from '../../src/utils/constants.js'
import { Command } from 'commander';


const commandBin = path.resolve(__dirname,'../bin/aelf-command.js');

jest.mock('inquirer');
jest.mock('../../src/utils/myLogger');
jest.mock('async-validator');


// Sample data for testing
const sampleCommandName = 'get-chain-status';
const sampleParameters = [{ name: 'param1',required: true }];
const sampleDescription = 'Get the current chain status';
const sampleOptions = [{
    flag: '-c, --cipher [cipher]',
    name: 'cipher',
    description: 'Which cipher algorithm to use, default to be aes-128-ctr'
}];
const sampleUsage = ['example usage'];
const sampleRc = { getConfigs: jest.fn() };
const sampleValidatorDesc = { testOption: { required: true } };
const sampleOraOptions = { text: 'Loading...' };

describe('BaseSubCommand',() => {
    let baseSubCommand;
    beforeEach(() => {
        baseSubCommand = new BaseSubCommand(
            sampleCommandName,
            sampleParameters,
            sampleDescription,
            sampleOptions,
            sampleUsage,
            sampleRc,
            sampleValidatorDesc,
            sampleOraOptions
        );
        inquirer.prompt.mockResolvedValue({});
    });
    test('should initialize with provided parameters',() => {
        expect(baseSubCommand.commandName).toBe(sampleCommandName);
        expect(baseSubCommand.parameters).toEqual(sampleParameters);
        expect(baseSubCommand.description).toBe(sampleDescription);
        expect(baseSubCommand.options).toEqual(sampleOptions);
        expect(baseSubCommand.usage).toEqual(sampleUsage);
        expect(baseSubCommand.rc).toBe(sampleRc);
        expect(baseSubCommand.oraInstance.text).toBe(sampleOraOptions.text);
        expect(baseSubCommand.validatorDesc).toEqual(sampleValidatorDesc)
    });
    test('should set custom prompts flag',() => {
        baseSubCommand.setCustomPrompts(true);
        expect(baseSubCommand.customPrompts).toBe(true);
    });

    test('should create command with parameters and options',async () => {
        const commander = {
            command: jest.fn().mockReturnThis(),
            description: jest.fn().mockReturnThis(),
            option: jest.fn().mockReturnThis(),
            action: jest.fn().mockReturnThis(),
            on: jest.fn().mockReturnThis()
        };
        baseSubCommand.init(commander);
        expect(commander.command).toHaveBeenCalledWith(`${sampleCommandName} <param1>`);
        expect(commander.description).toHaveBeenCalledWith(sampleDescription);
        expect(commander.option).toHaveBeenCalledWith("-c, --cipher [cipher]","Which cipher algorithm to use, default to be aes-128-ctr");
        expect(commander.action).toHaveBeenCalled();
        expect(commander.on).toHaveBeenCalledWith('--help',expect.any(Function));
    });
    test('getParameters should return formatted parameter string',() => {
        baseSubCommand = new BaseSubCommand(
            sampleCommandName,
            [{ name: 'param1',required: true },
            { name: 'param2' },
            { name: 'param3',required: true,extraName: ['alias1','alias2'] },]
        );
        const parameters = baseSubCommand.getParameters();
        expect(parameters).toBe('<param1> [param2] <param3|alias1|alias2>');
    });
    test('should handle validation errors',() => {
        const error = { errors: [{ message: 'Validation error' }] };
        jest.spyOn(process,'exit').mockImplementation(() => { });
        baseSubCommand.handleUniOptionsError(error);
        expect(logger.error).toHaveBeenCalledWith('Validation error\n');
        expect(process.exit).toHaveBeenCalledWith(1);
    });

    test('should exit without errors',() => {
        const error = {};
        jest.spyOn(process,'exit').mockImplementation(() => { });
        baseSubCommand.handleUniOptionsError(error);
        expect(process.exit).toHaveBeenCalledWith(1);
    });
    test('should normalize configuration object',() => {
        const config = { 'test-option': 'true','another-option': 'false','nullOption': null };
        const normalizedConfig = BaseSubCommand.normalizeConfig(config);
        expect(normalizedConfig).toEqual({ testOption: true,anotherOption: false });
    });

    test('should parse boolean values correctly',() => {
        expect(BaseSubCommand.parseBoolean('true')).toBe(true);
        expect(BaseSubCommand.parseBoolean('false')).toBe(false);
        expect(BaseSubCommand.parseBoolean('someValue')).toBe('someValue');
    });

    test('should return unified configuration from commander',() => {
        const commander = { opts: () => ({ password: '1234',endpoint: 'https://aelf-test-node.aelf.io/' }) };
        const config = BaseSubCommand.getUniConfig(commander);
        expect(config).toEqual({ password: '1234',endpoint: 'https://aelf-test-node.aelf.io/' });
    });

    test('should validate options and return normalized subCommandOptions',async () => {
        const commander = { opts: () => ({ password: '1234',endpoint: 'https://aelf-test-node.aelf.io/' }) };
        const args = ['paramValue',{ cipher: 'true' }];
        baseSubCommand.rc.getConfigs.mockResolvedValue({ globalOption: 'value' });
        inquirer.prompt.mockResolvedValue({ testOption: 'true' });
        const result = await baseSubCommand.run(commander,...args);
        expect(baseSubCommand.rc.getConfigs).toHaveBeenCalled();
        expect(baseSubCommand.validator.validate).toHaveBeenCalled();
        expect(result).toEqual({
            localOptions: { cipher: 'true' },
            options: { globalOption: 'value',testOption: 'true',"endpoint": "https://aelf-test-node.aelf.io/","password": "1234" },
            subOptions: { param1: 'paramValue' }
        });
        // customPrompts true
        baseSubCommand.setCustomPrompts(true);
        const result2 = await baseSubCommand.run(commander,...args);
        expect(result2).toEqual({
            localOptions: { cipher: 'true' },
            options: { globalOption: 'value',testOption: 'true',"endpoint": "https://aelf-test-node.aelf.io/","password": "1234" },
            subOptions: { param1: 'paramValue' }
        });
    });
    test('fail to run validate',async () => {
        const originalValidate = asyncValidator.prototype.validate;
        asyncValidator.prototype.validate = jest.fn().mockRejectedValue(new Error('Validation error'));
        baseSubCommand = new BaseSubCommand(
            sampleCommandName,
            sampleParameters,
            sampleDescription,
            sampleOptions,
            sampleUsage,
            sampleRc,
            sampleValidatorDesc,
            sampleOraOptions
        );
        const mockExit = jest.spyOn(process,'exit').mockImplementation(() => { });
        const commander = { opts: () => ({ password: '1234',endpoint: 'https://aelf-test-node.aelf.io/' }) };
        const args = ['paramValue',{ cipher: 'true' }];
        baseSubCommand.rc.getConfigs.mockResolvedValue({ globalOption: 'value' });
        inquirer.prompt.mockResolvedValue({ testOption: 'true' });
        await baseSubCommand.run(commander,...args);
        expect(mockExit).toHaveBeenCalledWith(1);
        // Clean up
        asyncValidator.prototype.validate = originalValidate; // Restore original validate method
        // Clean up
        mockExit.mockRestore();
    })
    test('run without args',async () => {
        const commander = { opts: () => ({ password: '1234',endpoint: 'https://aelf-test-node.aelf.io/' }) };
        const args = [undefined];
        baseSubCommand.rc.getConfigs.mockResolvedValue({ globalOption: 'value' });
        inquirer.prompt.mockResolvedValue({ testOption: 'true' });
        const result = await baseSubCommand.run(commander,...args);
        expect(result).toEqual({
            localOptions: { cipher: undefined },
            options: { globalOption: 'value',testOption: 'true',"endpoint": "https://aelf-test-node.aelf.io/","password": "1234" },
            subOptions: { testOption: true }
        });
    });
    test('makeExamples should return formatted examples',() => {
        const examples = baseSubCommand.makeExamples();
        expect(examples).toEqual([
            'aelf-command get-chain-status example usage',
        ]);
    });
});

describe('BaseSubCommand with default params',() => {
    let baseSubCommand;
    beforeEach(() => {
        baseSubCommand = new BaseSubCommand(
            sampleCommandName,
        );
        inquirer.prompt.mockResolvedValue({});
    });
    test('with default params',() => {
        expect(baseSubCommand.commandName).toBe(sampleCommandName);
        expect(baseSubCommand.parameters).toEqual([]);
        expect(baseSubCommand.description).toBe(undefined);
        expect(baseSubCommand.options).toEqual([]);
        expect(baseSubCommand.usage).toEqual([]);
        expect(baseSubCommand.rc).toBe(undefined);
        expect(baseSubCommand.oraInstance.text).toBe("AElf loading...");
        expect(baseSubCommand.validatorDesc).toEqual(strictGlobalOptionValidatorDesc)
    })
    test('should execute action callback',() => {
        baseSubCommand = new BaseSubCommand(
            sampleCommandName,
            undefined,
            sampleDescription,
        );

        const commander = new Command();
        baseSubCommand.run = jest.fn();
        commander.option('-e, --endpoint <URI>','The URI of an AElf node. Eg: http://127.0.0.1:8000');
        baseSubCommand.init(commander);
        commander.parse([process.argv[0],commandBin,'get-chain-status','-e','https://aelf-test-node.aelf.io/']);
        // Spy on the run method
        jest.spyOn(baseSubCommand,'run').mockResolvedValue('run called');
        // Expect the run method to have been called
        expect(baseSubCommand.run).toHaveBeenCalled();
    });
    test('should log examples on --help',() => {
        baseSubCommand = new BaseSubCommand(
            sampleCommandName,
            undefined,
            sampleDescription,
        );
        const commander = new Command();
        commander.exitOverride();
        // Setting up the commander help handler
        baseSubCommand.init(commander);
        expect(() => commander.parse([process.argv[0],commandBin,'get-chain-status','--help'])).toThrow()
    });
    test('run with no required validatorDesc',async () => {
        baseSubCommand = new BaseSubCommand(
            sampleCommandName,
            undefined,
            sampleDescription,
            sampleOptions,
            sampleUsage,
            sampleRc,
            { account: { required: true } }
        );
        const args = [undefined];
        baseSubCommand.rc.getConfigs.mockResolvedValue({ globalOption: 'value' });
        inquirer.prompt.mockResolvedValue({ testOption: 'true' });
        const commander = { opts: () => ({ password: '1234',endpoint: 'https://aelf-test-node.aelf.io/' }) };
        const result = await baseSubCommand.run(commander,...args);
        expect(result).toEqual({
            localOptions: { cipher: undefined },
            options: { globalOption: 'value',testOption: 'true',"endpoint": "https://aelf-test-node.aelf.io/","password": "1234" },
            subOptions: {}
        });
    });
})