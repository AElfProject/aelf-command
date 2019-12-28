/**
 * @file command index
 * @author atom-yang
 */
const commander = require('commander');
const chalk = require('chalk');
const updateNotifier = require('update-notifier');
const check = require('check-node-version');
const { execSync } = require('child_process');
const commands = require('./command/index');
const RC = require('./rc/index');
const pkg = require('../package.json');
const { logger } = require('./utils/myLogger');
const {
  userHomeDir
} = require('./utils/userHomeDir');

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
    `The directory that contains the AElf related files. Default to be ${userHomeDir}/aelf`
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
  const isTest = process.env.NODE_ENV === 'test';
  const args = isTest ? process.env.mockArgs.split(',') : process.argv;
  commander.parse(args);
  if (commander.args.length === 0) commander.help();

  if (!isTest) {
    const notifier = updateNotifier({
      pkg,
      distTag: 'latest',
      updateCheckInterval: 1000 * 60 * 60 * 1 // one hours
    });

    if (notifier.update) {
      notifier.notify({
        message: `Update available ${chalk.dim(pkg.version)} ${chalk.reset('→')} ${chalk.green(notifier.update.latest)}
      Run ${chalk.cyan('npm i aelf-command -g')} to update`
      });
    }
  }
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
