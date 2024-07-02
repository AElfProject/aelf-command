import fs from 'fs';
import os from 'os';

import { promisify } from './utils.js';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

/**
 * Carriage return character code.
 * @type {number}
 */
const cr = '\r'.charCodeAt(0);
/**
 * Line feed character code.
 * @type {number}
 */
const lf = '\n'.charCodeAt(0);

/**
 * Retrieves the end-of-line (EOL) sequence from a file.
 * @param {string} path - The path to the file.
 * @returns {Promise<string | undefined>} A promise that resolves with the EOL sequence found in the file, or undefined.
 */
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

/**
 * Writes data to a file while preserving the original end-of-line (EOL) sequence.
 * @param {string} path - The path to the file.
 * @param {string} data - The data to write.
 * @returns {Promise<void>} A promise that resolves when the file is successfully written.
 */
async function writeFilePreservingEol(path, data) {
  const eol = (await getEolFromFile(path)) || os.EOL;
  let result = data;
  if (eol !== '\n') {
    result = result.replace(/\n/g, eol);
  }
  await writeFile(path, result);
}

export { writeFilePreservingEol };
