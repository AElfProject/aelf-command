import asyncValidator from 'async-validator';
import { Ora } from 'ora';
import { Command } from 'commander';
import type { Options as OraOptions } from 'ora';
import Registry from '../rc/index';

declare class BaseSubCommand {
  static getUniConfig(commander: any): {};
  static parseBoolean(val: any): any;
  static normalizeConfig(obj: any): {};
  /**
   * @param {string} commandName sub command name
   * @param {{ [key: string]: any }[]} parameters sub command parameters
   * @param {string} description sub command description
   * @param {{ [key: string]: any }[]} options sub command options
   * @param {string[]} usage make examples
   * @param {Registry} rc instance of Registry
   * @param {{ [key: string]: any }} validatorDesc rules of async-validator
   * @param {{ [key: string]: any }} oraOptions an ora options
   */
  constructor(
    commandName: string,
    parameters: { [key: string]: any }[] | undefined,
    description: string,
    options: { [key: string]: any }[] | undefined,
    usage: string[] | undefined,
    rc: Registry,
    validatorDesc?: { [key: string]: any },
    oraOptions?: OraOptions,
  );
  commandName: string;
  parameters: { [key: string]: any }[];
  description: string;
  options: { [key: string]: any }[];
  validatorDesc: { [key: string]: any };
  usage: string[];
  rc: Registry;
  oraInstance: Ora;
  customPrompts: boolean;
  setCustomPrompts(val: any): void;
  init(commander: Command): void;
  getParameters(): string;
  handleUniOptionsError(error: any): void;
  run(
    commander: Command,
    ...args: any[]
  ): Promise<{
    localOptions: { [key: string]: any };
    options: { [key: string]: any };
    subOptions: { [key: string]: any };
  } | void>;
  validator: asyncValidator | undefined;
  makeExamples(): string[];
}

export default BaseSubCommand;
