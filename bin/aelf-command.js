#!/usr/bin/env node
const { logger } = require('../src/utils/myLogger');

process.noDeprecation = true;
process.on('uncaughtException', err => {
  logger.fatal(err.message || err);
  process.exit(1);
});

require('../src/index.js').run();
