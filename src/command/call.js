/**
 * @file call read-only method on contract
 * @author atom-yang
 */
const AElf = require('aelf-sdk');
const inquirer = require('inquirer');
const BaseSubCommand = require('./baseSubCommand');
const { callCommandUsages, callCommandParameters } = require('../utils/constants');
const { isAElfContract, isRegExp } = require('../utils/utils');
const { getWallet } = require('../utils/wallet');
const { logger, plainLogger } = require('../utils/myLogger');

class CallCommand extends BaseSubCommand {
  constructor(rc, name = 'call', description = 'Call a read-only method on a contract.', usage = callCommandUsages) {
    super(name, callCommandParameters, description, [], usage, rc);
  }

  static getContractMethods(contract) {
    return Object.keys(contract)
      .filter(v => /^[A-Z]/.test(v))
      .map(v => ({
        value: v,
        title: v
      }));
  }

  /**
   * @description Get contract by contractAddress
   * @param {*} { contractAddress }
   * @param {*} aelf
   * @param {*} wallet
   * @returns
   * @memberof CallCommand
   */
  async handleContract({ contractAddress }, aelf, wallet) {
    if (typeof contractAddress !== 'string') {
      return contractAddress;
    }
    this.oraInstance.start('Fetching contract');
    let contract = null;
    if (!isAElfContract(contractAddress)) {
      try {
        contract = await aelf.chain.contractAt(contractAddress, wallet);
      } catch (err) {
        this.oraInstance.fail(plainLogger.error('Failed to find the contract, please enter the correct contract name!'));
        return null;
      }
    } else {
      try {
        const { GenesisContractAddress } = await aelf.chain.getChainStatus();
        const genesisContract = await aelf.chain.contractAt(GenesisContractAddress, wallet);
        const address = await genesisContract.GetContractAddressByName.call(AElf.utils.sha256(contractAddress));
        contract = await aelf.chain.contractAt(address, wallet);
      } catch (error) {
        this.oraInstance.fail(plainLogger.error('Failed to find the contract, please enter the correct contract address!'));
        return null;
      }
    }
    this.oraInstance.succeed('Fetching contract successfully!');
    return contract;
  }

  async handleMethods({ method }, contract) {
    if (typeof method !== 'string') {
      return method;
    }
    if (contract[method]) {
      return contract[method];
    }
    throw new Error(`Not exist method ${method}`);
  }

  async callMethod(method, params) {
    this.oraInstance.start('Calling method...');
    const result = await method.call(params);
    this.oraInstance.succeed('Calling method successfully!');
    return result;
  }

  /**
   * @description prompt contract address three times at most
   * @param {*} {
   *     times,
   *     prompt,
   *     processAfterPrompt, // a function that will process user's input with first param as the raw input value of user
   *     pattern // the regular expression to validate the user's input
   *   }
   * @returns the correct input value, if no correct was inputed, it will throw an error then exit the process
   * @memberof CallCommand
   */
  async promptTolerateSeveralTimes({
    times, prompt, processAfterPrompt, pattern
  }) {
    if (pattern && !isRegExp(pattern)) {
      throw new Error("param 'pattern' must be a regular expression!");
    }
    if (processAfterPrompt && typeof processAfterPrompt !== 'function') {
      throw new Error("Param 'processAfterPrompt' must be a function!");
    }
    let askTimes = 0;
    let answerInput;
    while (askTimes < times) {
      try {
        // eslint-disable-next-line no-await-in-loop
        answerInput = await inquirer.prompt(prompt);
        // process user's answer after prompt
        if (typeof processAfterPrompt === 'function') {
          // eslint-disable-next-line no-await-in-loop
          answerInput = await processAfterPrompt(answerInput);
        }
        if (!pattern || pattern.test(answerInput)) {
          break;
        } else {
          askTimes++;
        }
      } catch (e) {
        this.oraInstance.fail('Failed');
      }
    }
    if (askTimes > times - 1 && answerInput === null) {
      this.oraInstance.fail(plainLogger.fatal(`You has entered wrong message ${times} times!`));
      process.exit(1);
    }
    return answerInput;
  }

  async processAddressAfterPrompt(aelf, wallet, answerInput) {
    let processedAnswer = BaseSubCommand.normalizeConfig(answerInput).contractAddress;
    // eslint-disable-next-line no-await-in-loop
    processedAnswer = await this.handleContract({ contractAddress: processedAnswer }, aelf, wallet);
    return processedAnswer;
  }

  async run(commander, ...args) {
    this.setCustomPrompts(true);
    const { options, subOptions } = await super.run(commander, ...args);
    const subOptionsLength = Object.keys(subOptions).length;
    const {
      endpoint, datadir, account, password
    } = options;
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
              contractAddress = await this.promptTolerateSeveralTimes({
                times: 3,
                prompt,
                processAfterPrompt: this.processAddressAfterPrompt.bind(this, aelf, wallet),
                pattern: /^((?!null).)*$/
              });
              break;
            case 'method':
              // eslint-disable-next-line no-await-in-loop
              contractAddress = await this.handleContract({ contractAddress }, aelf, wallet);
              // eslint-disable-next-line no-await-in-loop
              method = await this.handleMethods(
                // eslint-disable-next-line no-await-in-loop
                await inquirer.prompt({
                  ...prompt,
                  choices: CallCommand.getContractMethods(contractAddress)
                }),
                contractAddress
              );
              break;
            case 'params':
              // eslint-disable-next-line no-await-in-loop
              contractAddress = await this.handleContract({ contractAddress }, aelf, wallet);
              // eslint-disable-next-line no-await-in-loop
              method = await this.handleMethods({ method }, contractAddress);
              // eslint-disable-next-line no-await-in-loop
              params = (await inquirer.prompt(prompt)).params;
              break;
            default:
              break;
          }
        }
      }
      try {
        contractAddress = await this.handleContract({ contractAddress }, aelf, wallet);
      } catch (err) {
        logger.error(err);
      }
      try {
        params = JSON.parse(params);
      } catch (e) {}
      method = await this.handleMethods({ method }, contractAddress);
      const result = await this.callMethod(method, params);
      logger.info(`\nResult:\n${JSON.stringify(result, null, 2)}`);
      this.oraInstance.succeed('Succeed!');
    } catch (e) {
      this.oraInstance.fail('Failed!');
      logger.fatal(e);
    }
  }
}

module.exports = CallCommand;
