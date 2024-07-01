import path from 'path';
import fs from 'fs';
import { mkdirpSync } from 'mkdirp';
import { userHomeDir } from '../utils/userHomeDir.js';

const REGISTRY_DEFAULT_OPTIONS = {
  endpoint: '',
  datadir: path.resolve(userHomeDir, 'aelf'),
  password: '', // this is not suggested stored in config file
  account: '' // the public address of aelf wallet, encoded with base58
};

const ENV_RC_KEYS = {
  endpoint: 'AELF_CLI_ENDPOINT',
  datadir: 'AELF_CLI_DATADIR',
  account: 'AELF_CLI_ACCOUNT'
};

const rcHeader = '# THIS IS AN AUTOGENERATED FILE FOR AELF-COMMAND OPTIONS. DO NOT EDIT THIS FILE DIRECTLY.\n\n\n';

class Registry {
  constructor() {
    this.globalConfigLoc = path.resolve(userHomeDir, 'aelf/.aelfrc');
    if (!fs.existsSync(path.resolve(userHomeDir, 'aelf'))) {
      mkdirpSync(path.resolve(userHomeDir, 'aelf'));
    }
    /**
     * AELF configuration object.
     * @type {Object.<string, any>}
     */
    this.aelfConfig = {};
    this.init();
  }

  /**
   * Retrieves file content or default content if file doesn't exist.
   * @param {string} file - The file path.
   * @param {string} [defaultContent] - Optional default content if file doesn't exist.
   * @returns {*} The content of the file or default content.
   */
  static getFileOrNot(file, defaultContent = '') {
    if (fs.existsSync(file)) {
      return fs.readFileSync(file).toString();
    }
    return defaultContent;
  }

  /**
   * Retrieves file content or creates the file if it doesn't exist.
   * @param {string} file - The file path.
   * @returns {string} The file content or an empty string if the file is created.
   */
  static getFileOrCreate(file) {
    if (fs.existsSync(file)) {
      return fs.readFileSync(file).toString();
    }
    fs.writeFileSync(file, rcHeader);
    return '';
  }
  /**
   * Loads configuration from provided content.
   * @param {string} [content] - Optional content to load configuration from.
   * @returns {Object.<string, any>} The loaded configuration object.
   */
  static loadConfig(content = '') {
    const result = {};
    content
      .split('\n')
      .filter(v => !v.startsWith('#') && v.length > 0)
      .forEach(v => {
        const [key, value] = v.split(' ');
        result[key] = value;
      });
    return result;
  }
  /**
   * Retrieves configuration from environment variables.
   * @returns {Object.<string, any>} The configuration object retrieved from environment variables.
   */
  static getConfigFromEnv() {
    const result = {};
    Object.entries(ENV_RC_KEYS).forEach(([key, value]) => {
      if (process.env[value]) {
        result[key] = process.env[value];
      }
    });
    return result;
  }

  /**
   * Converts a one-level object into an array of content.
   * @param {Object.<string, any>} [obj] - The object to stringify.
   * @returns {string[]} Array of content from the object's fields.
   */
  static stringify(obj = {}) {
    let result = Object.entries(obj).map(([key, value]) => `${key} ${value}`);
    result = rcHeader.split('\n').concat(result);
    return result;
  }
  /**
   * Initializes and retrieves initial configuration options.
   * @returns {{ endpoint: string, datadir: string, password: string, account: string }} Initial configuration values.
   */
  init() {
    const pwdRc = Registry.loadConfig(Registry.getFileOrNot(path.resolve(process.cwd(), '.aelfrc')));
    const globalRc = Registry.loadConfig(Registry.getFileOrCreate(this.globalConfigLoc));
    const envRc = Registry.getConfigFromEnv();
    const rc = {
      ...REGISTRY_DEFAULT_OPTIONS,
      ...envRc,
      ...globalRc,
      ...pwdRc
    };
    this.aelfConfig = rc;
    return rc;
  }

  /**
   * Retrieves a configuration option by key.
   * @param {string} key - The option key.
   * @returns {*} The value of the option.
   */
  getOption(key) {
    return this.aelfConfig[key];
  }

  /**
   * Sets a configuration option.
   * @param {string} key - The option key.
   * @param {*} value - The value to set.
   */
  setOption(key, value) {
    this.aelfConfig[key] = value;
  }

  /**
   * Saves an option to configuration file.
   * @param {string} key - The option key.
   * @param {*} value - The value to save.
   * @param {*} [filePath] - Optional file path to save configuration.
   * @returns {*} Result of saving operation.
   */
  saveOption(key, value, filePath = this.globalConfigLoc) {
    this.aelfConfig[key] = value;
    const rc = Registry.loadConfig(Registry.getFileOrCreate(filePath));
    rc[key] = value;
    return fs.writeFileSync(filePath, `${Registry.stringify(rc).join('\n')}\n`);
  }

  /**
   * Deletes a configuration key from file.
   * @param {string} key - The option key to delete.
   * @param {*} [filePath] - Optional file path to delete from.
   * @returns {*} Result of deletion operation.
   */
  deleteConfig(key, filePath = this.globalConfigLoc) {
    const rc = Registry.loadConfig(Registry.getFileOrCreate(filePath));
    delete rc[key];
    return fs.writeFileSync(filePath, `${Registry.stringify(rc).join('\n')}\n`);
  }

  /**
   * Retrieves configurations from file.
   * @param {string} [filePath] - Optional file path to retrieve configurations.
   * @returns {Object.<string, any>} The configurations retrieved from file.
   */
  getFileConfigs(filePath = this.globalConfigLoc) {
    return Registry.loadConfig(Registry.getFileOrCreate(filePath));
  }
  /**
   * Retrieves all configurations.
   * @returns {Object.<string, any>} All configurations.
   */
  getConfigs() {
    return this.aelfConfig;
  }
}

export default Registry;
