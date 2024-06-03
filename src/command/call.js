/**
 * @file call read-only method on contract
 * @author atom-yang
 */
import AElf from 'aelf-sdk';
import inquirer from 'inquirer';
import chalk from 'chalk';
import BaseSubCommand from './baseSubCommand.js';
import { callCommandUsages, callCommandParameters } from '../utils/constants.js';
import {
  getContractMethods,
  getContractInstance,
  getMethod,
  promptTolerateSeveralTimes,
  getParams,
  parseJSON
} from '../utils/utils.js';
import { getWallet } from '../utils/wallet.js';
import { logger } from '../utils/myLogger.js';

class CallCommand extends BaseSubCommand {
  constructor(
    rc,
    name = 'call',
    description = 'Call a read-only method on a contract.',
    parameters = callCommandParameters,
    usage = callCommandUsages,
    options = []
  ) {
    super(name, parameters, description, options, usage, rc);
  }

  async callMethod(method, params) {
    this.oraInstance.start('Calling method...');
    const result = await method.call(params);
    this.oraInstance.succeed('Calling method successfully!');
    return result;
  }

  async processAddressAfterPrompt(aelf, wallet, answerInput) {
    let { contractAddress } = BaseSubCommand.normalizeConfig(answerInput);
    contractAddress = await getContractInstance(contractAddress, aelf, wallet, this.oraInstance);
    return contractAddress;
  }

  async run(commander, ...args) {
    this.setCustomPrompts(true);
    const { options, subOptions } = await super.run(commander, ...args);
    const subOptionsLength = Object.keys(subOptions).length;
    const { endpoint, datadir, account, password } = options;
    const aelf = new AElf(new AElf.providers.HttpProvider(endpoint));
    try {
      let { contractAddress, method, params } = subOptions;
      const wallet = getWallet(datadir, account, password);
      if (subOptionsLength < this.parameters.length) {
        // eslint-disable-next-line no-restricted-syntax
        for (const prompt of this.parameters.slice(subOptionsLength)) {
          switch (prompt.name) {
            case 'contract-address':
              // eslint-disable-next-line no-await-in-loop
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
              // eslint-disable-next-line no-await-in-loop
              contractAddress = await getContractInstance(contractAddress, aelf, wallet, this.oraInstance);
              // eslint-disable-next-line no-await-in-loop
              method = getMethod(
                // eslint-disable-next-line no-await-in-loop
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
              // eslint-disable-next-line no-await-in-loop
              contractAddress = await getContractInstance(contractAddress, aelf, wallet, this.oraInstance);
              // eslint-disable-next-line no-await-in-loop
              method = getMethod(method, contractAddress);
              // eslint-disable-next-line no-await-in-loop
              params = await getParams(method);
              params = typeof params === 'string' ? params : BaseSubCommand.normalizeConfig(params);
              if (Object.keys(params || {}).length > 0) {
                console.log(chalk.hex('#3753d3')(`The params you entered is:\n${JSON.stringify(params, null, 2)}`));
              }
              break;
            default:
              break;
          }
        }
      }
      contractAddress = await getContractInstance(contractAddress, aelf, wallet, this.oraInstance);
      params = parseJSON(params);
      method = getMethod(method, contractAddress);
      if (method.inputTypeInfo && (Object.keys(method.inputTypeInfo.fields).length === 0 || !method.inputTypeInfo.fields)) {
        params = '';
      }
      const result = await this.callMethod(method, params);
      logger.info(`\nResult:\n${JSON.stringify(result, null, 2)}`);
      this.oraInstance.succeed('Succeed!');
    } catch (e) {
      this.oraInstance.fail('Failed!');
      logger.fatal(e);
    }
  }
}

export default CallCommand;
