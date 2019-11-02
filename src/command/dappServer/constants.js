/**
 * @file constants
 * @author atom-yang
 */

const CHAIN_APIS = {
  '/api/blockChain/chainStatus': 'getChainStatus',
  '/api/blockChain/blockState': 'getChainState',
  '/api/blockChain/contractFileDescriptorSet': 'getContractFileDescriptorSet',
  '/api/blockChain/blockHeight': 'getBlockHeight',
  '/api/blockChain/block': 'getBlock',
  '/api/blockChain/blockByHeight': 'getBlockByHeight',
  '/api/blockChain/transactionResult': 'getTxResult',
  '/api/blockChain/transactionResults': 'getTxResults',
  '/api/blockChain/merklePathByTransactionId': 'getMerklePathByTxId'
};

module.exports = {
  CHAIN_APIS
};
