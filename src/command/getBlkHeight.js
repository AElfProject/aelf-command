import AElf from 'aelf-sdk';
import BaseSubCommand from './baseSubCommand.js';
import { commonGlobalOptionValidatorDesc } from '../utils/constants.js';
import { logger } from '../utils/myLogger.js';

/**
 * @typedef {import('commander').Command} Command
 * @typedef {import('../../types/rc/index.js').default} Registry
 */
class GetBlkHeightCommand extends BaseSubCommand {
  /**
   * Constructs a new GetBlkHeightCommand instance.
   * @param {Registry} rc - The registry instance.
   */
  constructor(rc) {
    super('get-blk-height', [], 'Get the current block height of specified chain', [], [''], rc, commonGlobalOptionValidatorDesc);
  }

  /**
   * Executes the get block height command.
   * @param {Command} commander - The commander instance.
   * @param {...any} args - Additional arguments.
   * @returns {Promise<void>} A promise that resolves when the command execution is complete.
   */
  async run(commander, ...args) {
    // @ts-ignore
    const { options } = await super.run(commander, ...args);
    const aelf = new AElf(new AElf.providers.HttpProvider(options.endpoint));
    try {
      this.oraInstance.start();
      const height = await aelf.chain.getBlockHeight();
      this.oraInstance.succeed(`> ${height}`);
      // todo: chalk or a custom reporter
    } catch (e) {
      this.oraInstance.fail('Failed!');
      // @ts-ignore
      logger.error(e);
    }
  }
}

export default GetBlkHeightCommand;
