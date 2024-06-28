export default ProposalCommand;
declare class ProposalCommand extends BaseSubCommand {
    constructor(rc: any, name?: string, description?: string, parameters?: ({
        type: string;
        name: string;
        message: string;
        choices: string[];
        suffix: string;
        format?: undefined;
        initial?: undefined;
    } | {
        type: string;
        name: string;
        message: string;
        suffix: string;
        choices?: undefined;
        format?: undefined;
        initial?: undefined;
    } | {
        type: string;
        name: string;
        message: string;
        format: string[];
        initial: any;
        suffix: string;
        choices?: undefined;
    })[], usage?: string[], options?: any[]);
    processAddressAfterPrompt(aelf: any, wallet: any, answerInput: any): Promise<any>;
    toContractAddress: any;
    run(commander: any, ...args: any[]): Promise<void>;
}
import BaseSubCommand from './baseSubCommand.js';
