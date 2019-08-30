#!/usr/bin/env node
const { logger } = require('../src/utils/myLogger');

process.on('uncaughtException', err => {
  logger.error(err.message || err);
  process.exit(1);
});

require('../src/index.js').run();
