/* eslint-disable max-len */
import { Command } from 'commander';
import path from 'path';
import inquirer from 'inquirer';
import AElf from 'aelf-sdk';
import chalk from 'chalk';
import moment from 'moment';
import ProposalCommand from '../../src/command/proposal.js';
import { userHomeDir } from '../../src/utils/userHomeDir.js';
import { logger } from '../../src/utils/myLogger';
import * as utils from '../../src/utils/utils.js';
import { getWallet } from '../../src/utils/wallet.js';

jest.mock('../../src/utils/myLogger');
jest.mock('inquirer');
jest.mock('chalk', () => {
  return {
    blue: jest.fn(),
    green: jest.fn(),
    red: jest.fn(),
    hex: jest.fn(),
    color: jest.fn(),
    yellow: jest.fn((...args) => `yellow(${args.join('')})`)
  };
});
describe('ProposalCommand processAddressAfterPrompt', () => {
  let proposalCommand;
  let oraInstanceMock;
  const sampleRc = { getConfigs: jest.fn() };
  const endPoint = 'https://tdvw-test-node.aelf.io/';
  const account = 'GyQX6t18kpwaD9XHXe1ToKxfov8mSeTLE9q9NwUAeTE8tULZk';
  const password = '1234*Qwer';
  const dataDir = path.resolve(__dirname, '../datadir/aelf');
  beforeEach(() => {
    oraInstanceMock = {
      start: jest.fn(),
      clear: jest.fn(),
      succeed: jest.fn(),
      fail: jest.fn()
    };
    proposalCommand = new ProposalCommand(sampleRc);
    proposalCommand.oraInstance = oraInstanceMock;
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  test('should process address and return contract address', async () => {
    const contractAddress = 'vcv1qewcsFN2tVWqLuu7DJ5wVFA8YEx5FFgCQBb1jMCbAQHxV';
    const aelf = new AElf(new AElf.providers.HttpProvider(endPoint));
    const wallet = getWallet(dataDir, account, password);
    const answerInput = {
      'contract-address': 'AElf.ContractNames.Parliament'
    };
    const result = await proposalCommand.processAddressAfterPrompt(aelf, wallet, answerInput);
    expect(result.address).toBe(contractAddress);
  }, 20000);
});
describe('ProposalCommand run', () => {
  let proposalCommand;
  let oraInstanceMock;
  const sampleRc = { getConfigs: jest.fn() };
  const endPoint = 'https://tdvw-test-node.aelf.io/';
  const account = 'GyQX6t18kpwaD9XHXe1ToKxfov8mSeTLE9q9NwUAeTE8tULZk';
  const password = '1234*Qwer';
  const dataDir = path.resolve(__dirname, '../datadir/aelf');
  let mockParliamentContract, mockGenesisContract;
  beforeEach(() => {
    oraInstanceMock = {
      start: jest.fn(),
      clear: jest.fn(),
      succeed: jest.fn(),
      fail: jest.fn()
    };
    proposalCommand = new ProposalCommand(sampleRc);
    mockGenesisContract = {
      GetContractAddressByName: {
        call: jest.fn().mockResolvedValue('mockContractAddress')
      }
    };
    mockParliamentContract = {
      CreateProposal: jest.fn().mockResolvedValue({ TransactionId: 'mockTxId' })
    };
    proposalCommand.oraInstance = oraInstanceMock;
    proposalCommand.aelfMock = {
      chain: {
        getChainStatus: jest.fn().mockResolvedValue({ GenesisContractAddress: 'mockGenesisContractAddress' }),
        contractAt: jest.fn().mockResolvedValueOnce(mockGenesisContract).mockResolvedValueOnce(mockParliamentContract)
      }
    };
    inquirer.prompt = jest.fn().mockResolvedValue({
      'contract-address': 'Z2iqP4tWbbDo7X1EXiMgaAtMEpi43WzvCyzWppgmZ74Mtfvu4',
      method: 'GetOwner'
    });
    jest.spyOn(utils, 'getContractInstance').mockResolvedValue({
      GetOwner: {}
    });
    jest.spyOn(utils, 'getParams').mockResolvedValue({});
    jest.spyOn(utils, 'getMethod').mockReturnValue({
      packInput: params => params
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should run and create a proposal successfully', async () => {
    const commander = new Command();
    commander.option('-e, --endpoint <URI>', 'The URI of an AElf node. Eg: http://127.0.0.1:8000');
    commander.option('-a, --account <account>', 'The address of AElf wallet');
    commander.option('-p, --password <password>', 'The password of encrypted keyStore');
    commander.option(
      '-d, --datadir <directory>',
      `The directory that contains the AElf related files. Default to be ${userHomeDir}/aelf`
    );
    commander.parse([process.argv[0], '', 'proposal', '-e', endPoint, '-a', account, '-p', password, '-d', dataDir]);
    jest.spyOn(utils, 'getTxResult').mockResolvedValue({
      TransactionId: '3f323bf0d1d67830f55b018bc7ca5b78ccd9dd7676321e613b9052a24a07f118',
      Status: 'MINED',
      Logs: [
        {
          Address: 'ASh2Wt7nSEmYqnGxPPzp4pnVDU4uhj1XW9Se5VeZcX2UDdyjx',
          Name: 'ProposalCreated',
          Indexed: ['GiIKIIbldLRadK89uIhfzZsO3Eji1R5Z0tqh4vTZIJEjtinF'],
          NonIndexed: 'CgNFTEYQ4oKXhAE='
        }
      ],
      Bloom:
        'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==',
      BlockNumber: 123908526,
      BlockHash: 'c1dd1e0fa0fd687eb00e3a7a9d0f1f0a2cb8bba0aede7836ccb99794bd4d1008',
      Transaction: {
        From: '2nw6SSJEymj72Yzvr6EepTNN5iUFWjukVfxj9g2K8iwdKvF3uf',
        To: 'ASh2Wt7nSEmYqnGxPPzp4pnVDU4uhj1XW9Se5VeZcX2UDdyjx',
        RefBlockNumber: 123908525,
        RefBlockPrefix: 'AfUJzw==',
        MethodName: 'DonateResourceToken',
        Params: '{ "blockHash": "01f509cf3b6372c4567b5dc685be07fab281cedb603b60d889150343d100ce53", "blockHeight": "123908525" }',
        Signature: 'NgTp11dCrlVf/Bo8OVAudMPOBmE4gd+tfAAbytm74QspHqoq5OEWGeQY1z+P1qyTLU1oseOgXdfV4C9tF9Hs2gA='
      },
      ReturnValue: '',
      Error: null,
      TransactionSize: 216
    });
    jest.spyOn(utils, 'deserializeLogs').mockResolvedValue([{ proposalId: 'mockProposal' }]);
    await proposalCommand.run(
      commander,
      'AElf.ContractNames.Referendum',
      '2DcQvtJnVR9gLzuFcvSUxh6UcRc8uHTkSX5uJf3cw9xeb5HRoe',
      '2025/06/14 18:47',
      'description'
    );
    expect(oraInstanceMock.succeed).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith({ TransactionId: 'mockTxId' });
    expect(logger.info).toHaveBeenCalledWith('Proposal id: mockProposal.');
  }, 20000);
  test('should run and show pending info', async () => {
    const commander = new Command();
    commander.option('-e, --endpoint <URI>', 'The URI of an AElf node. Eg: http://127.0.0.1:8000');
    commander.option('-a, --account <account>', 'The address of AElf wallet');
    commander.option('-p, --password <password>', 'The password of encrypted keyStore');
    commander.option(
      '-d, --datadir <directory>',
      `The directory that contains the AElf related files. Default to be ${userHomeDir}/aelf`
    );
    commander.parse([process.argv[0], '', 'proposal', '-e', endPoint, '-a', account, '-p', password, '-d', dataDir]);
    jest.spyOn(utils, 'getTxResult').mockResolvedValue({
      TransactionId: '3f323bf0d1d67830f55b018bc7ca5b78ccd9dd7676321e613b9052a24a07f118',
      Status: 'PENDING',
      Logs: [
        {
          Address: 'ASh2Wt7nSEmYqnGxPPzp4pnVDU4uhj1XW9Se5VeZcX2UDdyjx',
          Name: 'ProposalCreated',
          Indexed: ['GiIKIIbldLRadK89uIhfzZsO3Eji1R5Z0tqh4vTZIJEjtinF'],
          NonIndexed: 'CgNFTEYQ4oKXhAE='
        }
      ],
      Bloom:
        'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==',
      BlockNumber: 123908526,
      BlockHash: 'c1dd1e0fa0fd687eb00e3a7a9d0f1f0a2cb8bba0aede7836ccb99794bd4d1008',
      Transaction: {
        From: '2nw6SSJEymj72Yzvr6EepTNN5iUFWjukVfxj9g2K8iwdKvF3uf',
        To: 'ASh2Wt7nSEmYqnGxPPzp4pnVDU4uhj1XW9Se5VeZcX2UDdyjx',
        RefBlockNumber: 123908525,
        RefBlockPrefix: 'AfUJzw==',
        MethodName: 'DonateResourceToken',
        Params: '{ "blockHash": "01f509cf3b6372c4567b5dc685be07fab281cedb603b60d889150343d100ce53", "blockHeight": "123908525" }',
        Signature: 'NgTp11dCrlVf/Bo8OVAudMPOBmE4gd+tfAAbytm74QspHqoq5OEWGeQY1z+P1qyTLU1oseOgXdfV4C9tF9Hs2gA='
      },
      ReturnValue: '',
      Error: null,
      TransactionSize: 216
    });
    await proposalCommand.run(
      commander,
      'AElf.ContractNames.Referendum',
      '2DcQvtJnVR9gLzuFcvSUxh6UcRc8uHTkSX5uJf3cw9xeb5HRoe',
      '2025/06/14 18:47',
      'description'
    );
    expect(oraInstanceMock.succeed).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith({ TransactionId: 'mockTxId' });
    expect(logger.info).toHaveBeenCalledWith(
      'Transaction is still pending, you can get proposal id later by running yellow(aelf-command event mockTxId)'
    );
  }, 20000);

  test('should handle failure to create proposal', async () => {
    const commander = new Command();
    commander.option('-e, --endpoint <URI>', 'The URI of an AElf node. Eg: http://127.0.0.1:8000');
    commander.option('-a, --account <account>', 'The address of AElf wallet');
    commander.option('-p, --password <password>', 'The password of encrypted keyStore');
    commander.option(
      '-d, --datadir <directory>',
      `The directory that contains the AElf related files. Default to be ${userHomeDir}/aelf`
    );
    commander.parse([process.argv[0], '', 'proposal', '-e', endPoint, '-a', account, '-p', password, '-d', dataDir]);
    jest.spyOn(utils, 'getTxResult').mockRejectedValue(new Error('mock error'));
    await proposalCommand.run(
      commander,
      'AElf.ContractNames.Referendum',
      '2DcQvtJnVR9gLzuFcvSUxh6UcRc8uHTkSX5uJf3cw9xeb5HRoe',
      '2025/06/14 18:47',
      'description'
    );
    expect(oraInstanceMock.fail).toHaveBeenCalledWith('Failed!');
    expect(logger.fatal).toHaveBeenCalled();
  });
  test('should throw error for invalid proposalContract', async () => {
    const commander = new Command();
    commander.option('-e, --endpoint <URI>', 'The URI of an AElf node. Eg: http://127.0.0.1:8000');
    commander.option('-a, --account <account>', 'The address of AElf wallet');
    commander.option('-p, --password <password>', 'The password of encrypted keyStore');
    commander.option(
      '-d, --datadir <directory>',
      `The directory that contains the AElf related files. Default to be ${userHomeDir}/aelf`
    );
    commander.parse([process.argv[0], '', 'proposal', '-e', endPoint, '-a', account, '-p', password, '-d', dataDir]);
    await proposalCommand.run(
      commander,
      'TEST',
      '2DcQvtJnVR9gLzuFcvSUxh6UcRc8uHTkSX5uJf3cw9xeb5HRoe',
      '2025/06/14 18:47',
      'description'
    );
    expect(oraInstanceMock.fail).toHaveBeenCalledWith('Failed!');
    expect(logger.fatal).toHaveBeenCalledWith(
      new Error(
        'TEST is not in the list of proposal contracts, choice one of `AElf.ContractNames.Parliament`, `AElf.ContractNames.Referendum` and `AElf.ContractNames.Association`'
      )
    );
  });
  test('should throw error for invalid expiredTime', async () => {
    const commander = new Command();
    commander.option('-e, --endpoint <URI>', 'The URI of an AElf node. Eg: http://127.0.0.1:8000');
    commander.option('-a, --account <account>', 'The address of AElf wallet');
    commander.option('-p, --password <password>', 'The password of encrypted keyStore');
    commander.option(
      '-d, --datadir <directory>',
      `The directory that contains the AElf related files. Default to be ${userHomeDir}/aelf`
    );
    commander.parse([process.argv[0], '', 'proposal', '-e', endPoint, '-a', account, '-p', password, '-d', dataDir]);
    const expiredTime = moment().subtract(1, 'hour');
    await proposalCommand.run(
      commander,
      'AElf.ContractNames.Referendum',
      '2DcQvtJnVR9gLzuFcvSUxh6UcRc8uHTkSX5uJf3cw9xeb5HRoe',
      expiredTime,
      'description'
    );
    expect(oraInstanceMock.fail).toHaveBeenCalledWith('Failed!');
    expect(logger.fatal).toHaveBeenCalled();
  });
});
