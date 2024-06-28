import { Command } from 'commander';
import BaseSubCommand from './baseSubCommand';
import Registry from '../rc/index';
declare class CallCommand extends BaseSubCommand {
  /**
   * Creates an instance of CallCommand.
   * @param {Registry} rc The instance of the Registry.
   * @param {string} [name] The name of the command.
   * @param {string} [description] The description of the command.
   * @param {Object[]} [parameters] The parameters for the command.
   * @param {string[]} [usage] The usage examples for the command.
   * @param {any[]} [options] The options for the command.
   */
  constructor(
    rc: Registry,
    name?: string,
    description?: string,
    parameters?: {
      type: string;
      name: string;
      message: string;
      pageSize?: number;
      choices?: string[];
      suffix: string;
      extraName?: string;
      filter?: (input: any) => string;
    }[],
    usage?: string[],
    options?: any[],
  );
  /**
   * Calls a method with specified parameters.
   * @param {any} method The method to call.
   * @param {any} params The parameters for the method call.
   * @returns {Promise<any>} A promise that resolves with the result of the method call.
   */
  callMethod(method: any, params: any): Promise<any>;
  /**
   * Processes address after prompting for input.
   * @param {any} aelf The AElf instance.
   * @param {any} wallet The wallet instance.
   * @param {Object.<string, any>} answerInput The input parameters.
   * @returns {Promise<any>} A promise that resolves with the processed result.
   */
  processAddressAfterPrompt(aelf: any, wallet: any, answerInput: { [key: string]: any }): Promise<any>;
  /**
   * Runs the command.
   * @param {Command} commander The Commander instance.
   * @param {...any[]} args Additional arguments passed to the command.
   * @returns {Promise<void>} A promise that resolves when the command execution completes.
   */
  run(commander: Command, ...args: any[]): Promise<void>;
}
export default CallCommand;
