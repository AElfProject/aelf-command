export default GetTxResultCommand;
declare class GetTxResultCommand extends BaseSubCommand {
    constructor(rc: any);
    validateParameters(rule: any, parameters: any): Promise<void>;
    run(commander: any, ...args: any[]): Promise<void>;
}
import BaseSubCommand from './baseSubCommand.js';
