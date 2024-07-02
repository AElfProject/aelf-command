import AElf from 'aelf-sdk';
import BaseSubCommand from './baseSubCommand.js';
import { commonGlobalOptionValidatorDesc, loadCommandParameters, loadCommandUsage } from '../utils/constants.js';
import { saveKeyStore } from '../utils/wallet.js';
import { logger } from '../utils/myLogger.js';

const loadCommandValidatorDesc = {
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
class LoadCommand extends BaseSubCommand {
  /**
   * Constructs a new LoadCommand instance.
   * @param {Registry} rc - The registry instance.
   */
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

  /**
   * Executes the load command.
   * @param {Command} commander - The commander instance.
   * @param {...any} args - Additional arguments.
   * @returns {Promise<void>} A promise that resolves when the command execution is complete.
   */
  async run(commander, ...args) {
    // @ts-ignore
    const { options, subOptions } = await super.run(commander, ...args);
    const { datadir } = options;
    const { privateKey, saveToFile, createdByOld } = subOptions;
    try {
      let wallet = null;
      // @ts-ignore
      logger.info('Your wallet info is :');
      if (privateKey.trim().split(' ').length > 1) {
        if (createdByOld) {
          // old version sdk
          this.oraInstance.fail('Please install older versions of aelf-command before v1.0.0!');
          return;
        }
        wallet = AElf.wallet.getWalletByMnemonic(privateKey.trim());
        // @ts-ignore
        logger.info(`Mnemonic            : ${wallet.mnemonic}`);
      } else {
        wallet = AElf.wallet.getWalletByPrivateKey(privateKey.trim());
      }
      wallet.publicKey = wallet.keyPair.getPublic().encode('hex');
      // @ts-ignore
      logger.info(`Private Key         : ${wallet.privateKey}`);
      // @ts-ignore
      logger.info(`Public Key          : ${wallet.publicKey}`);
      // @ts-ignore
      logger.info(`Address             : ${wallet.address}`);
      if (saveToFile === true || saveToFile === 'true') {
        const keyStorePath = await saveKeyStore(wallet, datadir);
        this.oraInstance.succeed(`Account info has been saved to \"${keyStorePath}\"`);
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

export default LoadCommand;
