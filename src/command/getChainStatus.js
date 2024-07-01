import AElf from 'aelf-sdk';
import BaseSubCommand from './baseSubCommand.js';
import { commonGlobalOptionValidatorDesc } from '../utils/constants.js';
import { logger } from '../utils/myLogger.js';

/**
 * @typedef {import('commander').Command} Command
 * @typedef {import('../../types/rc/index.js').default} Registry
 */
class GetChainStatusCommand extends BaseSubCommand {
  /**
   * Constructs a new GetChainStatusCommand instance.
   * @param {Registry} rc - The registry instance.
   */
  constructor(rc) {
    super('get-chain-status', [], 'Get the current chain status', [], [], rc, commonGlobalOptionValidatorDesc);
  }

  /**
   * Executes the get chain status command.
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
      const status = await aelf.chain.getChainStatus();
      this.oraInstance.succeed(`Succeed\n${JSON.stringify(status, null, 2)}`);
    } catch (e) {
      this.oraInstance.fail('Failed!');
      // @ts-ignore
      logger.error(e);
    }
  }
}

export default GetChainStatusCommand;
