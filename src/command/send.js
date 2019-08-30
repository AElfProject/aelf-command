/**
 * @file call read-only method on contract
 * @author atom-yang
 */
const CallCommand = require('./call');

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

module.exports = SendCommand;
