import Logger from './Logger.js';

const logger = new Logger({
  name: 'AElf',
  log: true
});

const plainLogger = new Logger({
  onlyWords: true,
  log: false
});

export { logger, plainLogger };
