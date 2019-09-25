/**
 * @file load wallet from command argv
 * @author atom-yang
 */
const AElf = require('aelf-sdk');
const BaseSubCommand = require('./baseSubCommand');
const { commonGlobalOptionValidatorDesc, loadCommandParameters, loadCommandUsage } = require('../utils/constants');
const { saveKeyStore } = require('../utils/wallet');
const { logger } = require('../utils/myLogger');

const loadCommandValidatorDesc = {
  ...commonGlobalOptionValidatorDesc,
  endpoint: {
    ...commonGlobalOptionValidatorDesc.endpoint,
    required: false
  }
};

class LoadCommand extends BaseSubCommand {
  constructor(rc) {
    super(
      'load',
      loadCommandParameters,
      'Load wallet from a private key or mnemonic',
      [],
      loadCommandUsage,
      rc,
      loadCommandValidatorDesc
    );
  }

  async run(commander, ...args) {
    const { options, subOptions } = await super.run(commander, ...args);
    const { datadir } = options;
    const { privateKey, saveToFile } = subOptions;
    try {
      let wallet = null;
      logger.info('Your wallet info is :');
      if (privateKey.trim().split(' ').length > 1) {
        wallet = AElf.wallet.getWalletByMnemonic(privateKey.trim());
        logger.info(`Mnemonic            : ${wallet.mnemonic}`);
      } else {
        wallet = AElf.wallet.getWalletByPrivateKey(privateKey.trim());
      }
      wallet.publicKey = wallet.keyPair.getPublic().encode('hex');
      logger.info(`Private Key         : ${wallet.privateKey}`);
      logger.info(`Public Key          : ${wallet.publicKey}`);
      logger.info(`Address             : ${wallet.address}`);
      if (saveToFile === true || saveToFile === 'true') {
        const keyStorePath = await saveKeyStore(wallet, datadir);
        this.oraInstance.succeed(`Account info has been saved to \"${keyStorePath}\"`);
      } else {
        this.oraInstance.succeed('Succeed!');
      }
    } catch (e) {
      this.oraInstance.fail('Failed!');
      logger.error(e);
    }
  }
}

module.exports = LoadCommand;
