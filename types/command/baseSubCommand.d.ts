import asyncValidator from 'async-validator';
import { Ora } from 'ora';
import { Command } from 'commander';
import type { Options as OraOptions } from 'ora';
import Registry from '../rc/index';

declare class BaseSubCommand {
  static getUniConfig(commander: Command): { [key: string]: any };
  static parseBoolean(val: any): any;
  static normalizeConfig(obj: any): { [key: string]: any };
  constructor(
    commandName: string,
    parameters: { [key: string]: any }[] | undefined,
    description: string,
    options: { [key: string]: any }[] | undefined,
    usage: string[] | undefined,
    rc: Registry,
    validatorDesc?: { [key: string]: any },
    oraOptions?: OraOptions
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
