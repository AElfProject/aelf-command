/**
 * @file get block height
 * @author atom-yang
 */
import AElf from 'aelf-sdk';
import asyncValidator from 'async-validator';
const Schema = asyncValidator.default;
import BaseSubCommand from './baseSubCommand.js';
import { commonGlobalOptionValidatorDesc, txResultCommandParameters, txResultCommandUsage } from '../utils/constants.js';
import { logger } from '../utils/myLogger.js';

class GetTxResultCommand extends BaseSubCommand {
  constructor(rc) {
    super(
      'get-tx-result',
      txResultCommandParameters,
      'Get a transaction result',
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
    const { options, subOptions } = await super.run(commander, ...args);
    try {
      await this.validateParameters(
        {
          txId: {
            type: 'string',
            required: true,
            message: 'Input a valid <tx-id>'
          }
        },
        subOptions
      );
      const aelf = new AElf(new AElf.providers.HttpProvider(options.endpoint));
      const { txId } = subOptions;
      this.oraInstance.start();
      const txResult = await aelf.chain.getTxResult(txId);
      this.oraInstance.succeed('Succeed!');
      logger.info(JSON.stringify(txResult, null, 2));
    } catch (e) {
      this.oraInstance.fail('Failed to run this command');
      logger.error(e);
    }
  }
}

export default GetTxResultCommand;
