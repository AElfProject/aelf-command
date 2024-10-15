import path from 'path';
import moment from 'moment';
import inquirer from 'inquirer';
import { logger } from './myLogger.js';
import DatePrompt from 'inquirer-date-prompt';
import SearchList from 'inquirer-search-list';

/**
 * @typedef {import('../../types/utils/constants.js').CallCommandParameter} CallCommandParameter
 * @typedef {import('../../types/utils/constants.js').PasswordValidatorDesc} PasswordValidatorDesc
 * @typedef {import('../../types/utils/constants.js').EndpointValidatorDesc} EndpointValidatorDesc
 * @typedef {import('../../types/utils/constants.js').DatadirValidatorDesc} DatadirValidatorDesc
 * @typedef {import('../../types/utils/constants.js').AccountValidatorDesc} AccountValidatorDesc
 * @typedef {import('../../types/utils/constants.js').CommonGlobalOptionValidatorDesc} CommonGlobalOptionValidatorDesc
 * @typedef {import('../../types/utils/constants.js').BlkInfoCommandParameter} BlkInfoCommandParameter
 * @typedef {import('../../types/utils/constants.js').TxResultCommandParameter} TxResultCommandParameter
 * @typedef {import('../../types/utils/constants.js').GlobalOptionPrompt} GlobalOptionPrompt
 * @typedef {import('../../types/utils/constants.js').CreateCommandParameter} CreateCommandParameter
 * @typedef {import('../../types/utils/constants.js').LoadCommandParameter} LoadCommandParameter
 * @typedef {import('../../types/utils/constants.js').PasswordPrompt} PasswordPrompt
 * @typedef {import('../../types/utils/constants.js').DeployCommandParameter} DeployCommandParameter
 * @typedef {import('../../types/utils/constants.js').ConfigCommandParameter} ConfigCommandParameter
 * @typedef {import('../../types/utils/constants.js').ProposalCommandParameter} ProposalCommandParameter
 * @typedef {import('../../types/utils/constants.js').EventCommandParameter} EventCommandParameter
 * @typedef {'password' | 'endpoint' | 'datadir' | 'account'} CommonGlobalOptionKey
 */

/**
 * Array of usage strings for the call command.
 * @type {string[]}
 */
const callCommandUsages = [
  '<contractName|contractAddress> <method> <params>',
  '<contractName|contractAddress> <method>',
  '<contractName|contractAddress>',
  ''
];

/**
 * Parameters for the call command.
 * @type {CallCommandParameter[]}
 */
const callCommandParameters = [
  {
    type: 'input',
    name: 'contract-address',
    extraName: ['contract-name'],
    message: 'Enter contract name (System contracts only) or the address of contract',
    suffix: ':'
  },
  {
    type: 'search-list',
    name: 'method',
    message: 'Pick up a contract method',
    pageSize: 10,
    choices: [],
    suffix: ':'
  },
  {
    type: 'input',
    name: 'params',
    message: 'Enter the method params in JSON string or plain text format',
    suffix: ':',
    filter: (val = '') => {
      let result = null;
      let value = val;
      if (val.startsWith("'") && val.endsWith("'")) {
        value = val.slice(1, val.length - 1);
      }
      try {
        result = JSON.parse(value);
      } catch (e) {
        result = value;
      }
      return JSON.stringify(result);
    }
  }
];

/**
 * Parameters for the blkInfo command.
 * @type {BlkInfoCommandParameter[]}
 */
const blkInfoCommandParameters = [
  {
    type: 'input',
    name: 'height',
    extraName: ['block-hash'],
    message: 'Enter a valid height or block hash',
    suffix: ':'
  },
  {
    type: 'confirm',
    name: 'include-txs',
    required: false,
    initial: false,
    message: 'Include transactions whether or not',
    active: 'yes',
    inactive: 'no',
    suffix: '?'
  }
];

/**
 * Array of usage strings for the blkInfo command.
 * @type {string[]}
 */
const blkInfoCommandUsage = ['<height|block-hash> <include-txs>', '<height|block-hash>', ''];

