import BaseSubCommand from './baseSubCommand';
import Registry from '../rc/index';

declare class DeployCommand extends BaseSubCommand {
  constructor(rc: Registry, name?: string, description?: string, usage?: string[]);
  run(): Promise<void>;
}
export default DeployCommand;
