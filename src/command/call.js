/**
 * @file call read-only method on contract
 * @author atom-yang
 */
const AElf = require('aelf-sdk');
const prompts = require('prompts');
const BaseSubCommand = require('./baseSubCommand');
const { callCommandUsages, callCommandParameters } = require('../utils/constants');
const { isAElfContract } = require('../utils/utils');
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
    this.oraInstance.start('Start to get contract...\n');
    let contract = null;
    if (!isAElfContract(contractAddress)) {
      try {
        contract = await aelf.chain.contractAt(contractAddress, wallet);
        return contract;
      } catch (err) {
        this.oraInstance.fail(plainLogger.error('Failed to find the contract, please enter the right contract address!'));
        return null;
      }
    } else {
      try {
        const { GenesisContractAddress } = await aelf.chain.getChainStatus();
        const genesisContract = await aelf.chain.contractAt(GenesisContractAddress, wallet);
        const address = await genesisContract.GetContractAddressByName.call(AElf.utils.sha256(contractAddress));
        contract = await aelf.chain.contractAt(address, wallet);
        this.oraInstance.succeed('Succeed!');
        return contract;
      } catch (error) {
        this.oraInstance.fail(plainLogger.error('Failed to find the contract, please enter the right contract address!'));
        return null;
      }
    }
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
    this.oraInstance.succeed('Succeed!');
    return result;
  }

  /**
   * @description prompt contract address three times at most
   * @param {*} times
   * @param {*} aelf
   * @param {*} wallet
   * @param {*} prompt
   * @returns
   * @memberof CallCommand
   */
  async promptAddressTolerateSeveralTimes(times, aelf, wallet, prompt) {
    let askTimes = 0;
    let contractAddress;
    while (askTimes < times) {
      // eslint-disable-next-line no-await-in-loop
      contractAddress = await prompts(prompt);
      contractAddress = BaseSubCommand.normalizeConfig(contractAddress).contractAddress;
      try {
        // eslint-disable-next-line no-await-in-loop
        contractAddress = await this.handleContract({ contractAddress }, aelf, wallet);
        if (contractAddress === null) {
          askTimes++;
        } else {
          break;
        }
      } catch (e) {
        this.oraInstance.fail('Failed');
      }
    }
    if (askTimes > times - 1 && contractAddress === null) {
      this.oraInstance.fail(plainLogger.fatal(`You has entered wrong message ${times} times!`));
      process.exit(1);
    }
    return contractAddress;
  }

  // todo: There is a bug when get contract by address
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
              contractAddress = await this.promptAddressTolerateSeveralTimes(3, aelf, wallet, prompt);
              break;
            case 'method':
              // eslint-disable-next-line no-await-in-loop
              contractAddress = await this.handleContract({ contractAddress }, aelf, wallet);
              // eslint-disable-next-line no-await-in-loop
              method = await this.handleMethods(
                // eslint-disable-next-line no-await-in-loop
                await prompts({
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
              params = (await prompts(prompt)).params;
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
