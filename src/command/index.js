/**
 * @file gather sub commands config
 * @author atom-yang
 */

const CallCommand = require('./call');
const SendCommand = require('./send');
const GetBlkHeightCommand = require('./getBlkHeight');
const GetBlkInfoCommand = require('./getBlkInfo');
const GetTxResultCommand = require('./getTxResult');
const ConsoleCommand = require('./console');
const CreateCommand = require('./create');
const LoadCommand = require('./load');
const DeployCommand = require('./deploy');
const ConfigCommand = require('./config');
const GetChainStatus = require('./getChainStatus');

module.exports = {
  CallCommand,
  SendCommand,
  GetBlkHeightCommand,
  GetChainStatus,
  GetBlkInfoCommand,
  GetTxResultCommand,
  ConsoleCommand,
  CreateCommand,
  LoadCommand,
  DeployCommand,
  ConfigCommand
};
