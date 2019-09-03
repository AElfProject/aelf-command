/**
 * @file utils
 * @author atom-yang
 */
const _camelCase = require('camelcase');

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

module.exports = {
  promisify,
  camelCase,
  isAElfContract,
  isRegExp
};
