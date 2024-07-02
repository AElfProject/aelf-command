import { Command } from 'commander';
import type { Rules, Values } from 'async-validator';
import BaseSubCommand from './baseSubCommand';
import Registry from '../rc/index';

declare class GetTxResultCommand extends BaseSubCommand {
  constructor(rc: Registry);
  validateParameters(rule: Rules, parameters: Values): Promise<void>;
  run(commander: Command, ...args: any[]): Promise<void>;
}
export default GetTxResultCommand;
