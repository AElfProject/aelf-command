/**
 * @file get block height
 * @author atom-yang
 */
const AElf = require('aelf-sdk');
const BaseSubCommand = require('./baseSubCommand');
const { commonGlobalOptionValidatorDesc } = require('../utils/constants');
const logger = require('../utils/myLogger');

class GetBlkHeightCommand extends BaseSubCommand {
  constructor(rc) {
    super('get-blk-height', [], 'get the current of specified chain', [], [], rc, commonGlobalOptionValidatorDesc);
  }

  async run(commander, ...args) {
    const { options } = await super.run(commander, ...args);
    const aelf = new AElf(new AElf.providers.HttpProvider(options.endpoint));
    try {
      this.oraInstance.start();
      const height = await aelf.chain.getBlockHeight();
      this.oraInstance.succeed(`> ${height}`);
      // todo: chalk or a custom reporter
    } catch (e) {
      this.oraInstance.fail('Failed!');
      logger.error(e);
    }
  }
}

module.exports = GetBlkHeightCommand;
