export default DeployCommand;
declare class DeployCommand extends BaseSubCommand {
    constructor(rc: any, name?: string, description?: string, usage?: string[]);
    run(): Promise<void>;
}
import BaseSubCommand from './baseSubCommand.js';
