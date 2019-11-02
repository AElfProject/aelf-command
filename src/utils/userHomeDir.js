/**
 * @file find user home dir
 * @author atom-yang
 */
const path = require('path');
const home = require('os').homedir();

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
} else if (ROOT_USER) {
  userHomeDir = path.resolve('/usr/local/share');
} else {
  userHomeDir = path.resolve(home, './.local/share');
}

module.exports = {
  userHomeDir,
  home,
  isFakeRoot,
  isRootUser
};
