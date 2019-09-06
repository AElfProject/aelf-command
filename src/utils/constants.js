/**
 * @file constants
 * @author atom-yang
 */
const path = require('path');
const { logger } = require('./myLogger');

const callCommandUsages = [
  '<contractName|contractAddress> <method> <params>',
  '<contractName|contractAddress> <method>',
  '<contractName|contractAddress>',
  ''
];

const callCommandParameters = [
  {
    type: 'input',
    name: 'contract-address',
    extraName: ['contract-name'],
    message: 'Enter contract name (System contracts only) or the address of contract',
    suffix: ':'
  },
  {
    type: 'list',
    name: 'method',
    message: 'Pick up a contract method',
    pageSize: 10,
    choices: []
  },
  {
    type: 'input',
    name: 'params',
    message: 'Enter the method params in JSON string format',
    format: (val = '') => {
      let result = null;
      let value = val;
      if (val.startsWith('\'') && val.endsWith('\'')) {
        value = val.slice(1, val.length - 1);
      }
      try {
        result = JSON.parse(value);
      } catch (e) {
        result = value;
      }
      return result;
    }
  }
];

const blkInfoCommandParameters = [
  {
    type: 'number',
    name: 'height',
    message: 'Enter a valid height'
  },
  {
    type: 'toggle',
    name: 'include-txs',
    required: false,
    initial: false,
    message: 'Include transactions whether or not',
    active: 'yes',
    inactive: 'no'
  }
];

const blkInfoCommandUsage = [
  '<height> <include-txs>',
  '<height>',
  ''
];

const txResultCommandParameters = [
  {
    type: 'input',
    name: 'tx-hash',
    message: 'Enter a valid transaction hash in hex format'
  }
];

const txResultCommandUsage = [
  '<tx-hash>',
  ''
];

const createCommandParameters = [
  {
    type: 'confirm',
    name: 'save-to-file',
    required: false,
    initial: true,
    default: true,
    message: 'Save account info into a file?',
    active: 'yes',
    inactive: 'no'
  }
];

const createCommandUsage = [
  '<save-to-file>',
  ''
];

const configCommandParameters = [
  {
    type: 'input',
    name: 'flag',
    required: true,
    message: 'Config operation key, must one of set, get, delete, list'
  },
  {
    type: 'input',
    name: 'key',
    required: false,
    message: 'Enter the key of config'
  },
  {
    type: 'input',
    name: 'value',
    required: false,
    message: 'Only necessary for flag <set>'
  }
];

const configCommandUsage = [
  'get <key>',
  'set <key> <value>',
  'delete <key>',
  'list'
];

const loadCommandParameters = [
  {
    type: 'input',
    name: 'private-key',
    extraName: ['mnemonic'],
    message: 'Enter a private key or mnemonic'
  },
  {
    type: 'confirm',
    name: 'save-to-file',
    required: false,
    default: true,
    initial: true,
    message: 'Save account info into a file?',
    active: 'yes',
    inactive: 'no'
  }
];

const loadCommandUsage = [
  '<private-key|mnemonic> <save-to-file>',
  '<private-key|mnemonic>',
  ''
];

const deployCommandParameters = [
  {
    type: 'input',
    name: 'category',
    message: 'Enter the category of the contract to be deployed'
  },
  {
    type: 'input',
    name: 'code-path',
    message: 'Enter the relative or absolute path of contract code',
    format(val) {
      return path.resolve(process.cwd(), val);
    }
  }
];

const deployCommandUsage = [
  '<category> <code-path>',
  '<category>',
  ''
];

const commonGlobalOptionValidatorDesc = {
  password: {
    type: 'string',
    required: false,
    message: 'set password in global config file or passed by -p <password>'
  },
  endpoint: {
    type: 'string',
    required: true,
    pattern: /(https?):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+/,
    message: 'set a valid endpoint in global config file or passed by -e <endpoint>'
  },
  datadir: {
    type: 'string',
    required: true,
    message: 'set a valid DATADIR in global config file or passed by -d <DATADIR>'
  },
  account: {
    type: 'string',
    required: false,
    message: 'set a valid account address in global config file or passed by -a <address>'
  }
};

const strictGlobalOptionValidatorDesc = {};

Object.entries(commonGlobalOptionValidatorDesc).forEach(([key, value]) => {
  strictGlobalOptionValidatorDesc[key] = {
    ...value,
    required: true
  };
});

/**
 * specified the prompts options for CLI global options
 * @type {*[]}
 */
const globalOptionsPrompts = [
  {
    type: 'input',
    name: 'endpoint',
    message: 'Enter the the URI of an AElf node'
  },
  {
    type: 'input',
    name: 'account',
    message: 'Enter a valid wallet address, if you don\'t have, create one by aelf-command create'
  },
  {
    type: 'password',
    name: 'password',
    message: 'Enter the password you typed when creating a wallet'
  }
];

const passwordPrompts = [
  {
    type: 'password',
    name: 'password',
    mask: '*',
    message: 'Enter a password',
    validate(val) {
      if (!val || val.length <= 6) {
        logger.error('\npassword is too short');
        process.exit(1);
      }
      return true;
    }
  },
  {
    type: 'password',
    name: 'confirm-password',
    mask: '*',
    message: 'Confirm password'
  }
];

module.exports = {
  callCommandUsages,
  callCommandParameters,
  commonGlobalOptionValidatorDesc,
  strictGlobalOptionValidatorDesc,
  blkInfoCommandParameters,
  blkInfoCommandUsage,
  txResultCommandParameters,
  txResultCommandUsage,
  globalOptionsPrompts,
  createCommandParameters,
  createCommandUsage,
  loadCommandParameters,
  loadCommandUsage,
  passwordPrompts,
  deployCommandUsage,
  deployCommandParameters,
  configCommandParameters,
  configCommandUsage
};
