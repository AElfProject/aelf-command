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

const ROOT_USER = isRootUser(getUid()) && !isFakeRoot();

const userHomeDir = ROOT_USER ? path.resolve('/usr/local/share') : path.resolve(home, './.local/share');

module.exports = {
  userHomeDir,
  home,
  isFakeRoot,
  isRootUser
};
