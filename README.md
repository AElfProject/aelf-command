# aelf-command

## 此仓库为aelf-command，用于命令行使用sdk，待规划

### 安装
项目本地安装
```bash
# 项目路径下本地安装
npm i aelf-command --save
```

### 使用

可在Node.js REPL中或者js文件中使用

```javascript
// 安装完成后
const keyStoreFunctions = require('aelf-command');
// 生成一个新的钱包和对应的keyStore，keyStore并写入文件，文件名为<{生成的钱包地址}_keyStore.json>
const result = keyStoreFunctions.generateKeyStore('password', '/Users/yangmutong/Documents/test/');
console.log(result.wallet);
console.log(result.keyStore);

const extractedKeyStore = keyStoreFunctions.extractFromKeyStore(`/Users/yangmutong/Documents/test/${result.wallet.address}_keyStore.json`, 'password');
console.log(extractedKeyStore);

```
