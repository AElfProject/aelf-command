/**
 * @file fs operator
 * @author atom-yang
 */
import fs from 'fs';
import os from 'os';

import { promisify } from './utils.js';

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

export { writeFilePreservingEol };
