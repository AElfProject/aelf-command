#!/usr/bin/env node
import { logger } from '../src/utils/myLogger.js';
import { run } from '../src/index.js';

process.noDeprecation = true;
process.on('uncaughtException', err => {
  logger.fatal(err.message || err);
  process.exit(1);
});
run(process.argv);
