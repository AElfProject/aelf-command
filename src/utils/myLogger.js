const Logger = require('./Logger');

const logger = new Logger({
  name: 'aelf',
  log: true
});

const plainLogger = new Logger({
  onlyWords: true,
  log: false
});

module.exports = { logger, plainLogger };
