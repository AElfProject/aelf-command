/**
 * @file get block info
 * @author atom-yang
 */
const AElf = require('aelf-sdk');
const Schema = require('async-validator/dist-node/index').default;
const BaseSubCommand = require('./baseSubCommand');
const {
  commonGlobalOptionValidatorDesc,
  blkInfoCommandParameters,
  blkInfoCommandUsage
} = require('../utils/constants');

class GetBlkInfoCommand extends BaseSubCommand {
  constructor(
    rc
  ) {
    super(
      'get-blk-info',
      blkInfoCommandParameters,
      'get a block info',
      [],
      blkInfoCommandUsage,
      rc,
      commonGlobalOptionValidatorDesc
    );
  }

  async validateParameters(rule, parameters) {
    const validator = new Schema(rule);
    try {
      await validator.validate(parameters);
    } catch (e) {
      this.handleUniOptionsError(e);
    }
  }

  async run(commander, ...args) {
    const {
      options,
      subOptions
    } = await super.run(commander, ...args);
    subOptions.height = parseInt(subOptions.height, 10);
    await this.validateParameters({
      height: {
        type: 'number',
        required: true,
        message: 'Input a valid <height>'
      },
      includeTxs: {
        type: 'boolean',
        message: 'Input a valid <include-txs>'
      }
    }, subOptions);
    const aelf = new AElf(new AElf.providers.HttpProvider(options.endpoint));
    const {
      height,
      includeTxs = false
    } = subOptions;
    try {
      const blockInfo = await aelf.chain.getBlockByHeight(height, includeTxs);
      // todo: chalk
      console.log(blockInfo);
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = GetBlkInfoCommand;
