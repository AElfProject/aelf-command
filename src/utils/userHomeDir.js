/**
 * @file find user home dir
 * @author atom-yang
 */
import path from 'path';
import { homedir } from 'os';

const home = homedir();

function getUid() {
  if (process.platform !== 'win32' && process.getuid) {
    return process.getuid();
  }
  return null;
}

function isFakeRoot() {
  return Boolean(process.env.FAKEROOTKEY);
}

function isRootUser(uid) {
  return uid === 0;
}

function isWindows() {
  return process.platform === 'win32';
}

const ROOT_USER = isRootUser(getUid()) && !isFakeRoot();

let userHomeDir;
if (isWindows()) {
  userHomeDir = path.resolve(home, './AppData/Local');
} else {
  userHomeDir = path.resolve(home, './.local/share');
}

export { userHomeDir, home, isFakeRoot, isRootUser, ROOT_USER };
