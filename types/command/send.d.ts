import CallCommand from './call';
import Registry from '../rc/index';
export default SendCommand;
declare class SendCommand extends CallCommand {
  constructor(rc: Registry);
  callMethod(method: any, params: any): Promise<any>;
}
