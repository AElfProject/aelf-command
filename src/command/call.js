import AElf from 'aelf-sdk';
import inquirer from 'inquirer';
import chalk from 'chalk';
import BaseSubCommand from './baseSubCommand.js';
import { callCommandUsages, callCommandParameters, commonGlobalOptionValidatorDesc } from '../utils/constants.js';
import {
  getContractMethods,
  getContractInstance,
  getMethod,
  promptTolerateSeveralTimes,
  getParams,
  parseJSON,
  parseCSV,
  parseJSONFile
} from '../utils/utils.js';
import { getWallet } from '../utils/wallet.js';
import { logger } from '../utils/myLogger.js';

/**
 * @typedef {import('commander').Command} Command
 * @typedef {import('ora').Options} OraOptions
 * @typedef {import('../../types/rc/index.js').default} Registry
 */
class CallCommand extends BaseSubCommand {
  /**
   * Creates an instance of CallCommand.
   * @param {Registry} rc The instance of the Registry.
   * @param {string} [name] The name of the command.
   * @param {string} [description] The description of the command.
   * @param {Object[]} [parameters] The parameters for the command.
   * @param {string[]} [usage] The usage examples for the command.
   * @param {any[]} [options] The options for the command.
   */
  constructor(
    rc,
    name = 'call',
    description = 'Call a read-only method on a contract.',
    parameters = callCommandParameters,
    usage = callCommandUsages,
    options = [],
    validatorDesc = commonGlobalOptionValidatorDesc
  ) {
    super(name, parameters, description, options, usage, rc, validatorDesc);
  }
  /**
   * Calls a method with specified parameters.
   * @param {any} method The method to call.
   * @param {any} params The parameters for the method call.
   * @returns {Promise<any>} A promise that resolves with the result of the method call.
   */
  async callMethod(method, params) {
    this.oraInstance.start('Calling method...');
    const result = await method.call(params);
    this.oraInstance.succeed('Calling method successfully!');
    return result;
  }
  /**
   * Processes address after prompting for input.
   * @param {any} aelf The AElf instance.
   * @param {any} wallet The wallet instance.
   * @param {Object.<string, any>} answerInput The input parameters.
   * @returns {Promise<any>} A promise that resolves with the processed result.
   */
  async processAddressAfterPrompt(aelf, wallet, answerInput) {
    let { contractAddress } = BaseSubCommand.normalizeConfig(answerInput);
    contractAddress = await getContractInstance(contractAddress, aelf, wallet, this.oraInstance);
    return contractAddress;
  }

  /**
   * Calls a method with specified parameters.
   * @param {any} method The method to call.
   * @param {any} params The parameters for the method call.
   * @returns {Promise<any>} A promise that resolves with the result of the method call.
   */
  async showRes(method, params) {
    const result = await this.callMethod(method, params);
    // @ts-ignore
    logger.info(`\nResult:\n${JSON.stringify(result, null, 2)}`);
    this.oraInstance.succeed('Succeed!');
  }

  /**
   * Runs the command.
   * @param {Command} commander The Commander instance.
   * @param {...any[]} args Additional arguments passed to the command.
   * @returns {Promise<void>} A promise that resolves when the command execution completes.
   */
  async run(commander, ...args) {
    this.setCustomPrompts(true);
    // @ts-ignore
    const { options, subOptions } = await super.run(commander, ...args);
    const subOptionsLength = Object.keys(subOptions).length;
    const { endpoint, datadir, account, password, csv, json } = options;
    const aelf = new AElf(new AElf.providers.HttpProvider(endpoint));
    try {
      let { contractAddress, method, params } = subOptions;
      let wallet;
      if (!account || !password) {
        // no need to provide account and password
        wallet = AElf.wallet.createNewWallet();
      } else {
        wallet = getWallet(datadir, account, password);
      }
      if (subOptionsLength < this.parameters.length) {
        for (const prompt of this.parameters.slice(subOptionsLength)) {
          switch (prompt.name) {
            case 'contract-address':
              contractAddress = await promptTolerateSeveralTimes(
                {
                  times: 3,
                  prompt,
                  processAfterPrompt: this.processAddressAfterPrompt.bind(this, aelf, wallet),
                  pattern: /^((?!null).)*$/
                },
                this.oraInstance
              );
              break;
            case 'method':
              contractAddress = await getContractInstance(contractAddress, aelf, wallet, this.oraInstance);

              method = getMethod(
                (
                  await inquirer.prompt({
                    ...prompt,
                    choices: getContractMethods(contractAddress)
                  })
                ).method,
                contractAddress
              );
              break;
            case 'params':
              contractAddress = await getContractInstance(contractAddress, aelf, wallet, this.oraInstance);
              method = getMethod(method, contractAddress);
              if (csv) {
                params = await parseCSV(csv);
              } else if (json) {
                params = await parseJSONFile(json);
              } else {
                params = await getParams(method);
                params = typeof params === 'string' ? params : BaseSubCommand.normalizeConfig(params);
                if (Object.keys(params || {}).length > 0) {
                  console.log(chalk.hex('#3753d3')(`The params you entered is:\n${JSON.stringify(params, null, 2)}`));
                }
              }
              break;
            default:
              break;
          }
        }
      }
      contractAddress = await getContractInstance(contractAddress, aelf, wallet, this.oraInstance);
      if (Array.isArray(params)) {
        params.forEach(param => parseJSON(param));
      } else {
        params = parseJSON(params);
      }

      method = getMethod(method, contractAddress);
      if (method.inputTypeInfo && (Object.keys(method.inputTypeInfo.fields).length === 0 || !method.inputTypeInfo.fields)) {
        params = '';
      }
      if (Array.isArray(params)) {
        for (const param of params) {
          await this.showRes(method, param);
        }
      } else {
        await this.showRes(method, params);
      }
    } catch (e) {
      this.oraInstance.fail('Failed!');
      // @ts-ignore
      logger.fatal(e);
    }
  }
}

export default CallCommand;
