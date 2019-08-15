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

function isHexString(str) {
  return /^(0x)?[a-f0-9]+$/.test(str.toLowerCase());
}

module.exports = {
  promisify,
  camelCase,
  isHexString
};
