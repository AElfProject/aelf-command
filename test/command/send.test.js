import SendCommand from '../../src/command/send.js';
import AElf from 'aelf-sdk';

describe('SendCommand', () => {
  let sendCommand;
  let oraInstanceMock;
  const sampleRc = { getConfigs: jest.fn() };
  beforeEach(() => {
    oraInstanceMock = {
      start: jest.fn(),
      clear: jest.fn(),
      succeed: jest.fn(),
      fail: jest.fn()
    };
    sendCommand = new SendCommand(sampleRc);
    sendCommand.oraInstance = oraInstanceMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should send the transaction and succeed', async () => {
    const wallet = AElf.wallet.getWalletByPrivateKey('9a2c6023e8b2221f4b02f4ccc5128392c1bd968ae45a42fa62848d793fff148f');
    const endPoint = 'https://tdvw-test-node.aelf.io/';
    const aelf = new AElf(new AElf.providers.HttpProvider(endPoint));
    const contractAddress = '2cVQrFiXNaedBYmUrovmUV2jcF9Hf6AXbh12gWsD4P49NaX99y';
    const contractInstance = await aelf.chain.contractAt(contractAddress, wallet);
    const method = contractInstance.CreateOrganization;
    const params = {
      proposalReleaseThreshold: {
        minimalApprovalThreshold: '100000000',
        maximalRejectionThreshold: '0',
        maximalAbstentionThreshold: '0',
        minimalVoteThreshold: '100000000'
      },
      tokenSymbol: 'ELF',
      proposerWhiteList: {
        proposers: ['GyQX6t18kpwaD9XHXe1ToKxfov8mSeTLE9q9NwUAeTE8tULZk']
      }
    };
    const result = await sendCommand.callMethod(method, params);
    expect(typeof result.TransactionId).toBe('string');
    expect(oraInstanceMock.succeed).toHaveBeenCalled();
  });
});
