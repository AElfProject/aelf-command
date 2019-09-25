/**
 * @file utils
 * @author atom-yang
 */
const AElf = require('aelf-sdk');
const path = require('path');
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
  if (!isAElfContract(contractAddress)) {
    try {
      contract = await aelf.chain.contractAt(contractAddress, wallet);
    } catch (err) {
      oraInstance.fail(plainLogger.error('Failed to find the contract, please enter the correct contract name!'));
      return null;
    }
  } else {
    try {
      const { GenesisContractAddress } = await aelf.chain.getChainStatus();
      const genesisContract = await aelf.chain.contractAt(GenesisContractAddress, wallet);
      const address = await genesisContract.GetContractAddressByName.call(AElf.utils.sha256(contractAddress));
      contract = await aelf.chain.contractAt(address, wallet);
    } catch (error) {
      oraInstance.fail(plainLogger.error('Failed to find the contract, please enter the correct contract address!'));
      return null;
    }
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
  return fs.existsSync(filePath);
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

module.exports = {
  promisify,
  camelCase,
  getContractMethods,
  getContractInstance,
  getMethod,
  promptTolerateSeveralTimes,
  isAElfContract,
  isFilePath,
  getTxResult,
  parseJSON
};
