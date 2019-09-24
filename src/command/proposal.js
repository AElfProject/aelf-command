/**
 * @file call read-only method on contract
 * @author atom-yang
 */
const fs = require('fs');
const path = require('path');
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
  isFilePath
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

function isSingleParameters(inputType) {
  if (!inputType.name || (inputType.name !== 'Address' && inputType.name !== 'Hash')) {
    return false;
  }
  if (!inputType.fieldsArray || inputType.fieldsArray.length !== 1) {
    return false;
  }
  return inputType.fieldsArray[0].type === 'bytes';
}

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

  async callMethod(method, params) {
    this.oraInstance.start('Calling method...');
    const result = await method.call(params);
    this.oraInstance.succeed('Calling method successfully!');
    return result;
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
      const fields = Object.entries(method.inputTypeInfo.fields);
      let result = {};
      if (fields.length > 0) {
        if (isSingleParameters(method.inputType)) {
          console.log('Enter required params:');
          const prompts = {
            type: 'input',
            name: 'value',
            message: 'Enter the required param:'
          };
          // eslint-disable-next-line no-await-in-loop
          const { value } = await inquirer.prompt(prompts);
          result = value;
        } else {
          // eslint-disable-next-line max-len
          console.log(chalk.yellow('\nIf you need to pass file contents to the contractMethod, you can enter the relative or absolute path of the file instead\n'));
          console.log('Enter required params one by one:');
          // eslint-disable-next-line no-restricted-syntax
          for (const [fieldName] of Object.entries(method.inputTypeInfo.fields)) {
            const prompts = {
              type: 'input',
              name: fieldName,
              message: `Enter the required param <${fieldName}>:`
            };
            // eslint-disable-next-line no-await-in-loop
            const value = await inquirer.prompt(prompts);
            result[fieldName] = value[fieldName];
            if (isFilePath(value[fieldName])) {
              // eslint-disable-next-line no-await-in-loop
              const { read } = await inquirer.prompt({
                type: 'confirm',
                name: 'read',
                // eslint-disable-next-line max-len
                message: `It seems that you have entered a file path, do you want to read the file content and take it as the value of <${fieldName}>`
              });
              if (read) {
                const code = fs.readFileSync(
                  path.resolve(process.cwd(), value[fieldName])
                ).toString('base64');
                result[fieldName] = code;
              }
            }
          }
        }
      }
      result = method.packInput(BaseSubCommand.normalizeConfig(result));
      const txId = await parliament.CreateProposal({
        contractMethodName: methodName,
        toAddress: this.toContractAddress,
        params: result,
        organizationAddress: organization,
        expiredTime: {
          seconds: moment(expiredTime).unix(),
          nanos: moment(expiredTime).milliseconds() * 1000
        }
      });
      logger.info(txId);
      this.oraInstance.start('loading proposal id...');
      await new Promise(resolve => {
        setTimeout(() => {
          resolve();
        }, 3000);
      });
      this.oraInstance.succeed();
      const tx = await aelf.chain.getTxResult(txId.TransactionId);
      logger.info(`Proposal id: ${tx.ReadableReturnValue}.`);
      this.oraInstance.succeed('Succeed!');
    } catch (e) {
      this.oraInstance.fail('Failed!');
      logger.fatal(e);
    }
  }
}

module.exports = ProposalCommand;
