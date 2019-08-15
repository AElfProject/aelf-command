/**
 * @file fs operator
 * @author atom-yang
 */
const fs = require('fs');
const os = require('os');

const { promisify } = require('./utils');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const cr = '\r'.charCodeAt(0);
const lf = '\n'.charCodeAt(0);

async function getEolFromFile(path) {
  if (!fs.existsSync(path)) {
    return undefined;
  }

  const buffer = await readFile(path);

  for (let i = 0; i < buffer.length; ++i) {
    if (buffer[i] === cr) {
      return '\r\n';
    }
    if (buffer[i] === lf) {
      return '\n';
    }
  }
  return undefined;
}

async function writeFilePreservingEol(path, data) {
  const eol = (await getEolFromFile(path)) || os.EOL;
  let result = data;
  if (eol !== '\n') {
    result = result.replace(/\n/g, eol);
  }
  await writeFile(path, result);
}

module.exports.writeFilePreservingEol = writeFilePreservingEol;
