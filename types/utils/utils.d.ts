export function promisify(fn: any, firstData: any): (...args: any[]) => Promise<any>;
export function camelCase(str: any): string;
/**
 * get contract methods' keys
 * @param {Object} contract contract instance
 * @return {string[]}
 */
export function getContractMethods(contract?: Object): string[];
export function getContractInstance(contractAddress: any, aelf: any, wallet: any, oraInstance: any): Promise<any>;
export function getMethod(method: any, contract: any): any;
/**
 * @description prompt contract address three times at most
 * @param {*} {
 *     times,
 *     prompt,
 *     processAfterPrompt, // a function that will process user's input with first param as the raw input value of user
 *     pattern // the regular expression to validate the user's input
 *   }
 * @param {Object} oraInstance the instance of ora library
 * @return {Object} the correct input value, if no correct was inputted, it will throw an error then exit the process
 */
export function promptTolerateSeveralTimes({ processAfterPrompt, pattern, times, prompt }: any, oraInstance: Object): Object;
export function isAElfContract(str: any): any;
export function getTxResult(aelf: any, txId: any, times?: number, delay?: number, timeLimit?: number): any;
export function parseJSON(str?: string): any;
export function randomId(): any;
export function getParams(method: any): Promise<{}>;
export function deserializeLogs(aelf: any, logs?: any[]): Promise<any>;
