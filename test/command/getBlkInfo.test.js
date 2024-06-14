/* eslint-disable max-len */
import { Command } from 'commander';
import path from 'path';
import GetBlkInfoCommand from '../../src/command/getBlkInfo.js';
import { userHomeDir } from '../../src/utils/userHomeDir.js';
import { logger } from '../../src/utils/myLogger';

jest.mock('../../src/utils/myLogger');

describe('GetBlkInfoCommand', () => {
  let getBlkInfoCommand;
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
    getBlkInfoCommand = new GetBlkInfoCommand(sampleRc);
    getBlkInfoCommand.oraInstance = oraInstanceMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get block info by height and succeed', async () => {
    const commander = new Command();
    commander.option('-e, --endpoint <URI>', 'The URI of an AElf node. Eg: http://127.0.0.1:8000');
    commander.option('-a, --account <account>', 'The address of AElf wallet');
    commander.option('-p, --password <password>', 'The password of encrypted keyStore');
    commander.option(
      '-d, --datadir <directory>',
      `The directory that contains the AElf related files. Default to be ${userHomeDir}/aelf`
    );
    commander.parse([process.argv[0], '', 'get-blk-info', '-e', endPoint, '-a', account, '-p', password, '-d', dataDir]);
    await getBlkInfoCommand.run(commander, '123', true);
    expect(oraInstanceMock.succeed).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith({
      BlockHash: '5482f050b51b91496c70b4601fd3049c83f771c9832a370489a6cbad1202a649',
      BlockSize: 1393,
      Body: {
        Transactions: [
          'e9ed63a9e22931838cd2835ea52eea3083ec0561dedc77fce42067ff88a07fe5',
          '491a510eacde8485f5a02c68da42f16fea6ad6795edbcc8b7217804d08d52fda'
        ],
        TransactionsCount: 2
      },
      Header: {
        Bloom:
          'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==',
        ChainId: 'tDVW',
        Extra:
          '{ "CrossChain": "", "Consensus": "CkEE6CtyGYhrpUqwtY7OnCNCLenuCS6JQRgc29PY0tJONpj0smWuvdOwHSmuhU1i7pQnGYpB5/49syK+fJwvZi93zRLxBggEEr4CCoIBMDRlODJiNzIxOTg4NmJhNTRhYjBiNThlY2U5YzIzNDIyZGU5ZWUwOTJlODk0MTE4MWNkYmQzZDhkMmQyNGUzNjk4ZjRiMjY1YWViZGQzYjAxZDI5YWU4NTRkNjJlZTk0MjcxOThhNDFlN2ZlM2RiMzIyYmU3YzljMmY2NjJmNzdjZBK2ATgTSoIBMDRlODJiNzIxOTg4NmJhNTRhYjBiNThlY2U5YzIzNDIyZGU5ZWUwOTJlODk0MTE4MWNkYmQzZDhkMmQyNGUzNjk4ZjRiMjY1YWViZGQzYjAxZDI5YWU4NTRkNjJlZTk0MjcxOThhNDFlN2ZlM2RiMzIyYmU3YzljMmY2NjJmNzdjZGoLCOi94pQGEMiAiW9qDAjoveKUBhCggbzIAWoMCOi94pQGEKzA+PIBgAEDiAF5EocBCoIBMDQzNTdiMWFkOGMwNTc2ZDI2YWEzZDZiMmQwOWIyYWQwM2JmNWRiY2UyMjM3MzA2MzYxNDVjZjQ0M2ZlYjM3ZmIxOTE1NmI5OTE5NGZhNDhhZDkyNTY2Yjk1YzQ1NDkzOWRmMmNhNzFlOWJmNTE3YzI1OTBjMmVlZGRkNzZjZjkxZRIAEocBCoIBMDQyZDIyMTA1YTU3YzEwNjFkZDNjZjZlODhiYjMxOWJmNzU0NTc2MjY5ZGVhZTU4NmVkMTAwYzg0N2NhYjFkM2YxYjU1NzczYzMxZjVlNzM5NjcwZjUzZmQ0ZjBkODU5ZmJiYTZiY2Y4ZDI4MGYxNWRlOGRiYmM0NTExODE1MTdhYhIAEocBCoIBMDQ1Mjc2MmVjMjFmZWQyOWY0Y2I4NmRmM2ZjMDhmMDJhMjM4NWM4NGQ0NWRmZDRlZjU0MDA1OTczYjQxZjVhYjI2NGUyZTVkZTBkNDZlYzQ1ZTY0OTFiOTgxMDUwMzgwYjBhYTE5NzE0YWY0ZjA4Nzg1NjAzMjE4OTNlNjI2MzFlNBIAEocBCoIBMDQ3Nzk0ZTViNDI0MTc3YmYwM2Y5ZDVlNTQxZTdiZGEyODA1NjIwOWQ4MTRjNjhhZWQyNjcwZTQ2ZDk2M2M4NWQwNGRhNWY2OWVmODI0NThlODYxNzQ4OTA3NDM5ODVlMjk3ODQzNDg1YjEwZDAyOTVmYzI4Yjg4NTMzNTVjZmI4YhIAUJy17OceGAQ=", "SystemTransactionCount": "CAI=" }',
        Height: 123,
        MerkleTreeRootOfTransactionState: '51138bb99d42fb7b7f2ba5691ab5b26c6a1fdf9b0e130baa910bcceeeb86b355',
        MerkleTreeRootOfTransactions: '630d56e6f0b1c2678ec5eb41fb45d0d1b3fb67db8afdfe4c40c4a37be31f6039',
        MerkleTreeRootOfWorldState: 'c129757cfc5c72b9f2415a380f27e9723b9ca095f4e84ba83415f9a258c34dfb',
        PreviousBlockHash: '9ded101527432838273056a0a250b015ad8bf5bc3806391b481974457030d628',
        SignerPubkey:
          '04e82b7219886ba54ab0b58ece9c23422de9ee092e8941181cdbd3d8d2d24e3698f4b265aebdd3b01d29ae854d62ee9427198a41e7fe3db322be7c9c2f662f77cd',
        Time: '2022-06-02T11:28:40.5094851Z'
      }
    });
  }, 20000);
  it('should get block info by hash and succeed', async () => {
    const commander = new Command();
    commander.option('-e, --endpoint <URI>', 'The URI of an AElf node. Eg: http://127.0.0.1:8000');
    commander.option('-a, --account <account>', 'The address of AElf wallet');
    commander.option('-p, --password <password>', 'The password of encrypted keyStore');
    commander.option(
      '-d, --datadir <directory>',
      `The directory that contains the AElf related files. Default to be ${userHomeDir}/aelf`
    );
    commander.parse([process.argv[0], '', 'get-blk-info', '-e', endPoint, '-a', account, '-p', password, '-d', dataDir]);
    await getBlkInfoCommand.run(commander, '5482f050b51b91496c70b4601fd3049c83f771c9832a370489a6cbad1202a649', true);
    expect(oraInstanceMock.succeed).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith({
      BlockHash: '5482f050b51b91496c70b4601fd3049c83f771c9832a370489a6cbad1202a649',
      BlockSize: 1393,
      Body: {
        Transactions: [
          'e9ed63a9e22931838cd2835ea52eea3083ec0561dedc77fce42067ff88a07fe5',
          '491a510eacde8485f5a02c68da42f16fea6ad6795edbcc8b7217804d08d52fda'
        ],
        TransactionsCount: 2
      },
      Header: {
        Bloom:
          'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==',
        ChainId: 'tDVW',
        Extra:
          '{ "CrossChain": "", "Consensus": "CkEE6CtyGYhrpUqwtY7OnCNCLenuCS6JQRgc29PY0tJONpj0smWuvdOwHSmuhU1i7pQnGYpB5/49syK+fJwvZi93zRLxBggEEr4CCoIBMDRlODJiNzIxOTg4NmJhNTRhYjBiNThlY2U5YzIzNDIyZGU5ZWUwOTJlODk0MTE4MWNkYmQzZDhkMmQyNGUzNjk4ZjRiMjY1YWViZGQzYjAxZDI5YWU4NTRkNjJlZTk0MjcxOThhNDFlN2ZlM2RiMzIyYmU3YzljMmY2NjJmNzdjZBK2ATgTSoIBMDRlODJiNzIxOTg4NmJhNTRhYjBiNThlY2U5YzIzNDIyZGU5ZWUwOTJlODk0MTE4MWNkYmQzZDhkMmQyNGUzNjk4ZjRiMjY1YWViZGQzYjAxZDI5YWU4NTRkNjJlZTk0MjcxOThhNDFlN2ZlM2RiMzIyYmU3YzljMmY2NjJmNzdjZGoLCOi94pQGEMiAiW9qDAjoveKUBhCggbzIAWoMCOi94pQGEKzA+PIBgAEDiAF5EocBCoIBMDQzNTdiMWFkOGMwNTc2ZDI2YWEzZDZiMmQwOWIyYWQwM2JmNWRiY2UyMjM3MzA2MzYxNDVjZjQ0M2ZlYjM3ZmIxOTE1NmI5OTE5NGZhNDhhZDkyNTY2Yjk1YzQ1NDkzOWRmMmNhNzFlOWJmNTE3YzI1OTBjMmVlZGRkNzZjZjkxZRIAEocBCoIBMDQyZDIyMTA1YTU3YzEwNjFkZDNjZjZlODhiYjMxOWJmNzU0NTc2MjY5ZGVhZTU4NmVkMTAwYzg0N2NhYjFkM2YxYjU1NzczYzMxZjVlNzM5NjcwZjUzZmQ0ZjBkODU5ZmJiYTZiY2Y4ZDI4MGYxNWRlOGRiYmM0NTExODE1MTdhYhIAEocBCoIBMDQ1Mjc2MmVjMjFmZWQyOWY0Y2I4NmRmM2ZjMDhmMDJhMjM4NWM4NGQ0NWRmZDRlZjU0MDA1OTczYjQxZjVhYjI2NGUyZTVkZTBkNDZlYzQ1ZTY0OTFiOTgxMDUwMzgwYjBhYTE5NzE0YWY0ZjA4Nzg1NjAzMjE4OTNlNjI2MzFlNBIAEocBCoIBMDQ3Nzk0ZTViNDI0MTc3YmYwM2Y5ZDVlNTQxZTdiZGEyODA1NjIwOWQ4MTRjNjhhZWQyNjcwZTQ2ZDk2M2M4NWQwNGRhNWY2OWVmODI0NThlODYxNzQ4OTA3NDM5ODVlMjk3ODQzNDg1YjEwZDAyOTVmYzI4Yjg4NTMzNTVjZmI4YhIAUJy17OceGAQ=", "SystemTransactionCount": "CAI=" }',
        Height: 123,
        MerkleTreeRootOfTransactionState: '51138bb99d42fb7b7f2ba5691ab5b26c6a1fdf9b0e130baa910bcceeeb86b355',
        MerkleTreeRootOfTransactions: '630d56e6f0b1c2678ec5eb41fb45d0d1b3fb67db8afdfe4c40c4a37be31f6039',
        MerkleTreeRootOfWorldState: 'c129757cfc5c72b9f2415a380f27e9723b9ca095f4e84ba83415f9a258c34dfb',
        PreviousBlockHash: '9ded101527432838273056a0a250b015ad8bf5bc3806391b481974457030d628',
        SignerPubkey:
          '04e82b7219886ba54ab0b58ece9c23422de9ee092e8941181cdbd3d8d2d24e3698f4b265aebdd3b01d29ae854d62ee9427198a41e7fe3db322be7c9c2f662f77cd',
        Time: '2022-06-02T11:28:40.5094851Z'
      }
    });
  }, 20000);
  it('should log error and fail on exception', async () => {
    jest.spyOn(process, 'exit').mockImplementation(() => {});
    const commander = new Command();
    commander.option('-e, --endpoint <URI>', 'The URI of an AElf node. Eg: http://127.0.0.1:8000');
    commander.option('-a, --account <account>', 'The address of AElf wallet');
    commander.option('-p, --password <password>', 'The password of encrypted keyStore');
    commander.option(
      '-d, --datadir <directory>',
      `The directory that contains the AElf related files. Default to be ${userHomeDir}/aelf`
    );
    commander.parse([process.argv[0], '', 'get-blk-info', '-e', endPoint, '-a', account, '-p', password, '-d', dataDir]);
    await getBlkInfoCommand.run(commander, true, false);
    expect(process.exit).toHaveBeenCalledWith(1);
    expect(oraInstanceMock.fail).toHaveBeenCalled();
  }, 20000);
});
