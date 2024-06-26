import { Command } from 'commander';
import path from 'path';
import GetBlkHeightCommand from '../../src/command/getBlkHeight.js';
import { userHomeDir } from '../../src/utils/userHomeDir.js';

jest.mock('../../src/utils/myLogger');

describe('GetBlkHeightCommand', () => {
  let getBlkHeightCommand;
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
    getBlkHeightCommand = new GetBlkHeightCommand(sampleRc);
    getBlkHeightCommand.oraInstance = oraInstanceMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should get block height and succeed', async () => {
    const commander = new Command();
    commander.option('-e, --endpoint <URI>', 'The URI of an AElf node. Eg: http://127.0.0.1:8000');
    commander.option('-a, --account <account>', 'The address of AElf wallet');
    commander.option('-p, --password <password>', 'The password of encrypted keyStore');
    commander.option(
      '-d, --datadir <directory>',
      `The directory that contains the AElf related files. Default to be ${userHomeDir}/aelf`
    );
    commander.parse([process.argv[0], '', 'get-blk-height', '-e', endPoint, '-a', account, '-p', password, '-d', dataDir]);
    await getBlkHeightCommand.run(commander);
    expect(oraInstanceMock.succeed).toHaveBeenCalled();
  });
  test('should log error and fail on exception', async () => {
    const commander = new Command();
    commander.option('-e, --endpoint <URI>', 'The URI of an AElf node. Eg: http://127.0.0.1:8000');
    commander.option('-a, --account <account>', 'The address of AElf wallet');
    commander.option('-p, --password <password>', 'The password of encrypted keyStore');
    commander.option(
      '-d, --datadir <directory>',
      `The directory that contains the AElf related files. Default to be ${userHomeDir}/aelf`
    );
    commander.parse([process.argv[0], '', 'get-blk-height', '-e', endPoint, '-a', account, '-p', password, '-d', dataDir]);
    oraInstanceMock.start.mockImplementation(() => {
      throw new Error('mock error');
    });
    await getBlkHeightCommand.run(commander);
    expect(oraInstanceMock.fail).toHaveBeenCalled();
  });
});
