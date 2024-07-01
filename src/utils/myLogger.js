import Logger from './Logger.js';

/**
 * Instance of Logger with full logging enabled.
 * @type {Logger}
 */
const logger = new Logger({
  name: 'AElf',
  log: true
});
/**
 * Instance of Logger that logs only words.
 * @type {Logger}
 */
const plainLogger = new Logger({
  onlyWords: true,
  log: false
});

export { logger, plainLogger };
