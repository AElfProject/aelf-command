import { Ora } from 'ora';
import { DistinctQuestion } from 'inquirer';
export function promisify<T>(fn: (...args: any[]) => void, firstData?: boolean): (...args: any[]) => Promise<T>;
export function camelCase(str: string): string;
export function getContractMethods(contract?: { [key: string]: any }): string[];
export function getContractInstance(contractAddress: string, aelf: any, wallet: any, oraInstance: Ora): Promise<any>;
export function getMethod(method: any, contract: any): any;
export function promptTolerateSeveralTimes(
  {
    processAfterPrompt,
    pattern,
    times,
    prompt
  }: {
    processAfterPrompt: Function;
    pattern: string | RegExp;
    times: number;
    prompt: DistinctQuestion;
  },
  oraInstance: Ora
): Promise<{ [key: string]: any }>;
export function isAElfContract(str: string): boolean;
export function getTxResult(aelf: any, txId: string, times?: number, delay?: number, timeLimit?: number): Promise<any>;
export function parseJSON(str?: string): any;
export function randomId(): string;
export function getParams(method: any): Promise<{ [key: string]: any }>;
export function deserializeLogs(aelf: any, logs?: any[]): Promise<any>;
