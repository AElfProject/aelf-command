/**
 * @file get block height
 * @author atom-yang
 */
import AElf from 'aelf-sdk';
import BaseSubCommand from './baseSubCommand.js';
import { commonGlobalOptionValidatorDesc } from '../utils/constants.js';
import { logger } from '../utils/myLogger.js';

class GetBlkHeightCommand extends BaseSubCommand {
  constructor(rc) {
    super('get-blk-height', [], 'Get the current block height of specified chain', [], [''], rc, commonGlobalOptionValidatorDesc);
  }

  async run(commander, ...args) {
    const { options } = await super.run(commander, ...args);
    const aelf = new AElf(new AElf.providers.HttpProvider(options.endpoint));
    try {
      this.oraInstance.start();
      const height = await aelf.chain.getBlockHeight();
      this.oraInstance.succeed(`> ${height}`);
      // todo: chalk or a custom reporter
    } catch (e) {
      this.oraInstance.fail('Failed!');
      logger.error(e);
    }
  }
}

export default GetBlkHeightCommand;
