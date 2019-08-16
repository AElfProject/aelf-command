/**
 * @file deploy contract
 * @author atom-yang
 */
const AElf = require('aelf-sdk');
const fs = require('fs');
const BaseSubCommand = require('./baseSubCommand');
const {
  deployCommandParameters,
  deployCommandUsage
} = require('../utils/constants');
const { getWallet } = require('../utils/wallet');

class DeployCommand extends BaseSubCommand {
  constructor(
    rc,
    name = 'deploy',
    description = 'Deploy a smart contract',
    usage = deployCommandUsage
  ) {
    super(
      name,
      deployCommandParameters,
      description,
      [],
      usage,
      rc
    );
  }

  async run(commander, ...args) {
    const {
      options,
      subOptions
    } = await super.run(commander, ...args);
    const {
      endpoint,
      datadir,
      account,
      password
    } = options;
    const {
      category,
      codePath
    } = subOptions;
    console.log(options);
    console.log(subOptions);
    try {
      this.oraInstance.start('Starting to deploy');
      const aelf = new AElf(new AElf.providers.HttpProvider(endpoint));
      const wallet = getWallet(datadir, account, password);
      const code = fs.readFileSync(codePath).toString('base64');
      const {
        GenesisContractAddress
      } = await aelf.chain.getChainStatus();
      const zeroContract = await aelf.chain.contractAt(GenesisContractAddress, wallet);
      const result = await zeroContract.DeploySmartContract({
        category,
        code
      });
      this.oraInstance.succeed(`\n${JSON.stringify(result, null, 2)}`);
    } catch (e) {
      this.oraInstance.fail('Failed!');
      console.log(e);
    }
  }
}

module.exports = DeployCommand;
