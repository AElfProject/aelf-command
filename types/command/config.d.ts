import { Command } from 'commander';
import type { Rules, Values } from 'async-validator';
import BaseSubCommand from './baseSubCommand';
import Registry from '../rc/index';
declare class ConfigCommand extends BaseSubCommand {
  constructor(rc: Registry);
  validateParameters(rule: Rules, parameters: Values): Promise<void>;
  handleList(content: any): string;
  run(commander: Command, ...args: any[]): Promise<void>;
}
export default ConfigCommand;
