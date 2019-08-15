#!/usr/bin/env node

process.on('uncaughtException', err => {
  console.error(err.message || err);
  process.exit(1);
});

require('../src/index.js').run();
