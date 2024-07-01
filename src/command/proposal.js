import assert from 'assert';
import AElf from 'aelf-sdk';
import moment from 'moment';
import chalk from 'chalk';
import inquirer from 'inquirer';
import BaseSubCommand from './baseSubCommand.js';
import { proposalCommandUsage, proposalCommandParameters } from '../utils/constants.js';
import {
  isAElfContract,
  getContractMethods,
  getContractInstance,
  getMethod,
  promptTolerateSeveralTimes,
  getTxResult,
  getParams,
  deserializeLogs
} from '../utils/utils.js';
import { getWallet } from '../utils/wallet.js';
import { logger } from '../utils/myLogger.js';

/**
 * @typedef {import('commander').Command} Command
 * @typedef {import('async-validator').Rules} Rules
 * @typedef {import('async-validator').Values} Values
 * @typedef {import ('inquirer').InputQuestion } InputQuestion
 * @typedef {import ('inquirer').ListQuestion } ListQuestion
 * @typedef {import('../../types/rc/index.js').default} Registry
 */
/**
 * @type {Array<InputQuestion | ListQuestion>}
 */
const toContractPrompts = [
  {
    type: 'input',
    name: 'contract-address',
    // @ts-ignore
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
  /**
   * Constructs a new ProposalCommand instance.
   * @param {Registry} rc - The registry instance.
   * @param {string} [name] - Optional name of the command.
   * @param {string} [description] - Optional description of the command.
   * @param {Array<Object>} [parameters] - Optional array of parameter objects.
   * @param {string[]} [usage] - Optional array of usage strings.
   * @param {any[]} [options] - Optional array of options.
   */
  constructor(
    rc,
    name = 'proposal',
    description = 'Send a proposal to an origination with a specific contract method',
    parameters = proposalCommandParameters,
    usage = proposalCommandUsage,
    options = []
  ) {
    super(name, parameters, description, options, usage, rc);
    this.aelfMock = {};
  }

  /**
   * Processes address after prompting.
   * @param {any} aelf - The AElf instance.
   * @param {any} wallet - The wallet instance.
   * @param {{ [key: string]: any }} answerInput - Input from the user.
   * @returns {Promise<any>} A promise that resolves with the processed address.
   */
  async processAddressAfterPrompt(aelf, wallet, answerInput) {
    this.toContractAddress = await getContractAddress(aelf, wallet, answerInput['contract-address']);
    let { contractAddress } = BaseSubCommand.normalizeConfig(answerInput);
    contractAddress = await getContractInstance(contractAddress, aelf, wallet, this.oraInstance);
    return contractAddress;
  }

  /**
   * Runs the ProposalCommand.
   * @param {Command} commander - The commander instance.
   * @param {...any} args - Additional arguments.
   * @returns {Promise<void>} A promise that resolves when the command execution is complete.
   */
  async run(commander, ...args) {
    // @ts-ignore
    const { options, subOptions } = await super.run(commander, ...args);
    const { endpoint, datadir, account, password } = options;
    const { descriptionUrl, proposalContract, organization, expiredTime } = subOptions;
    try {
      if (!proposalCommandParameters[0].choices?.includes(proposalContract)) {
        throw new Error(
          // eslint-disable-next-line max-len
          `${proposalContract} is not in the list of proposal contracts, choice one of \`AElf.ContractNames.Parliament\`, \`AElf.ContractNames.Referendum\` and \`AElf.ContractNames.Association\``
        );
      }
      if (!moment(expiredTime).isValid || moment(expiredTime).isBefore(moment().add(0, 'hours'))) {
        throw new Error(`Expired Time has to be later than ${moment().add(1, 'hours').format('YYYY/MM/DD HH:mm:ss')}`);
      }
      let aelf = new AElf(new AElf.providers.HttpProvider(endpoint));
      // for test mock
      aelf = { ...aelf, ...this.aelfMock };
      const wallet = getWallet(datadir, account, password);
      const { GenesisContractAddress } = await aelf.chain.getChainStatus();
      const genesisContract = await aelf.chain.contractAt(GenesisContractAddress, wallet);
      const address = await genesisContract.GetContractAddressByName.call(AElf.utils.sha256(proposalContract));
      const parliament = await aelf.chain.contractAt(address, wallet);
      let toContractAddress;
      let method;
      let methodName;

      for (const prompt of toContractPrompts) {
        switch (prompt.name) {
          case 'contract-address':
            toContractAddress = await promptTolerateSeveralTimes(
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
            toContractAddress = await getContractInstance(toContractAddress, aelf, wallet, this.oraInstance);

            methodName = (
              await inquirer.prompt({
                ...prompt,
                choices: getContractMethods(toContractAddress)
              })
            ).method;
            method = getMethod(methodName, toContractAddress);
            break;
          default:
            break;
        }
      }
      let params = await getParams(method);
      params = typeof params === 'string' ? params : BaseSubCommand.normalizeConfig(params);
      const result = method.packInput(params);
      const txId = await parliament.CreateProposal(
        BaseSubCommand.normalizeConfig({
          contractMethodName: methodName,
          toAddress: this.toContractAddress,
          params: result,
          organizationAddress: organization,
          expiredTime: {
            seconds: moment(expiredTime).unix(),
            nanos: moment(expiredTime).milliseconds() * 1000
          },
          proposalDescriptionUrl: descriptionUrl
        })
      );
      // @ts-ignore
      logger.info(txId);
      this.oraInstance.start('loading proposal id...');
      const tx = await getTxResult(aelf, txId.TransactionId);
      this.oraInstance.succeed();
      if (tx.Status === 'PENDING') {
        // @ts-ignore
        logger.info(
          `Transaction is still pending, you can get proposal id later by running ${chalk.yellow(
            `aelf-command event ${txId.TransactionId}`
          )}`
        );
      } else {
        const { Logs = [] } = tx;
        const results = await deserializeLogs(
          aelf,
          (Logs || []).filter(v => v.Name === 'ProposalCreated')
        );
        assert.strictEqual(results.length, 1, 'No related log');
        // @ts-ignore
        logger.info(`Proposal id: ${results[0].proposalId}.`);
        this.oraInstance.succeed('Succeed!');
      }
    } catch (e) {
      this.oraInstance.fail('Failed!');
      // @ts-ignore
      logger.fatal(e);
    }
  }
}

export default ProposalCommand;
