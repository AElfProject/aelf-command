/**
 * @file show wallet info
 * @author atom-yang
 */
const BaseSubCommand = require('./baseSubCommand');
const { commonGlobalOptionValidatorDesc } = require('../utils/constants');
const { getWallet } = require('../utils/wallet');
const { logger } = require('../utils/myLogger');

const walletCommandValidatorDesc = {
  ...commonGlobalOptionValidatorDesc,
  endpoint: {
    ...commonGlobalOptionValidatorDesc.endpoint,
    required: false
  },
  password: {
    ...commonGlobalOptionValidatorDesc.password,
    required: true
  },
  account: {
    ...commonGlobalOptionValidatorDesc.account,
    required: true
  }
};

class WalletCommand extends BaseSubCommand {
  constructor(rc) {
    super(
      'wallet',
      [],
      'Show wallet details which include private key, address, public key and mnemonic',
      [],
      [''],
      rc,
      walletCommandValidatorDesc
    );
  }

  async run(commander, ...args) {
    const { options } = await super.run(commander, ...args);
    const {
      datadir, account, password
    } = options;
    try {
      const wallet = getWallet(datadir, account, password);
      if (wallet.mnemonic) {
        logger.info(`Mnemonic            : ${wallet.mnemonic}`);
      }
      wallet.publicKey = wallet.keyPair.getPublic().encode('hex');
      logger.info(`Private Key         : ${wallet.privateKey}`);
      logger.info(`Public Key          : ${wallet.publicKey}`);
      logger.info(`Address             : ${wallet.address}`);
      this.oraInstance.succeed('Succeed!');
    } catch (e) {
      this.oraInstance.fail('Failed!');
      logger.error(e);
    }
  }
}

module.exports = WalletCommand;
