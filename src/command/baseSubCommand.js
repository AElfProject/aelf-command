import { interopImportCJSDefault } from 'node-cjs-interop';
import asyncValidator from 'async-validator';
const Schema = interopImportCJSDefault(asyncValidator);

import inquirer from 'inquirer';
import ora from 'ora';
import { logger } from '../utils/myLogger.js';
import { camelCase } from '../utils/utils.js';
import { globalOptionsPrompts, strictGlobalOptionValidatorDesc } from '../utils/constants.js';

// Schema.warning = () => {}; // TypeError: Cannot add property warning, object is not extensible

const defaultOraOptions = {
  text: 'AElf loading...'
};
/**
 * @typedef {import('commander').Command} Command
 * @typedef {import('ora').Options} OraOptions
 * @typedef {import('../../types/rc/index.js').default} Registry
 */

/**
 * @class
 */
class BaseSubCommand {
  /**
   * @param {string} commandName sub command name
   * @param {{ [key: string]: any }[]} parameters sub command parameters
   * @param {string} description sub command description
   * @param {{ [key: string]: any }[]} options sub command options
   * @param {string[]} usage make examples
   * @param {Registry} rc instance of Registry
   * @param {{ [key: string]: any }} validatorDesc rules of async-validator
   * @param {{ [key: string]: any }} oraOptions an ora options
   */
  constructor(
    commandName,
    parameters = [],
    description,
    options = [],
    usage = [],
    rc,
    validatorDesc = strictGlobalOptionValidatorDesc,
    oraOptions = defaultOraOptions
  ) {
    this.commandName = commandName;
    this.parameters = parameters;
    this.description = description;
    this.options = options;
    this.validatorDesc = {};
    this.usage = usage;
    this.rc = rc;
    this.oraInstance = ora(oraOptions);
    this.customPrompts = false;
    Object.entries(validatorDesc).forEach(([key, value]) => {
      this.validatorDesc[key] = {
        ...strictGlobalOptionValidatorDesc[key],
        ...value
      };
    });
  }
  /**
   * Sets custom prompts.
   * @param {any} val - The value to set for custom prompts.
   */
  setCustomPrompts(val) {
    this.customPrompts = val;
  }
  /**
   * Initializes the sub command with commander.
   * @param {Command} commander - The commander instance.
   */
  init(commander) {
    let command = commander.command(`${this.commandName} ${this.getParameters()}`).description(this.description);

    for (const { flag, description } of this.options) {
      command = command.option(flag, description);
    }
    command
      .action(async (...args) => {
        await this.run(commander, ...args);
        this.oraInstance.stop();
      })
      .on('--help', () => {
        // todo: chalk
        console.info('');
        console.info('Examples:');
        console.info('');
        console.info(`${this.makeExamples().join('\n')}`);
      });
  }

  /**
   * Retrieves parameters as a string.
   * @returns {string} Parameters string.
   */
  getParameters() {
    return this.parameters
      .map(v => {
        const { name, required = false, extraName = [] } = v;
        const symbol = [name, ...extraName].join('|');
        return required ? `<${symbol}>` : `[${symbol}]`;
      })
      .join(' ');
  }

  /**
   * Handles errors related to universal options.
   * @param {any} error - The error to handle.
   */
  handleUniOptionsError(error) {
    const { errors = [] } = error;
    // @ts-ignore
    logger.error(errors.reduce((acc, i) => `${acc}${i.message}\n`, ''));
    process.exit(1);
  }

  /**
   * Retrieves universal configuration.
   * @static
   * @param {Command} commander - The commander instance.
   * @returns {Record<string, any>} Universal configuration.
   */
  static getUniConfig(commander) {
    const result = {};
    ['password', 'endpoint', 'account', 'datadir'].forEach(v => {
      const options = commander.opts();
      if (options[v]) {
        result[v] = options[v];
      }
    });
    return result;
  }

  /**
   * Parses a boolean value.
   * @static
   * @param {any} val - The value to parse.
   * @returns {any} Parsed boolean value.
   */
  static parseBoolean(val) {
    if (val === 'true') {
      return true;
    }
    if (val === 'false') {
      return false;
    }
    return val;
  }

  /**
   * Normalizes configuration object.
   * @static
   * @param {any} obj - The configuration object to normalize.
   * @returns {Record<string, any>} Normalized configuration object.
   */
  static normalizeConfig(obj) {
    // dash to camel-case
    // 'true', 'false' to true, false
    const result = {};
    Object.entries(obj).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) {
        return;
      }
      result[camelCase(key)] = BaseSubCommand.parseBoolean(value);
    });
    return result;
  }
  /**
   * Runs the sub command.
   * @param {Command} commander - The commander instance.
   * @param {...any} args - Additional arguments.
   * @returns {Promise<{
   *   localOptions: { [key: string]: any },
   *   options: { [key: string]: any },
   *   subOptions: { [key: string]: any }
   * } | void>} Promise resolving to options or void.
   */
  async run(commander, ...args) {
    let subCommandOptions = {};
    args.slice(0, this.parameters.length).forEach((v, i) => {
      if (v !== undefined) {
        const { name, filter = val => val } = this.parameters[i];
        subCommandOptions[name] = filter(v);
      }
    });
    // sub command options
    const lastArg = args.slice(this.parameters.length)[0];
    const localOptions = {};
    this.options.forEach(({ name }) => {
      localOptions[name] = lastArg?.[name] || undefined;
    });
    const uniOptions = BaseSubCommand.getUniConfig(commander);
    // get options from global config and process.argv
    const rc = await this.rc.getConfigs();
    let options = BaseSubCommand.normalizeConfig({
      ...rc,
      ...uniOptions
    });

    const globalPrompts = globalOptionsPrompts.filter(
      prompt => this.validatorDesc[prompt.name]?.required && !options[prompt.name]
    );
    const globalPromptsAns = await inquirer.prompt(globalPrompts);
    options = {
      ...options,
      ...globalPromptsAns
    };
    this.validator = new Schema(this.validatorDesc);
    try {
      await this.validator.validate(options);
    } catch (e) {
      this.handleUniOptionsError(e);
    }
    subCommandOptions = BaseSubCommand.normalizeConfig(subCommandOptions);
    if (this.customPrompts) {
      // custom prompts process
      return {
        localOptions,
        options,
        subOptions: subCommandOptions
      };
    }
    const subOptionsLength = Object.keys(subCommandOptions).length;
    if (subOptionsLength < this.parameters.length) {
      const response = BaseSubCommand.normalizeConfig(await inquirer.prompt(this.parameters.slice(subOptionsLength)));
      subCommandOptions = {
        ...subCommandOptions,
        ...response
      };
    }
    return {
      localOptions,
      options,
      subOptions: subCommandOptions
    };
  }
  /**
   * Generates examples for usage.
   * @returns {string[]} Array of example strings.
   */
  makeExamples() {
    return this.usage.map(cmd => `aelf-command ${this.commandName} ${cmd}`);
  }
}

export default BaseSubCommand;