// @ts-ignore
inquirer.registerPrompt('datetime', DatePrompt);
inquirer.registerPrompt('search-list', SearchList);

/**
 * Parameters for the proposal command.
 * @type {ProposalCommandParameter[]}
 */
const proposalCommandParameters = [
  {
    type: 'list',
    name: 'proposal-contract',
    message: 'Pick up a contract name to create a proposal',
    choices: ['AElf.ContractNames.Parliament', 'AElf.ContractNames.Referendum', 'AElf.ContractNames.Association'],
    suffix: ':'
  },
  {
    type: 'input',
    name: 'organization',
    message: 'Enter an organization address',
    suffix: ':'
  },
  {
    type: 'date',
    name: 'expired-time',
    message: 'Select the expired time for this proposal',
    format: ['yyyy', '/', 'mm', '/', 'dd', ' ', 'HH', ':', 'MM'],
    initial: moment()
      .add({
        hours: 1,
        minutes: 5
      })
      .toDate(),
    suffix: ':'
  },
  {
    type: 'input',
    name: 'descriptionUrl',
    message: 'Optional, input an URL for proposal description',
    suffix: ':'
  }
];

/**
 * Array of usage strings for the proposal command.
 * @type {string[]}
 */
const proposalCommandUsage = [
  '<proposal-contract> <organization> <expired-time>',
  '<proposal-contract> <organization>',
  '<proposal-contract>',
  ''
];

/**
 * Parameters for the txResult command.
 * @type {TxResultCommandParameter[]}
 */
const txResultCommandParameters = [
  {
    type: 'input',
    name: 'tx-id',
    message: 'Enter a valid transaction id in hex format',
    suffix: ':'
  }
];

/**
 * Array of usage strings for the txResult command.
 * @type {string[]}
 */
const txResultCommandUsage = ['<tx-id>', ''];

/**
 * Parameters for the create command.
 * @type {CreateCommandParameter[]}
 */
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

/**
 * Array of usage strings for the create command.
 * @type {string[]}
 */
const createCommandUsage = ['<save-to-file> -c, cipher', '-c, cipher', ''];

/**
 * Parameters for the config command.
 * @type {ConfigCommandParameter[]}
 */
const configCommandParameters = [
  {
    type: 'input',
    name: 'flag',
    required: true,
    message: 'Config operation key, must one of set, get, delete, list',
    suffix: ':'
  },
  {
    type: 'input',
    name: 'key',
    required: false,
    message: 'Enter the key of config',
    suffix: ':'
  },
  {
    type: 'input',
    name: 'value',
    required: false,
    message: 'Only necessary for flag <set>',
    suffix: ':'
  }
];

/**
 * Array of usage strings for the config command.
 * @type {string[]}
 */
const configCommandUsage = ['get <key>', 'set <key> <value>', 'delete <key>', 'list'];

/**
 * Parameters for the load command.
 * @type {LoadCommandParameter[]}
 */
const loadCommandParameters = [
  {
    type: 'input',
    name: 'private-key',
    extraName: ['mnemonic'],
    message: 'Enter a private key or mnemonic',
    suffix: ':'
  },
  // confirm and list cannot use validate
  {
    type: 'confirm',
    message: 'Mnemonic created by aelf-command less than v1.0.0?',
    name: 'created-by-old',
    required: false,
    default: true,
    initial: true,
    active: 'yes',
    inactive: 'no',
    suffix: '?',
    when(answers) {
      return answers['private-key'].trim().split(' ').length > 1;
    }
  },
  {
    type: 'confirm',
    name: 'save-to-file',
    required: false,
    default: true,
    initial: true,
    message: 'Save account info into a file',
    active: 'yes',
    inactive: 'no',
    suffix: '?'
  }
];

/**
 * Array of usage strings for the load command.
 * @type {string[]}
 */
const loadCommandUsage = [
  '<private-key|mnemonic> <created-by-old> <save-to-file>',
  '<private-key|mnemonic> <save-to-file>',
  '<private-key|mnemonic>',
  ''
];

