/**
 * @file start a dapp server
 * @author atom-yang
 */
const AElf = require('aelf-sdk');
const BaseSubCommand = require('../baseSubCommand');
const { getWallet } = require('../../utils/wallet');
const { logger } = require('../../utils/myLogger');
const Socket = require('./socket');

const commandOptions = [
  {
    flag: '--port [port]',
    name: 'port',
    description: 'Which port to listen on, the default port is 35443'
  }
];

const commandUsage = [
  '-port port',
  ''
];

class DeployCommand extends BaseSubCommand {
  constructor(
    rc
  ) {
    super(
      'dapp-server',
      [],
      'Create a dapp server',
      commandOptions,
      commandUsage,
      rc
    );
  }

  async run(commander, ...args) {
    const { options, localOptions } = await super.run(commander, ...args);
    const {
      endpoint,
      datadir,
      account,
      password
    } = options;
    const { port = 35443 } = localOptions;
    try {
      const aelf = new AElf(new AElf.providers.HttpProvider(endpoint));
      const wallet = getWallet(datadir, account, password);
      // eslint-disable-next-line no-unused-vars
      const socket = new Socket({
        port,
        endpoint,
        aelf,
        wallet,
        account
      });
      logger.info(`DApp server is listening on port ${port}`);
    } catch (e) {
      this.oraInstance.fail('Failed!');
      logger.error(e);
    }
  }
}

module.exports = DeployCommand;
