import { Command } from 'commander';
import BaseSubCommand from './baseSubCommand';
import Registry from '../rc/index';
declare class ConsoleCommand extends BaseSubCommand {
  constructor(rc: Registry, name?: string, description?: string);
  run(commander: Command, ...args: any[]): Promise<void>;
}
export default ConsoleCommand;
