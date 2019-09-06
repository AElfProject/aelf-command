/**
 * @file base sub command
 * @author atom-yang
 */
const Schema = require('async-validator/dist-node/index').default;
const inquirer = require('inquirer');
const ora = require('ora');
const { logger } = require('../utils/myLogger');
const { camelCase } = require('../utils/utils');
const { globalOptionsPrompts, strictGlobalOptionValidatorDesc } = require('../utils/constants');

Schema.warning = () => {};

const defaultOraOptions = {
  text: 'AElf loading...'
};

class BaseSubCommand {
  /**
   * @param {string} commandName sub command name
   * @param {Object[]} parameters sub command parameters
   * @param {string} description sub command description
   * @param {Object[]} options sub command options
   * @param {string[]} usage make examples
   * @param {Registry} rc instance of Registry
   * @param {Object} validatorDesc rules of async-validator
   * @param {Object} oraOptions an ora options
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

  setCustomPrompts(val) {
    this.customPrompts = val;
  }

  init(commander) {
    let command = commander.command(`${this.commandName} ${this.getParameters()}`).description(this.description);
    // eslint-disable-next-line no-restricted-syntax
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

  getParameters() {
    return this.parameters
      .map(v => {
        const { name, required = false, extraName = [] } = v;
        const symbol = [name, ...extraName].join('|');
        return required ? `<${symbol}>` : `[${symbol}]`;
      })
      .join(' ');
  }

  handleUniOptionsError(error) {
    const { errors = [] } = error;
    // todo: chalk
    logger.error(errors.reduce((acc, i) => `${acc}${i.message}\n`, ''));
    process.exit(1);
  }

  static getUniConfig(commander) {
    const result = {};
    ['password', 'endpoint', 'account', 'datadir'].forEach(v => {
      if (commander[v]) {
        result[v] = commander[v];
      }
    });
    return result;
  }

  static parseBoolean(val) {
    if (val === 'true') {
      return true;
    }
    if (val === 'false') {
      return false;
    }
    return val;
  }

  static normalizeConfig(obj) {
    // dash to camel-case
    // 'true', 'false' to true, false
    const result = {};
    Object.entries(obj).forEach(([key, value]) => {
      result[camelCase(key)] = BaseSubCommand.parseBoolean(value);
    });
    return result;
  }

  async run(commander, ...args) {
    let subCommandOptions = {};
    args.slice(0, this.parameters.length).forEach((v, i) => {
      if (v) {
        const { name, format = val => val } = this.parameters[i];
        subCommandOptions[name] = format(v);
      }
    });
    // sub command options
    const lastArg = args.slice(this.parameters.length)[0];
    const localOptions = {};
    this.options.forEach(({ name }) => {
      localOptions[name] = lastArg[name] || undefined;
    });
    const uniOptions = BaseSubCommand.getUniConfig(commander);
    // get options from global config and process.argv
    const rc = await this.rc.getConfigs();
    let options = BaseSubCommand.normalizeConfig({
      ...rc,
      ...uniOptions
    });
    // eslint-disable-next-line max-len
    const globalPrompts = globalOptionsPrompts.filter(
      prompt => this.validatorDesc[prompt.name].required && !options[prompt.name]
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

  makeExamples() {
    return this.usage.map(cmd => `aelf-command ${this.commandName} ${cmd}`);
  }
}

module.exports = BaseSubCommand;
