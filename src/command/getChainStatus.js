/**
 * @file get block height
 * @author atom-yang
 */
import AElf from 'aelf-sdk';
import BaseSubCommand from './baseSubCommand.js';
import { commonGlobalOptionValidatorDesc } from '../utils/constants.js';
import { logger } from '../utils/myLogger.js';

class GetChainStatusCommand extends BaseSubCommand {
  constructor(rc) {
    super('get-chain-status', [], 'Get the current chain status', [], [], rc, commonGlobalOptionValidatorDesc);
  }

  async run(commander, ...args) {
    const { options } = await super.run(commander, ...args);
    const aelf = new AElf(new AElf.providers.HttpProvider(options.endpoint));
    try {
      this.oraInstance.start();
      const status = await aelf.chain.getChainStatus();
      this.oraInstance.succeed(`Succeed\n${JSON.stringify(status, null, 2)}`);
    } catch (e) {
      this.oraInstance.fail('Failed!');
      logger.error(e);
    }
  }
}

export default GetChainStatusCommand;
