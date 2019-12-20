/**
 * @file call read-only method on contract
 * @author atom-yang
 */
const AElf = require('aelf-sdk');
const moment = require('moment');
const chalk = require('chalk');
const inquirer = require('inquirer');
const BaseSubCommand = require('./baseSubCommand');
const { proposalCommandUsage, proposalCommandParameters } = require('../utils/constants');
const {
  isAElfContract,
  getContractMethods,
  getContractInstance,
  getMethod,
  promptTolerateSeveralTimes,
  getTxResult,
  getParams
} = require('../utils/utils');
const { getWallet } = require('../utils/wallet');
const { logger } = require('../utils/myLogger');

const contractName = 'AElf.ContractNames.Parliament';

const toContractPrompts = [
  {
    type: 'input',
    name: 'contract-address',
    extraName: ['contract-name'],
    message: 'Enter a contract address or name',
    suffix: ':'
  },
  {
    type: 'list',
    name: 'method',
    message: 'Pick up a contract method',
    pageSize: 10,
    choices: [],
    suffix: ':'
  }
];

async function getContractAddress(aelf, wallet, address) {
  if (!isAElfContract(address)) {
    return address;
  }
  try {
    const { GenesisContractAddress } = await aelf.chain.getChainStatus();
    const genesisContract = await aelf.chain.contractAt(GenesisContractAddress, wallet);
    const toContractAddress = await genesisContract.GetContractAddressByName.call(AElf.utils.sha256(address));
    return toContractAddress;
  } catch (error) {
    return null;
  }
}

class ProposalCommand extends BaseSubCommand {
  constructor(
    rc,
    name = 'proposal',
    description = 'Send a proposal to an origination with a specific contract method',
    parameters = proposalCommandParameters,
    usage = proposalCommandUsage,
    options = [],
  ) {
    super(name, parameters, description, options, usage, rc);
  }

  async processAddressAfterPrompt(aelf, wallet, answerInput) {
    this.toContractAddress = await getContractAddress(aelf, wallet, answerInput['contract-address']);
    let { contractAddress } = BaseSubCommand.normalizeConfig(answerInput);
    contractAddress = await getContractInstance(contractAddress, aelf, wallet, this.oraInstance);
    return contractAddress;
  }

  async run(commander, ...args) {
    const { options, subOptions } = await super.run(commander, ...args);
    const {
      endpoint,
      datadir,
      account,
      password
    } = options;
    const {
      organization,
      expiredTime
    } = subOptions;
    try {
      if (!moment(expiredTime).isValid || moment(expiredTime).isBefore(moment().add(1, 'hours'))) {
        throw new Error(`Expired Time has to be later than ${moment().add(1, 'hours').format('YYYY/MM/DD HH:mm:ss')}`);
      }
      const aelf = new AElf(new AElf.providers.HttpProvider(endpoint));
      const wallet = getWallet(datadir, account, password);
      const { GenesisContractAddress } = await aelf.chain.getChainStatus();
      const genesisContract = await aelf.chain.contractAt(GenesisContractAddress, wallet);
      const address = await genesisContract.GetContractAddressByName.call(AElf.utils.sha256(contractName));
      const parliament = await aelf.chain.contractAt(address, wallet);
      let toContractAddress;
      let method;
      let methodName;
      // eslint-disable-next-line no-restricted-syntax
      for (const prompt of toContractPrompts) {
        switch (prompt.name) {
          case 'contract-address':
            // eslint-disable-next-line no-await-in-loop
            toContractAddress = await promptTolerateSeveralTimes({
              times: 3,
              prompt,
              processAfterPrompt: this.processAddressAfterPrompt.bind(this, aelf, wallet),
              pattern: /^((?!null).)*$/
            }, this.oraInstance);
            break;
          case 'method':
            // eslint-disable-next-line no-await-in-loop
            toContractAddress = await getContractInstance(toContractAddress, aelf, wallet, this.oraInstance);
            // eslint-disable-next-line no-await-in-loop
            methodName = (await inquirer.prompt({
              ...prompt,
              choices: getContractMethods(toContractAddress)
            })).method;
            method = getMethod(methodName, toContractAddress);
            break;
          default:
            break;
        }
      }
      let params = await getParams(method);
      params = typeof params === 'string' ? params : BaseSubCommand.normalizeConfig(params);
      const result = method.packInput(params);
      const txId = await parliament.CreateProposal(BaseSubCommand.normalizeConfig({
        contractMethodName: methodName,
        toAddress: this.toContractAddress,
        params: result,
        organizationAddress: organization,
        expiredTime: {
          seconds: moment(expiredTime).unix(),
          nanos: moment(expiredTime).milliseconds() * 1000
        }
      }));
      logger.info(txId);
      this.oraInstance.start('loading proposal id...');
      const tx = await getTxResult(aelf, txId.TransactionId);
      this.oraInstance.succeed();
      if (tx.Status === 'PENDING') {
        // eslint-disable-next-line max-len
        logger.info(`Transaction is still pending, you can check it later by running ${chalk.yellow(`aelf-command get-tx-result ${txId.TransactionId}`)}`);
      } else {
        logger.info(`Proposal id: ${tx.ReadableReturnValue}.`);
        this.oraInstance.succeed('Succeed!');
      }
    } catch (e) {
      this.oraInstance.fail('Failed!');
      logger.fatal(e);
    }
  }
}

module.exports = ProposalCommand;
