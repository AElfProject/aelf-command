const Logger = require('./Logger');

const logger = new Logger({
  name: 'AElf',
  log: true
});

const plainLogger = new Logger({
  onlyWords: true,
  log: false
});

module.exports = { logger, plainLogger };
