const AElf = require('aelf-sdk');
const path = require('path');
const fs = require('fs');

const keyStore = AElf.wallet.keyStore;

const generateKeyStore = (password, dir) => {
  const wallet = AElf.wallet.createNewWallet();
  const store = keyStore.getKeystore(wallet, password);
  let dirname = dir ? path.resolve(dir) : process.env.AELF_CLI_DATADIR;
  dirname = dirname ? path.resolve(dirname) : './';
  const filePath = path.resolve(dirname, `${wallet.address}.json`);
  fs.writeFileSync(filePath, JSON.stringify(store, null, 4));
  wallet.publicKey = wallet.keyPair.getPublic();
  console.log('Your wallet info is :');
  console.log(`Mnemonic            : ${wallet.mnemonic}`);
  console.log(`Private Key         : ${wallet.privateKey}`);
  console.log(`Public Key          : ${wallet.publicKey}`);
  console.log(`Address             : ${wallet.address}`);
  return {
    wallet,
    keyStore: store
  };
};

const extractFromKeyStore = (filePath, password) => {
  const file = filePath ? path.resolve(filePath) : process.env.AELF_CLI_DATADIR;
  const store = JSON.parse(fs.readFileSync(file).toString());
  return keyStore.unlockKeystore(store, password);
};

module.exports = {
  generateKeyStore,
  extractFromKeyStore
};
