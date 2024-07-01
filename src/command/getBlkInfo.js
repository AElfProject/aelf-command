import AElf from 'aelf-sdk';
import { interopImportCJSDefault } from 'node-cjs-interop';
import asyncValidator from 'async-validator';
const Schema = interopImportCJSDefault(asyncValidator);
import BaseSubCommand from './baseSubCommand.js';
import { commonGlobalOptionValidatorDesc, blkInfoCommandParameters, blkInfoCommandUsage } from '../utils/constants.js';
import { logger } from '../utils/myLogger.js';

/**
 * @typedef {import('commander').Command} Command
 * @typedef {import('async-validator').Rules} Rules
 * @typedef {import('async-validator').Values} Values
 * @typedef {import('../../types/rc/index.js').default} Registry
 */
class GetBlkInfoCommand extends BaseSubCommand {
  /**
   * Constructs a new GetBlkInfoCommand instance.
   * @param {Registry} rc - The registry instance.
   */
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
  /**
   * Validates the provided parameters against the given rules.
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
   * Executes the get block info command.
   * @param {Command} commander - The commander instance.
   * @param {...any} args - Additional arguments.
   * @returns {Promise<void>} A promise that resolves when the command execution is complete.
   */
  async run(commander, ...args) {
    // @ts-ignore
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
    const { height, includeTxs } = subOptions;
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
      // @ts-ignore
      logger.info(blockInfo);
    } catch (e) {
      this.oraInstance.fail('Failed!');
      // @ts-ignore
      logger.error(e);
    }
  }
}

export default GetBlkInfoCommand;
