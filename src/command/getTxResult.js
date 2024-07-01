import AElf from 'aelf-sdk';
import { interopImportCJSDefault } from 'node-cjs-interop';
import asyncValidator from 'async-validator';
const Schema = interopImportCJSDefault(asyncValidator);
import BaseSubCommand from './baseSubCommand.js';
import { commonGlobalOptionValidatorDesc, txResultCommandParameters, txResultCommandUsage } from '../utils/constants.js';
import { logger } from '../utils/myLogger.js';

/**
 * @typedef {import('commander').Command} Command
 * @typedef {import('async-validator').Rules} Rules
 * @typedef {import('async-validator').Values} Values
 * @typedef {import('../../types/rc/index.js').default} Registry
 */
class GetTxResultCommand extends BaseSubCommand {
  /**
   * Constructs a new GetTxResultCommand instance.
   * @param {Registry} rc - The registry instance.
   */
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

  /**
   * Validates the parameters against given rules.
   * @param {Rules} rule - The validation rules.
   * @param {Values} parameters - The parameters to validate.
   * @returns {Promise<void>} A promise that resolves when validation is complete.
   */
  async validateParameters(rule, parameters) {
    const validator = new Schema(rule);
    try {
      await validator.validate(parameters);
    } catch (e) {
      this.handleUniOptionsError(e);
    }
  }

  /**
   * Executes the get transaction result command.
   * @param {Command} commander - The commander instance.
   * @param {...any} args - Additional arguments.
   * @returns {Promise<void>} A promise that resolves when the command execution is complete.
   */
  async run(commander, ...args) {
    // @ts-ignore
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
      // @ts-ignore
      logger.info(JSON.stringify(txResult, null, 2));
    } catch (e) {
      this.oraInstance.fail('Failed to run this command');
      // @ts-ignore
      logger.error(e);
    }
  }
}

export default GetTxResultCommand;
