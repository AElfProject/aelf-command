/**
 * @file get block height
 * @author atom-yang
 */
const AElf = require('aelf-sdk');
const BaseSubCommand = require('./baseSubCommand');
const { commonGlobalOptionValidatorDesc } = require('../utils/constants');

class GetBlkHeightCommand extends BaseSubCommand {
  constructor(
    rc
  ) {
    super(
      'get-blk-height',
      [],
      'get the current of specified chain',
      [],
      [],
      rc,
      commonGlobalOptionValidatorDesc
    );
  }

  async run(commander, ...args) {
    const {
      options
    } = await super.run(commander, ...args);
    const aelf = new AElf(new AElf.providers.HttpProvider(options.endpoint));
    try {
      const height = await aelf.chain.getBlockHeight();
      // todo: chalk or a custom reporter
      console.log(`> ${height}`);
    } catch (e) {
      console.error(e);
    }
  }
}

module.exports = GetBlkHeightCommand;
