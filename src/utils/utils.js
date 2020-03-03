/**
 * @file utils
 * @author atom-yang
 */
const AElf = require('aelf-sdk');
const moment = require('moment');
const chalk = require('chalk');
const path = require('path');
const uuid = require('uuid/v4');
const fs = require('fs');
const _camelCase = require('camelcase');
const inquirer = require('inquirer');
const { plainLogger } = require('./myLogger');

function promisify(fn, firstData) {
  return (...args) => new Promise(((resolve, reject) => {
    args.push((err, ...result) => {
      let res = result;
      let error = err;

      if (result.length <= 1) {
        // eslint-disable-next-line prefer-destructuring
        res = result[0];
      }

      if (firstData) {
        res = error;
        error = null;
      }

      if (error) {
        reject(error);
      } else {
        resolve(res);
      }
    });

    fn.call(null, ...args);
  }));
}

function camelCase(str) {
  return _camelCase(str);
}

// todo: repository aelf-sdk, add a method that return all contract's name
// so that we can develop a better method to help us identify the aelf's contract
function isAElfContract(str) {
  return str.trim().toLowerCase().startsWith('aelf.');
}

/**
 * @description judge if the input is regular expression
 * @param {*} o
 * @returns boolean flag
 */
function isRegExp(o) {
  return o && Object.prototype.toString.call(o) === '[object RegExp]';
}

/**
 * get contract methods' keys
 * @param {Object} contract contract instance
 * @return {string[]}
 */
function getContractMethods(contract = {}) {
  if (!contract) {
    plainLogger.fatal('There is no such contract');
    process.exit(1);
  }
  return Object.keys(contract)
    .filter(v => /^[A-Z]/.test(v)).sort();
}

async function getContractInstance(
  contractAddress,
  aelf,
  wallet,
  oraInstance
) {
  if (typeof contractAddress !== 'string') {
    return contractAddress;
  }
  oraInstance.start('Fetching contract');
  let contract = null;
  try {
    if (!isAElfContract(contractAddress)) {
      contract = await aelf.chain.contractAt(contractAddress, wallet);
    } else {
      const { GenesisContractAddress } = await aelf.chain.getChainStatus();
      const genesisContract = await aelf.chain.contractAt(GenesisContractAddress, wallet);
      const address = await genesisContract.GetContractAddressByName.call(AElf.utils.sha256(contractAddress));
      contract = await aelf.chain.contractAt(address, wallet);
    }
  } catch (e) {
    oraInstance.fail(plainLogger.error('Failed to find the contract, please enter the correct contract name!'));
    process.exit(1);
  }
  oraInstance.succeed('Fetching contract successfully!');
  return contract;
}

function getMethod(method, contract) {
  if (typeof method !== 'string') {
    return method;
  }
  if (contract[method]) {
    return contract[method];
  }
  throw new Error(`Not exist method ${method}`);
}

/**
 * @description prompt contract address three times at most
 * @param {*} {
 *     times,
 *     prompt,
 *     processAfterPrompt, // a function that will process user's input with first param as the raw input value of user
 *     pattern // the regular expression to validate the user's input
 *   }
 * @param {Object} oraInstance the instance of ora library
 * @return {Object} the correct input value, if no correct was inputted, it will throw an error then exit the process
 */
async function promptTolerateSeveralTimes(
  {
    processAfterPrompt = () => {},
    pattern,
    times = 3,
    prompt = [],
  },
  oraInstance
) {
  if (pattern && !isRegExp(pattern)) {
    throw new Error("param 'pattern' must be a regular expression!");
  }
  if (processAfterPrompt && typeof processAfterPrompt !== 'function') {
    throw new Error("Param 'processAfterPrompt' must be a function!");
  }
  let askTimes = 0;
  let answerInput;
  while (askTimes < times) {
    try {
      // eslint-disable-next-line no-await-in-loop
      answerInput = await inquirer.prompt(prompt);
      // eslint-disable-next-line no-await-in-loop
      answerInput = await processAfterPrompt(answerInput);
      if (!pattern || pattern.test(answerInput)) {
        break;
      }
      askTimes++;
    } catch (e) {
      oraInstance.fail('Failed');
    }
  }
  if (askTimes >= times && answerInput === null) {
    oraInstance.fail(plainLogger.fatal(`You has entered wrong message ${times} times!`));
    process.exit(1);
  }
  return answerInput;
}

function isFilePath(val) {
  if (!val) {
    return false;
  }
  const filePath = path.resolve(process.cwd(), val);
  try {
    const stat = fs.statSync(filePath);
    return stat.isFile();
  } catch (e) {
    return false;
  }
}

async function getTxResult(aelf, txId, times = 0, delay = 3000, timeLimit = 3) {
  const currentTime = times + 1;
  await new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, delay);
  });
  const tx = await aelf.chain.getTxResult(txId);
  if (tx.Status === 'PENDING' && currentTime <= timeLimit) {
    const result = await getTxResult(aelf, txId, currentTime, delay, timeLimit);
    return result;
  }
  if (tx.Status === 'PENDING' && currentTime > timeLimit) {
    return tx;
  }
  if (tx.Status === 'MINED') {
    return tx;
  }
  throw tx;
}

