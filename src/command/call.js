/**
 * @file call read-only method on contract
 * @author atom-yang
 */
const AElf = require('aelf-sdk');
const prompts = require('prompts');
const BaseSubCommand = require('./baseSubCommand');
const {
  callCommandUsages,
  callCommandParameters
} = require('../utils/constants');
const {
  isHexString
} = require('../utils/utils');
const { getWallet } = require('../utils/wallet');

class CallCommand extends BaseSubCommand {
  constructor(
    rc,
    name = 'call',
    description = 'Call a read-only method on a contract.',
    usage = callCommandUsages
  ) {
    super(
      name,
      callCommandParameters,
      description,
      [],
      usage,
      rc
    );
  }

  static getContractMethods(contract) {
    return Object.keys(contract).filter(v => /^[A-Z]/.test(v));
  }

  async handleContract({ contractAddress }, aelf, wallet) {
    if (typeof contractAddress !== 'string') {
      return contractAddress;
    }
    this.oraInstance.start('Start to get contract');
    let contract = null;
    if (isHexString(contractAddress)) {
      contract = await aelf.chain.contractAt(contractAddress, wallet);
    } else {
      const {
        GenesisContractAddress
      } = await aelf.chain.getChainStatus();
      const genesisContract = await aelf.chain.contractAt(GenesisContractAddress, wallet);
      const address = await genesisContract.GetContractAddressByName.call(AElf.utils.sha256(contractAddress));
      contract = await aelf.chain.contractAt(address, wallet);
    }
    this.oraInstance.succeed('Succeed');
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
    this.oraInstance.start('call method');
    const result = await method.call(params);
    this.oraInstance.succeed('Succeed!');
    return result;
  }

  async run(commander, ...args) {
    this.setCustomPrompts(true);
    const {
      options,
      subOptions
    } = await super.run(commander, ...args);
    const subOptionsLength = Object.keys(subOptions).length;
    const {
      endpoint,
      datadir,
      account,
      password
    } = options;
    const aelf = new AElf(new AElf.providers.HttpProvider(endpoint));
    try {
      let {
        contractAddress,
        method,
        params
      } = subOptions;
      const wallet = getWallet(datadir, account, password);
      if (subOptionsLength < this.parameters.length) {
        // eslint-disable-next-line no-restricted-syntax
        for (const prompt of this.parameters.slice(subOptionsLength)) {
          switch (prompt.name) {
            case 'contractAddress':
              // eslint-disable-next-line no-await-in-loop
              contractAddress = await this.handleContract(await prompts(prompt), aelf, wallet);
              break;
            case 'method':
              // eslint-disable-next-line no-await-in-loop
              contractAddress = await this.handleContract({ contractAddress }, aelf, wallet);
              // eslint-disable-next-line no-await-in-loop
              method = await this.handleMethods(await prompts(
                {
                  ...prompt,
                  choices: CallCommand.getContractMethods(contractAddress)
                }
              ), contractAddress);
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
      contractAddress = await this.handleContract({ contractAddress }, aelf, wallet);
      method = await this.handleMethods({ method }, contractAddress);
      const result = await this.callMethod(method, params);
      console.log(`\nResult:\n${JSON.stringify(result, null, 2)}`);
      this.oraInstance.succeed('Succeed!');
    } catch (e) {
      this.oraInstance.fail('Failed!');
      console.log(e);
    }
  }
}

module.exports = CallCommand;
