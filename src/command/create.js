/**
 * @file create command
 * @author atom-yang
 */
const AElf = require('aelf-sdk');
const chalk = require('chalk');
const BaseSubCommand = require('./baseSubCommand');
const { commonGlobalOptionValidatorDesc, createCommandParameters, createCommandUsage } = require('../utils/constants');
const { saveKeyStore } = require('../utils/wallet');
const { logger } = require('../utils/myLogger');

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
      'create a new account',
      [
        {
          flag: '-c, --cipher [cipher]',
          name: 'cipher',
          description: 'Which cipher algorithm to use, default to be aes-256-cbc'
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

module.exports = CreateCommand;
