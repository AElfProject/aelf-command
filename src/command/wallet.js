import BaseSubCommand from './baseSubCommand.js';
import { commonGlobalOptionValidatorDesc } from '../utils/constants.js';
import { getWallet } from '../utils/wallet.js';
import { logger } from '../utils/myLogger.js';

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
/**
 * @typedef {import('commander').Command} Command
 * @typedef {import('../../types/rc/index.js').default} Registry
 */
class WalletCommand extends BaseSubCommand {
  /**
   * Constructs a new WalletCommand instance.
   * @param {Registry} rc - The Registry instance for configuration.
   */
  constructor(rc) {
    super(
      'wallet',
      [],
      'Show wallet details which include private key, address, public key and mnemonic',
      [],
      ['-a <account> -p <password>', ''],
      rc,
      walletCommandValidatorDesc
    );
  }

  /**
   * Runs the wallet command logic.
   * @param {Command} commander - The Commander instance for command handling.
   * @param {...any} args - Additional arguments for command execution.
   * @returns {Promise<void>} A promise that resolves when the command execution is complete.
   */
  async run(commander, ...args) {
    // @ts-ignore
    const { options } = await super.run(commander, ...args);
    const { datadir, account, password } = options;
    try {
      const wallet = getWallet(datadir, account, password);
      if (wallet.mnemonic) {
        // @ts-ignore
        logger.info(`Mnemonic            : ${wallet.mnemonic}`);
      }
      wallet.publicKey = wallet.keyPair.getPublic().encode('hex');
      // @ts-ignore
      logger.info(`Private Key         : ${wallet.privateKey}`);
      // @ts-ignore
      logger.info(`Public Key          : ${wallet.publicKey}`);
      // @ts-ignore
      logger.info(`Address             : ${wallet.address}`);
      this.oraInstance.succeed('Succeed!');
    } catch (e) {
      this.oraInstance.fail('Failed!');
      // @ts-ignore
      logger.error(e);
    }
  }
}

export default WalletCommand;
