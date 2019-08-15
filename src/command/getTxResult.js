/**
 * @file get block height
 * @author atom-yang
 */
const AElf = require('aelf-sdk');
const Schema = require('async-validator/dist-node/index').default;
const BaseSubCommand = require('./baseSubCommand');
const {
  commonGlobalOptionValidatorDesc,
  txResultCommandParameters,
  txResultCommandUsage
} = require('../utils/constants');

class GetTxResultCommand extends BaseSubCommand {
  constructor(rc) {
    super(
      'get-tx-result',
      txResultCommandParameters,
      'get a transaction result',
      [],
      txResultCommandUsage,
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
    await this.validateParameters({
      txHash: {
        type: 'string',
        required: true,
        message: 'Input a valid <tx-hash>'
      }
    }, subOptions);
    const aelf = new AElf(new AElf.providers.HttpProvider(options.endpoint));
    const {
      txHash,
    } = subOptions;
    try {
      const txResult = await aelf.chain.getTxResult(txHash);
      this.oraInstance.succeed('Succeed!');
      // todo: chalk
      console.log(txResult);
    } catch (e) {
      this.oraInstance.fail('Failed to run this command');
      console.log(e);
    }
  }
}

module.exports = GetTxResultCommand;
