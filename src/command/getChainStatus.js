/**
 * @file get block height
 * @author atom-yang
 */
const AElf = require('aelf-sdk');
const BaseSubCommand = require('./baseSubCommand');
const { commonGlobalOptionValidatorDesc } = require('../utils/constants');
const { logger } = require('../utils/myLogger');

class GetChainStatusCommand extends BaseSubCommand {
  constructor(rc) {
    super('get-chain-status', [], 'get the current status of the block chain', [], [], rc, commonGlobalOptionValidatorDesc);
  }

  async run(commander, ...args) {
    const { options } = await super.run(commander, ...args);
    const aelf = new AElf(new AElf.providers.HttpProvider(options.endpoint));
    try {
      this.oraInstance.start();
      const status = await aelf.chain.getChainStatus();
      this.oraInstance.succeed(`Succeed\n${JSON.stringify(status, null, 2)}`);
    } catch (e) {
      this.oraInstance.fail('Failed!');
      logger.error(e);
    }
  }
}

module.exports = GetChainStatusCommand;
