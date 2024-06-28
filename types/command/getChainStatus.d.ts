export default GetChainStatusCommand;
declare class GetChainStatusCommand extends BaseSubCommand {
    constructor(rc: any);
    run(commander: any, ...args: any[]): Promise<void>;
}
import BaseSubCommand from './baseSubCommand.js';
