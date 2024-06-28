export default ConsoleCommand;
declare class ConsoleCommand extends BaseSubCommand {
    constructor(rc: any, name?: string, description?: string);
    run(commander: any, ...args: any[]): Promise<void>;
}
import BaseSubCommand from './baseSubCommand.js';