/**
 * Parameters for the deploy command.
 * @type {DeployCommandParameter[]}
 */
const deployCommandParameters = [
  {
    type: 'input',
    name: 'category',
    message: 'Enter the category of the contract to be deployed',
    suffix: ':'
  },
  {
    type: 'input',
    name: 'code-path',
    message: 'Enter the relative or absolute path of contract code',
    filter(val) {
      return path.resolve(process.cwd(), val);
    },
    suffix: ':'
  }
];

/**
 * Array of usage strings for the deploy command.
 * @type {string[]}
 */
const deployCommandUsage = ['<category> <code-path>', '<category>', ''];

/**
 * Parameters for the event command.
 * @type {EventCommandParameter[]}
 */
const eventCommandParameters = [
  {
    type: 'input',
    name: 'tx-id',
    message: 'Enter the transaction id',
    suffix: ':'
  }
];

/**
 * Array of usage strings for the event command.
 * @type {string[]}
 */
const eventCommandUsage = ['<tx-id>', ''];

/**
 * Validator description for common global options.
 * @type {CommonGlobalOptionValidatorDesc}
 */
const commonGlobalOptionValidatorDesc = {
  password: {
    type: 'string',
    required: false,
    message: 'set password in global config file or passed by -p <password>',
    validator(rule, value) {
      if (rule.required === false) {
        return true;
      }
      return !!value || value === '';
    }
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
  },
  csv: {
    type: 'string',
    required: false,
    message: 'set params in csv file by -c <csv>'
  },
  json: {
    type: 'string',
    required: false,
    message: 'set params in csv file by -j <json>'
  }
};

const strictGlobalOptionValidatorDesc = /**@type {CommonGlobalOptionValidatorDesc}*/ ({});

// @ts-ignore
Object.entries(commonGlobalOptionValidatorDesc).forEach((/** @type {[CommonGlobalOptionKey, any]} */ [key, value]) => {
  strictGlobalOptionValidatorDesc[key] = {
    ...value
    // required: true
  };
});

const callGlobalOptionValidatorDesc = /**@type {CommonGlobalOptionValidatorDesc}*/ ({});
// @ts-ignore
Object.entries(commonGlobalOptionValidatorDesc).forEach((/** @type {[CommonGlobalOptionKey, any]} */ [key, value]) => {
  if (key === 'account' || key === 'password') {
    strictGlobalOptionValidatorDesc[key] = {
      ...value,
      required: false
    };
  } else {
    strictGlobalOptionValidatorDesc[key] = {
      ...value
    };
  }
});

/**
 * Array of global option prompts.
 * @type {GlobalOptionPrompt[]}
 */
const globalOptionsPrompts = [
  {
    type: 'input',
    name: 'endpoint',
    message: 'Enter the the URI of an AElf node',
    suffix: ':'
  },
  {
    type: 'input',
    name: 'account',
    message: "Enter a valid wallet address, if you don't have, create one by aelf-command create",
    suffix: ':'
  },
  {
    type: 'password',
    name: 'password',
    mask: '*',
    message: 'Enter the password you typed when creating a wallet',
    suffix: ':'
  }
];

/**
 * Array of password prompts.
 * @type {PasswordPrompt[]}
 */
const passwordPrompts = [
  {
    type: 'password',
    name: 'password',
    mask: '*',
    message: 'Enter a password',
    validate(val) {
      if (!val || val.length <= 6) {
        // @ts-ignore
        logger.error('\npassword is too short');
        process.exit(1);
      }
      return true;
    },
    suffix: ':'
  },
  {
    type: 'password',
    name: 'confirm-password',
    mask: '*',
    message: 'Confirm password',
    suffix: ':'
  }
];

export {
  callCommandUsages,
  callCommandParameters,
  commonGlobalOptionValidatorDesc,
  strictGlobalOptionValidatorDesc,
  callGlobalOptionValidatorDesc,
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
  configCommandUsage,
  proposalCommandParameters,
  proposalCommandUsage,
  eventCommandParameters,
  eventCommandUsage
};
