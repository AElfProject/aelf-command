/* eslint-disable max-len */
import { Command } from 'commander';
import path from 'path';
import ProposalCommand from '../../src/command/proposal.js';
import { userHomeDir } from '../../src/utils/userHomeDir.js';
import { logger } from '../../src/utils/myLogger';

jest.mock('../../src/utils/myLogger');

describe('ProposalCommand', () => {
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

  it('should run and create a proposal successfully', async () => {});
});
