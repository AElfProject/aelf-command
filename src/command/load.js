/**
 * @file load wallet from command argv
 * @author atom-yang
 */
const AElf = require('aelf-sdk');
const BaseSubCommand = require('./baseSubCommand');
const {
  commonGlobalOptionValidatorDesc,
  loadCommandParameters,
  loadCommandUsage
} = require('../utils/constants');
const { saveKeyStore } = require('../utils/wallet');

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
      'load wallet from ',
      [],
      loadCommandUsage,
      rc,
      loadCommandValidatorDesc
    );
  }

  async run(commander, ...args) {
    const {
      options,
      subOptions
    } = await super.run(commander, ...args);
    const {
      datadir
    } = options;
    const {
      privateKey,
      saveToFile
    } = subOptions;
    try {
      let wallet = null;
      console.log('Your wallet info is :');
      if (privateKey.trim().split(' ').length > 1) {
        wallet = AElf.wallet.getWalletByMnemonic(privateKey.trim());
        console.log(`Mnemonic            : ${wallet.mnemonic}`);
      } else {
        wallet = AElf.wallet.getWalletByPrivateKey(privateKey.trim());
      }
      wallet.publicKey = wallet.keyPair.getPublic().encode('hex');
      console.log(`Private Key         : ${wallet.privateKey}`);
      console.log(`Public Key          : ${wallet.publicKey}`);
      console.log(`Address             : ${wallet.address}`);
      if (saveToFile === true || saveToFile === 'true') {
        const keyStorePath = await saveKeyStore(wallet, datadir);
        this.oraInstance.succeed(`\nAccount info has been saved to \"${keyStorePath}\"`);
      } else {
        this.oraInstance.succeed('\nSucceed!');
      }
    } catch (e) {
      this.oraInstance.fail('Failed!');
      console.log(e);
    }
  }
}

module.exports = LoadCommand;
