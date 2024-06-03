/**
 * @file create command
 * @author atom-yang
 */
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

class CreateCommand extends BaseSubCommand {
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

  async run(commander, ...args) {
    const wallet = AElf.wallet.createNewWallet();
    wallet.publicKey = wallet.keyPair.getPublic().encode('hex');
    logger.info('Your wallet info is :');
    logger.info(`Mnemonic            : ${wallet.mnemonic}`);
    logger.info(`Private Key         : ${wallet.privateKey}`);
    logger.info(`Public Key          : ${wallet.publicKey}`);
    logger.info(`Address             : ${wallet.address}`);
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
      logger.error(e);
    }
  }
}

export default CreateCommand;
