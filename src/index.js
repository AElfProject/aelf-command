const AElf = require('aelf-sdk');
const path = require('path');
const fs = require('fs');

const keyStore = AElf.wallet.keyStore;

const generateKeyStore = (password, dir) => {
  const wallet = AElf.wallet.createNewWallet();
  const store = keyStore.getKeystore(wallet, password);
  let dirname = dir ? path.resolve(dir) : process.env.AELF_CLI_DATADIR;
  dirname = dirname ? path.resolve(dirname) : './';
  const filePath = path.resolve(dirname, `${wallet.address}_keyStore.json`);
  fs.writeFileSync(filePath, JSON.stringify(store, null, 4));
  return {
    wallet,
    keyStore: store
  };
};