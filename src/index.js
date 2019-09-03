/**
 * @file command index
 * @author atom-yang
 */
const commander = require('commander');
const updateNotifier = require('update-notifier');
const check = require('check-node-version');
const { execSync } = require('child_process');
const commands = require('./command/index');
const RC = require('./rc/index');
const pkg = require('../package.json');
const { logger } = require('./utils/myLogger');

const minVersion = '10.9.0';

function init() {
  commander.version(pkg.version, '-v, --version');
  commander.usage('[command] [options]');
  commander.option('-e, --endpoint <URI>', 'The URI of an AElf node. Eg: http://127.0.0.1:8000');
  commander.option('-a, --account <account>', 'The address of AElf wallet');
  commander.option('-p, --password <password>', 'The password of encrypted keyStore');
  // eslint-disable-next-line max-len
  commander.option(
    '-d, --datadir <directory>',
    'The directory that contains the AElf related files. Default to be Default to be `{home}/.local/share/aelf`'
  );
  const rc = new RC();
  Object.values(commands).forEach(Value => {
    const command = new Value(rc);
    command.init(commander);
  });
  commander.command('*').action(() => {
    // change into help
    logger.warn('not a valid command\n');
    logger.info(execSync('aelf-command -h').toString());
  });
  const args = process.env.NODE_ENV === 'test' ? process.env.mockArgs.split(',') : process.argv;
  commander.parse(args);
  if (commander.args.length === 0) commander.help();
  updateNotifier({
    pkg,
    distTag: 'latest'
  }).notify();
}

function run() {
  check({ node: `>= ${minVersion}` }, (error, results) => {
    if (error) {
      logger.error(error);
      return;
    }
    if (results.isSatisfied) {
      init();
    } else {
      logger.error('Your Node.js version is needed to >= %s', minVersion);
    }
  });
}

module.exports.run = run;
