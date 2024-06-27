/**
 * @file get block height
 * @author atom-yang
 */
import { interopImportCJSDefault } from 'node-cjs-interop';
import asyncValidator from 'async-validator';
const Schema = interopImportCJSDefault(asyncValidator);
import BaseSubCommand from './baseSubCommand.js';
import { configCommandParameters, configCommandUsage, commonGlobalOptionValidatorDesc } from '../utils/constants.js';
import { logger } from '../utils/myLogger.js';

const configCommandValidatorDesc = {
  ...commonGlobalOptionValidatorDesc,
  endpoint: {
    ...commonGlobalOptionValidatorDesc.endpoint,
    required: false
  }
};

class ConfigCommand extends BaseSubCommand {
  constructor(rc) {
    super(
      'config',
      configCommandParameters,
      'Get, set, delete or list aelf-command config',
      [],
      configCommandUsage,
      rc,
      configCommandValidatorDesc
    );
  }

  async validateParameters(rule, parameters) {
    const validator = new Schema(rule);
    try {
      await validator.validate(parameters);
    } catch (e) {
      this.handleUniOptionsError(e);
    }
  }

  handleList(content) {
    return Object.entries(content)
      .filter(([, value]) => {
        if (value === '' || value === undefined || value === null) {
          return false;
        }
        return true;
      })
      .map(([key, value]) => `${key}=${value}\n`)
      .join('');
  }

  async run(commander, ...args) {
    this.setCustomPrompts(true);
    const { subOptions } = await super.run(commander, ...args);
    // todo: specified which .aelfrc file to read or write
    const { flag, key, value } = subOptions;
    try {
      await this.validateParameters(
        {
          flag: {
            type: 'enum',
            enum: ['set', 'get', 'delete', 'list'],
            required: true,
            message: 'Flag must one of set, get, list, delete'
          },
          key: {
            type: 'string',
            required: ['get', 'set', 'delete'].includes(flag),
            message: 'You need to enter the <key>'
          },
          value: {
            type: 'string',
            required: flag === 'set',
            message: 'You need to enter the correct <value> for config set',
            // The follow validator will get the pattern if the [key] in commonGlobalOptionValidatorDesc.
            // At the same time avoid an error if [key] is not in.
            pattern: (key in commonGlobalOptionValidatorDesc && commonGlobalOptionValidatorDesc[key].pattern) || null
          }
        },
        subOptions
      );
      let result = null;
      switch (flag) {
        case 'get':
          result = this.rc.getOption(key);
          logger.info(result);
          break;
        case 'set':
          this.rc.saveOption(key, value);
          this.oraInstance.succeed('Succeed!');
          break;
        case 'list':
          result = this.rc.getFileConfigs();
          console.log(`\n${this.handleList(result)}`);
          break;
        case 'delete':
          result = this.rc.deleteConfig(key);
          this.oraInstance.succeed('Succeed!');
          break;
      }
    } catch (e) {
      this.oraInstance.fail('Failed!');
      logger.error(e);
    }
  }
}

export default ConfigCommand;
