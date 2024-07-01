import chalk from 'chalk';
import BaseSubCommand from './baseSubCommand.js';
import { deployCommandParameters, deployCommandUsage } from '../utils/constants.js';

const tips = chalk.redBright(
  'Deprecated! Please use ',
  chalk.yellowBright('`aelf-command send`'),
  ', check details in aelf-command `README.md`'
);
/**
 * @typedef {import('../../types/rc/index.js').default} Registry
 */
class DeployCommand extends BaseSubCommand {
  /**
   * Constructs a new DeployCommand instance.
   * @param {Registry} rc - The registry instance.
   * @param {string} [name] - The name of the command.
   * @param {string} [description] - The description of the command.
   * @param {string[]} [usage] - The usage information for the command.
   */
  constructor(rc, name = 'deploy', description = tips, usage = deployCommandUsage) {
    super(name, deployCommandParameters, description, [], usage, rc);
  }
  /**
   * Executes the deploy command.
   * @returns {Promise<void>} A promise that resolves when the command execution is complete.
   */
  async run() {
    console.log(tips);
  }
}

export default DeployCommand;
