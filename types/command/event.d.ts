export default EventCommand;
declare class EventCommand extends BaseSubCommand {
    constructor(rc: any);
    run(commander: any, ...args: any[]): Promise<void>;
}
import BaseSubCommand from './baseSubCommand.js';
