const Logger = require('../src/utils/Logger');

// You can test here.
const logger = new Logger({
  name: 'aelf'
});

console.log('[Color test:]');
logger.trace('123');
logger.debug('123');
logger.info('123');
logger.warn('123');
logger.error('123');
logger.fatal('123');

console.log('=========');
console.log('=========');

console.log('[Compatibility test:]');
// Is it compatible with console.log?
// If you encountered some cases that didn't log as cons≥ole.log, please issue me on Github.
// The case print normal string: passed
logger.info('Your wallet info is : ');
// The case print normal number: passed
logger.info(465743);
// The case print object directly: passed
logger.info({
  TransactionId: '0001b472595b3411b413eb05971159c5fef4352affbd42f358a60d8c7647ebdc',
  Status: 'NotExisted',
  Logs: null,
  Bloom: null,
  BlockNumber: 0,
  BlockHash: null,
  Transaction: null,
  ReadableReturnValue: null,
  Error: null
});
// The case with %s %o etc: passed
logger.error('Your Node.js version is needed to >= %s', '10.1');
// The case print at least two params: passed
logger.warn('First:', 123, 'Second:', 456);
// The case with template literal: 
const name = 'aelf';
logger.info(`name: ${name}`);
