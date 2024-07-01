import { Command } from 'commander';
import BaseSubCommand from './baseSubCommand';
import Registry from '../rc/index';
import { CallCommandParameter } from '../utils/constants';
declare class CallCommand extends BaseSubCommand {
  constructor(
    rc: Registry,
    name?: string,
    description?: string,
    parameters?: CallCommandParameter[],
    usage?: string[],
    options?: any[]
  );
  callMethod(method: any, params: any): Promise<any>;
  processAddressAfterPrompt(aelf: any, wallet: any, answerInput: { [key: string]: any }): Promise<any>;
  run(commander: Command, ...args: any[]): Promise<void>;
}
export default CallCommand;
