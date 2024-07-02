import AElf from 'aelf-sdk';
import chalk from 'chalk';
import BaseSubCommand from './baseSubCommand.js';
import { commonGlobalOptionValidatorDesc, createCommandParameters, createCommandUsage } from '../utils/constants.js';
import { saveKeyStore } from '../utils/wallet.js';
import { logger } from '../utils/myLogger.js';

const createCommandValidatorDesc = {
  ...commonGlobalOptionValidatorDesc,
  endpoint: {
    ...commonGlobalOptionValidatorDesc.endpoint,
    required: false
  }
};
/**
 * @typedef {import('commander').Command} Command
 * @typedef {import('../../types/rc/index.js').default} Registry
 */

class CreateCommand extends BaseSubCommand {
  /**
   * Constructs a new CreateCommand instance.
   * @param {Registry} rc - The registry instance.
   */
  constructor(rc) {
    super(
      'create',
      createCommandParameters,
      'Create a new account',
      [
        {
          flag: '-c, --cipher [cipher]',
          name: 'cipher',
          description: 'Which cipher algorithm to use, default to be aes-128-ctr'
        }
      ],
      createCommandUsage,
      rc,
      createCommandValidatorDesc
    );
  }
  /**
   * Executes the create command.
   * @param {Command} commander - The commander instance.
   * @param {...any} args - Additional arguments.
   * @returns {Promise<void>} A promise that resolves when the command execution is complete.
   */
  async run(commander, ...args) {
    const wallet = AElf.wallet.createNewWallet();
    wallet.publicKey = wallet.keyPair.getPublic().encode('hex');
    // @ts-ignore
    logger.info('Your wallet info is :');
    // @ts-ignore
    logger.info(`Mnemonic            : ${wallet.mnemonic}`);
    // @ts-ignore
    logger.info(`Private Key         : ${wallet.privateKey}`);
    // @ts-ignore
    logger.info(`Public Key          : ${wallet.publicKey}`);
    // @ts-ignore
    logger.info(`Address             : ${wallet.address}`);
    // @ts-ignore
    const { localOptions, options, subOptions } = await super.run(commander, ...args);
    const { datadir } = options;
    const { saveToFile } = subOptions;
    const { cipher } = localOptions;
    try {
      if (saveToFile === true || saveToFile === 'true') {
        const keyStorePath = await saveKeyStore(wallet, datadir, cipher);
        this.oraInstance.succeed(`Account info has been saved to \"${chalk.underline(keyStorePath)}\"`);
      } else {
        this.oraInstance.succeed('Succeed!');
      }
    } catch (e) {
      this.oraInstance.fail('Failed!');
      // @ts-ignore
      logger.error(e);
    }
  }
}

export default CreateCommand;
