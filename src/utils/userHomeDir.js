import path from 'path';
import { homedir } from 'os';

/**
 * Path to the home directory.
 * @type {string}
 */
const home = homedir();

/**
 * Retrieves the user ID (UID) of the current process.
 * @returns {number | null} The UID of the current process if available, otherwise null.
 */
function getUid() {
  if (process.platform !== 'win32' && process.getuid) {
    return process.getuid();
  }
  return null;
}

/**
 * Checks if the current environment is a fake root environment.
 * @returns {boolean} True if the environment is a fake root, false otherwise.
 */
function isFakeRoot() {
  return Boolean(process.env.FAKEROOTKEY);
}

/**
 * Checks if a given user ID belongs to the root user.
 * @param {number | null} uid - The user ID to check.
 * @returns {boolean} True if the user ID belongs to the root user, false otherwise.
 */
function isRootUser(uid) {
  return uid === 0;
}

/**
 * Checks if the current operating system is Windows.
 * @returns {boolean} True if the operating system is Windows, false otherwise.
 */
function isWindows() {
  return process.platform === 'win32';
}

/**
 * Indicates whether the current environment is running as the root user.
 * @type {boolean}
 */
const ROOT_USER = isRootUser(getUid()) && !isFakeRoot();

/**
 * User's home directory path.
 * @type {any}
 */
let userHomeDir;
if (isWindows()) {
  userHomeDir = path.resolve(home, './AppData/Local');
} else {
  userHomeDir = path.resolve(home, './.local/share');
}

export { userHomeDir, home, isFakeRoot, isRootUser, ROOT_USER };
