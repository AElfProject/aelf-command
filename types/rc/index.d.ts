declare class Registry {
  constructor();
  static getFileOrNot(file: string, defaultContent?: string): any;
  static getFileOrCreate(file: string): string;
  static loadConfig(content?: string): { [key: string]: any };
  static getConfigFromEnv(): { [key: string]: any };
  static stringify(obj?: { [key: string]: any }): string[];
  globalConfigLoc: string;
  aelfConfig: { [key: string]: any };
  init(): {
    endpoint: string;
    datadir: string;
    password: string;
    account: string;
  };
  getOption(key: string): any;
  setOption(key: string, value: any): void;
  saveOption(key: string, value: any, filePath?: any): any;
  deleteConfig(key: string, filePath?: any): any;
  getFileConfigs(filePath?: string): { [key: string]: any };
  getConfigs(): { [key: string]: any };
}
export default Registry;
