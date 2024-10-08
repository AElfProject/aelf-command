/**
 * @file command index
 * @author atom-yang
 */
import { Command } from 'commander';
import chalk from 'chalk';
// @ts-ignore
import updateNotifier from 'update-notifier';
import check from 'check-node-version';
import { execSync } from 'child_process';
import commands from './command/index.js';
import RC from './rc/index.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { logger } from './utils/myLogger.js';
import { userHomeDir } from './utils/userHomeDir.js';

const minVersion = '10.9.0';

export function getPackageJson() {
  let dirname;
  try {
    // for test as we cannot use import.meta.url in Jest
    dirname = __dirname;
  } catch {
    const __filename = fileURLToPath(import.meta.url);
    dirname = path.dirname(__filename);
  }
  const filePath = path.resolve(dirname, '../package.json');
  const data = readFileSync(filePath, 'utf-8');
  const packageJson = JSON.parse(data);
  return packageJson;
}

function init(options) {
  const pkg = getPackageJson();
  const commander = new Command();
  // Configuration for test
  if (options?.exitOverride) {
    // throws a JavaScript error instead of the original process exit
    commander.exitOverride();
  }
  if (options?.suppressOutput) {
    commander.configureOutput({
      writeOut: str => process.stdout.write(`[OUT] ${str}`)
    });
  }
  commander.version(pkg.version, '-v, --version');
  commander.usage('[command] [options]');
  commander.option('-e, --endpoint <URI>', 'The URI of an AElf node. Eg: http://127.0.0.1:8000');
  commander.option('-a, --account <account>', 'The address of AElf wallet');
  commander.option('-p, --password <password>', 'The password of encrypted keyStore');
  commander.option(
    '-d, --datadir <directory>',
    `The directory that contains the AElf related files. Default to be ${userHomeDir}/aelf`
  );
  commander.option('-c, --csv <csv>', 'The location of the CSV file containing the parameters.');
  commander.option('-j, --json <json>', 'The location of the JSON file containing the parameters.');
  const rc = new RC();
  Object.values(commands).forEach(Value => {
    const command = new Value(rc);
    command.init(commander);
  });
  commander.command('*').action(() => {
    // change into help
    // @ts-ignore
    logger.warn('not a valid command\n');
    // @ts-ignore
    logger.info(execSync('aelf-command -h').toString());
  });
  const isTest = process.env.NODE_ENV === 'test';
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
  return commander;
}

function run(args, options) {
  check({ node: `>= ${minVersion}` }, (error, results) => {
    if (error) {
      // @ts-ignore
      logger.error(error);
      return;
    }
    if (results.isSatisfied) {
      const isTest = process.env.NODE_ENV === 'test';
      init({ exitOverride: options?.exitOverride, suppressOutput: options?.suppressOutput }).parse(
        args,
        isTest ? { from: 'user' } : undefined
      );
    } else {
      // @ts-ignore
      logger.error('Your Node.js version is needed to >= %s', minVersion);
    }
  });
}

export { run };
