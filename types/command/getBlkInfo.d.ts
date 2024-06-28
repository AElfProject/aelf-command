export default GetBlkInfoCommand;
declare class GetBlkInfoCommand extends BaseSubCommand {
    constructor(rc: any);
    validateParameters(rule: any, parameters: any): Promise<void>;
    run(commander: any, ...args: any[]): Promise<void>;
}
import BaseSubCommand from './baseSubCommand.js';
