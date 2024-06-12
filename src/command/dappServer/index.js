/**
 * @file start a dapp server
 * @author atom-yang
 */
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

class DeployCommand extends BaseSubCommand {
  constructor(rc) {
    super('dapp-server', [], 'Start a dAPP SOCKET.IO server', commandOptions, commandUsage, rc);
  }

  async run(commander, ...args) {
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
      logger.info(`DApp server is listening on port ${port}`);
    } catch (e) {
      this.oraInstance.fail('Failed!');
      logger.error(e);
    }
  }
}

export default DeployCommand;
