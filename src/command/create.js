/**
 * @file create command
 * @author atom-yang
 */
const AElf = require('aelf-sdk');
const BaseSubCommand = require('./baseSubCommand');
const {
  commonGlobalOptionValidatorDesc,
  createCommandParameters,
  createCommandUsage
} = require('../utils/constants');
const { saveKeyStore } = require('../utils/wallet');

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
      [{
        flag: '-c, --cipher [cipher]',
        name: 'cipher',
        description: 'Which cipher algorithm to use, default to be aes-256-cbc'
      }],
      createCommandUsage,
      rc,
      createCommandValidatorDesc
    );
  }

  async run(commander, ...args) {
    const wallet = AElf.wallet.createNewWallet();
    wallet.publicKey = wallet.keyPair.getPublic().encode('hex');
    console.log('Your wallet info is :');
    console.log(`Mnemonic            : ${wallet.mnemonic}`);
    console.log(`Private Key         : ${wallet.privateKey}`);
    console.log(`Public Key          : ${wallet.publicKey}`);
    console.log(`Address             : ${wallet.address}`);
    const {
      localOptions,
      options,
      subOptions
    } = await super.run(commander, ...args);
    const {
      datadir
    } = options;
    const {
      saveToFile
    } = subOptions;
    const { cipher } = localOptions;
    try {
      if (saveToFile === true || saveToFile === 'true') {
        const keyStorePath = await saveKeyStore(wallet, datadir, cipher);
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

module.exports = CreateCommand;
