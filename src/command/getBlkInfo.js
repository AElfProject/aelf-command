/**
 * @file get block info
 * @author atom-yang
 */
const AElf = require('aelf-sdk');
const Schema = require('async-validator/dist-node/index').default;
const BaseSubCommand = require('./baseSubCommand');
const { commonGlobalOptionValidatorDesc, blkInfoCommandParameters, blkInfoCommandUsage } = require('../utils/constants');
const { logger } = require('../utils/myLogger');

class GetBlkInfoCommand extends BaseSubCommand {
  constructor(rc) {
    super(
      'get-blk-info',
      blkInfoCommandParameters,
      'Get a block info',
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
    const { options, subOptions } = await super.run(commander, ...args);
    await this.validateParameters(
      {
        height: {
          type: 'string',
          required: true,
          message: 'Input a valid <height|block-hash>'
        },
        includeTxs: {
          type: 'boolean',
          message: 'Input a valid <include-txs>'
        }
      },
      subOptions
    );
    const aelf = new AElf(new AElf.providers.HttpProvider(options.endpoint));
    const { height, includeTxs = false } = subOptions;
    try {
      this.oraInstance.start();
      let blockInfo;
      // usually block hash is encoded with hex and has 64 characters
      if (String(height).trim().length > 50) {
        blockInfo = await aelf.chain.getBlock(height, includeTxs);
      } else {
        blockInfo = await aelf.chain.getBlockByHeight(height, includeTxs);
      }
      this.oraInstance.succeed('Succeed!');
      logger.info(blockInfo);
    } catch (e) {
      this.oraInstance.fail('Failed!');
      logger.error(e);
    }
  }
}

module.exports = GetBlkInfoCommand;
