/**
 * @file Deserialize transactions result Logs
 * @author atom-yang
 */
const AElf = require('aelf-sdk');
const BaseSubCommand = require('./baseSubCommand');
const {
  commonGlobalOptionValidatorDesc,
  eventCommandParameters,
  eventCommandUsage
} = require('../utils/constants');
const {
  deserializeLogs
} = require('../utils/utils');
const {
  logger,
  plainLogger
} = require('../utils/myLogger');

class EventCommand extends BaseSubCommand {
  constructor(rc) {
    super(
      'event',
      eventCommandParameters,
      'Deserialize the result returned by executing a transaction',
      [],
      eventCommandUsage,
      rc,
      commonGlobalOptionValidatorDesc
    );
  }

  async run(commander, ...args) {
    const {
      options,
      subOptions
    } = await super.run(commander, ...args);
    const {
      endpoint
    } = options;
    try {
      const {
        txId
      } = subOptions;
      const aelf = new AElf(new AElf.providers.HttpProvider(endpoint));
      const txResult = await aelf.chain.getTxResult(txId);
      // console.log(plainLogger.info(`Transaction ${txId}'s Logs: \n ${JSON.stringify(txResult.Logs, null, 2)}`));
      if (!txResult.Status || txResult.Status.toUpperCase() !== 'MINED') {
        console.log(plainLogger.info(`Transaction ${txId} is not mined`));
      } else if (!txResult.Logs) {
        console.log(plainLogger.info(`Transaction ${txId} returns void`));
      } else {
        this.oraInstance.start('Deserialize Transaction Logs...');
        let logs = txResult.Logs;
        const results = deserializeLogs(aelf, logs);
        logs = logs.map((item, index) => ({
          ...item,
          Result: results[index]
        }));
        this.oraInstance.clear();
        // eslint-disable-next-line max-len
        console.log(`\n${plainLogger.info(`\nThe results returned by \nTransaction: ${txId} is: \n${JSON.stringify(logs, null, 2)}`)}`);
        this.oraInstance.succeed('Succeed!');
      }
    } catch (e) {
      this.oraInstance.fail('Failed!');
      logger.error(e);
    }
  }
}

module.exports = EventCommand;