function parseJSON(str = '') {
  let result = null;
  try {
    result = JSON.parse(str);
  } catch (e) {
    result = str;
  }
  return result;
}

function randomId() {
  return uuid().replace(/-/g, '');
}

const PROTO_TYPE_PROMPT_TYPE = {
  '.google.protobuf.Timestamp': {
    type: 'datetime',
    format: ['yyyy', '/', 'mm', '/', 'dd', ' ', 'HH', ':', 'MM'],
    initial: moment().add({
      hours: 1,
      minutes: 5
    }).toDate(),
    transformFunc(time) {
      return {
        seconds: moment(time).unix(),
        nanos: moment(time).milliseconds() * 1000
      };
    }
  },
  default: {
    type: 'input',
    transformFunc: v => v
  }
};

function isSpecialParameters(inputType) {
  return (
    inputType.fieldsArray
    && inputType.fieldsArray.length === 1
    && ['Hash', 'Address'].includes(inputType.name)
    && inputType.fieldsArray[0].type === 'bytes'
  );
}

async function getParamValue(type, fieldName) {
  let prompts = PROTO_TYPE_PROMPT_TYPE[type] || PROTO_TYPE_PROMPT_TYPE.default;
  const fieldNameWithoutDot = fieldName.replace('.', '');
  prompts = {
    ...prompts,
    name: fieldNameWithoutDot,
    message: `Enter the required param <${fieldName}>:`
  };
  // eslint-disable-next-line no-await-in-loop
  const promptValue = (await inquirer.prompt(prompts))[fieldNameWithoutDot];
  // eslint-disable-next-line no-await-in-loop
  let value = parseJSON(await prompts.transformFunc(promptValue));
  if (typeof value === 'string' && isFilePath(value)) {
    const filePath = path.resolve(process.cwd(), value);
    // eslint-disable-next-line no-await-in-loop
    const { read } = await inquirer.prompt({
      type: 'confirm',
      name: 'read',
      // eslint-disable-next-line max-len
      message: `It seems that you have entered a file path, do you want to read the file content and take it as the value of <${fieldName}>`
    });
    if (read) {
      try {
        fs.accessSync(filePath, fs.constants.R_OK);
      } catch (err) {
        throw new Error(`permission denied, no read access to file ${filePath}!`);
      }
      value = fs.readFileSync(filePath).toString('base64');
    }
  }
  return value;
}

async function getParams(method) {
  const fields = Object.entries(method.inputTypeInfo.fields || {});
  let result = {};
  if (fields.length > 0) {
    // eslint-disable-next-line max-len
    console.log(chalk.yellow('\nIf you need to pass file contents as a parameter, you can enter the relative or absolute path of the file\n'));
    console.log('Enter the params one by one, type `Enter` to skip optional param:');
    if (isSpecialParameters(method.inputType)) {
      let prompts = PROTO_TYPE_PROMPT_TYPE.default;
      prompts = {
        ...prompts,
        name: 'value',
        message: 'Enter the required param <value>:'
      };
      // eslint-disable-next-line no-await-in-loop
      const promptValue = (await inquirer.prompt(prompts)).value;
      result = parseJSON(promptValue);
    } else {
      // eslint-disable-next-line no-restricted-syntax
      for (const [fieldName, fieldType] of fields) {
        const { type, rule } = fieldType;
        let innerType = null;
        try {
          innerType = method.inputType.lookupType(type);
        } catch (e) {}
        let paramValue;
        // todo: use recursion
        // eslint-disable-next-line max-len
        if (rule !== 'repeated' && innerType && !isSpecialParameters(innerType) && (type || '').indexOf('google.protobuf.Timestamp') === -1) {
          let innerResult = {};
          const innerInputTypeInfo = innerType.toJSON();
          const innerFields = Object.entries(innerInputTypeInfo.fields || {});
          if (isSpecialParameters(innerFields)) {
            let prompts = PROTO_TYPE_PROMPT_TYPE.default;
            prompts = {
              ...prompts,
              name: 'value',
              message: `Enter the required param <${fieldName}.value>:`
            };
            // eslint-disable-next-line no-await-in-loop
            innerResult = (await inquirer.prompt(prompts)).value;
          } else {
            // eslint-disable-next-line no-restricted-syntax
            for (const [innerFieldName, innerFieldType] of innerFields) {
              // eslint-disable-next-line no-await-in-loop
              innerResult[innerFieldName] = parseJSON(await getParamValue(innerFieldType.type, `${fieldName}.${innerFieldName}`));
            }
          }
          paramValue = innerResult;
        } else {
          // eslint-disable-next-line no-await-in-loop
          paramValue = await getParamValue(type, fieldName);
        }
        result[fieldName] = parseJSON(paramValue);
      }
    }
  }
  return result;
}

module.exports = {
  promisify,
  camelCase,
  getContractMethods,
  getContractInstance,
  getMethod,
  promptTolerateSeveralTimes,
  isAElfContract,
  getTxResult,
  parseJSON,
  randomId,
  getParams
};
