import { callCommandParameters, callCommandUsages, strictGlobalOptionValidatorDesc } from '../utils/constants.js';
import CallCommand from './call.js';

/**
 * @typedef {import('../../types/rc/index.js').default} Registry
 */
class SendCommand extends CallCommand {
  /**
   * Creates an instance of SendCommand.
   * @param {Registry} rc - The registry instance.
   */
  constructor(rc) {
    super(
      rc,
      'send',
      'Execute a method on a contract.',
      callCommandParameters,
      callCommandUsages,
      [],
      strictGlobalOptionValidatorDesc
    );
  }

  /**
   * Asynchronously calls a method and handles transaction progress.
   * @param {any} method - The method to call.
   * @param {any} params - The parameters for the method.
   * @returns {Promise<any>} A promise that resolves to the result of the method call.
   */
  async callMethod(method, params) {
    this.oraInstance.start('sending the transaction');
    const result = await method(params);
    this.oraInstance.succeed('Succeed!');
    return result;
  }
}

export default SendCommand;
