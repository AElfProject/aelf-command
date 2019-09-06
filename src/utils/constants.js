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
    type: 'text',
    name: 'contract-address',
    extraName: ['contract-name'],
    message: 'Enter contract name (System contracts only) or the address of contract',
  },
  {
    type: 'select',
    name: 'method',
    message: 'Pick up a contract method',
    choices: []
  },
  {
    type: 'text',
    name: 'params',
    message: 'Enter the method params in JSON string format',
    format: val => {
      let result = null;
      try {
        result = JSON.parse(val);
      } catch (e) {
        result = val;
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
    type: 'text',
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
    type: 'toggle',
    name: 'save-to-file',
    required: false,
    initial: true,
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
    type: 'text',
    name: 'flag',
    required: true,
    message: 'Config operation key, must one of set, get, delete, list'
  },
  {
    type: 'text',
    name: 'key',
    required: false,
    message: 'Enter the key of config'
  },
  {
    type: 'text',
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
    type: 'text',
    name: 'private-key',
    extraName: ['mnemonic'],
    message: 'Enter a private key or mnemonic'
  },
  {
    type: 'toggle',
    name: 'save-to-file',
    required: false,
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
    type: 'text',
    name: 'category',
    message: 'Enter the category of the contract to be deployed'
  },
  {
    type: 'text',
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
    type: 'text',
    name: 'endpoint',
    message: 'Enter the the URI of an AElf node'
  },
  {
    type: 'text',
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
    message: 'Enter a password',
    validate(val) {
      if (!val || val.length <= 6) {
        logger.error('\npassword is too short');
        process.exit(1);
      }
    }
  },
  {
    type: 'password',
    name: 'confirm-password',
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
