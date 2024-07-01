import AElf from 'aelf-sdk';
import BaseSubCommand from '../baseSubCommand.js';
import { getWallet } from '../../utils/wallet.js';
import { logger } from '../../utils/myLogger.js';
import Socket from './socket.js';

const commandOptions = [
  {
    flag: '--port [port]',
    name: 'port',
    description: 'Which port to listen on, the default port is 35443'
  }
];

const commandUsage = ['-port port', ''];
/**
 * @typedef {import('commander').Command} Command
 * @typedef {import('../../../types/rc/index.js').default} Registry
 */
class DeployCommand extends BaseSubCommand {
  /**
   * Creates an instance of DeployCommand.
   * @param {Registry} rc - The registry instance.
   */
  constructor(rc) {
    super('dapp-server', [], 'Start a dAPP SOCKET.IO server', commandOptions, commandUsage, rc);
  }
  /**
   * Runs the dappServer command.
   * @param {Command} commander - The commander instance.
   * @param {...any} args - Additional arguments.
   * @returns {Promise<void>} A promise that resolves when the command is complete.
   */
  async run(commander, ...args) {
    // @ts-ignore
    const { options, localOptions } = await super.run(commander, ...args);
    const { endpoint, datadir, account, password } = options;
    const { port = 35443 } = localOptions;
    try {
      const aelf = new AElf(new AElf.providers.HttpProvider(endpoint));
      const wallet = getWallet(datadir, account, password);
      const socket = new Socket({
        port,
        endpoint,
        aelf,
        wallet,
        address: account
      });
      // @ts-ignore
      logger.info(`DApp server is listening on port ${port}`);
    } catch (e) {
      this.oraInstance.fail('Failed!');
      // @ts-ignore
      logger.error(e);
    }
  }
}

export default DeployCommand;
