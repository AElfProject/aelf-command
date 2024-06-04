/**
 * @file call read-only method on contract
 * @author atom-yang
 */
import CallCommand from './call.js';

class SendCommand extends CallCommand {
  constructor(rc) {
    super(rc, 'send', 'Execute a method on a contract.');
  }

  async callMethod(method, params) {
    this.oraInstance.start('sending the transaction');
    const result = await method(params);
    this.oraInstance.succeed('Succeed!');
    return result;
  }
}

export default SendCommand;
