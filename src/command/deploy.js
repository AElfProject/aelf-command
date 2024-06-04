/**
 * @file deploy contract
 * @author atom-yang
 */
import chalk from 'chalk';
import BaseSubCommand from './baseSubCommand.js';
import { deployCommandParameters, deployCommandUsage } from '../utils/constants.js';

// eslint-disable-next-line max-len
const tips = chalk.redBright(
  'Deprecated! Please use ',
  chalk.yellowBright('`aelf-command send`'),
  ', check details in aelf-command `README.md`'
);

class DeployCommand extends BaseSubCommand {
  constructor(rc, name = 'deploy', description = tips, usage = deployCommandUsage) {
    super(name, deployCommandParameters, description, [], usage, rc);
  }

  async run() {
    // eslint-disable-next-line max-len
    console.log(tips);
  }
}

export default DeployCommand;
