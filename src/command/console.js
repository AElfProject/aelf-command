/**
 * @file console command
 * @author atom-yang
 */
import repl from 'repl';
import AElf from 'aelf-sdk';
import columnify from 'columnify';
import boxen from 'boxen';
import BaseSubCommand from './baseSubCommand.js';
import { getWallet } from '../utils/wallet.js';
import { logger } from '../utils/myLogger.js';

class ConsoleCommand extends BaseSubCommand {
  constructor(rc, name = 'console', description = 'Open a node REPL') {
    super(name, [], description, [], [''], rc);
  }

  async run(commander, ...args) {
    const { options } = await super.run(commander, ...args);
    const { datadir, account, password, endpoint } = options;
    try {
      const aelf = new AElf(new AElf.providers.HttpProvider(endpoint));
      const wallet = getWallet(datadir, account, password);
      this.oraInstance.succeed('Succeed!');
      const columns = columnify(
        [
          {
            Name: 'AElf',
            description: 'imported from aelf-sdk'
          },
          {
            Name: 'aelf',
            description: `instance of aelf-sdk, connect to ${endpoint}`
          },
          {
            Name: '_account',
            description: `instance of AElf wallet, wallet address is ${account}`
          }
        ],
        {
          minWidth: 10,
          columnSplitter: ' | ',
          config: {
            description: { maxWidth: 40 }
          }
        }
      );
      logger.info('Welcome to aelf interactive console. Ctrl + C to terminate the program. Double tap Tab to list objects');
      logger.info(
        boxen(columns, {
          padding: 1,
          margin: 1,
          borderStyle: 'double'
        })
      );
      const r = repl.start({
        prompt: '>'
      });
      r.context.AElf = AElf;
      r.context.aelf = aelf;
      r.context._account = wallet;
    } catch (e) {
      this.oraInstance.fail('Failed!');
      logger.error(e);
    }
  }
}

export default ConsoleCommand;
