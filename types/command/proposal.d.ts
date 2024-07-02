import { Command } from 'commander';
import BaseSubCommand from './baseSubCommand';
import Registry from '../rc/index';

declare class ProposalCommand extends BaseSubCommand {
  constructor(
    rc: Registry,
    name?: string,
    description?: string,
    parameters?: {
      type: string;
      name: string;
      message: string;
      choices?: string[];
      suffix: string;
      format?: string[];
      initial?: Date;
    }[],
    usage?: string[],
    options?: any[],
  );
  processAddressAfterPrompt(aelf: any, wallet: any, answerInput: { [key: string]: any }): Promise<any>;
  toContractAddress: any;
  run(commander: Command, ...args: any[]): Promise<void>;
}
export default ProposalCommand;
