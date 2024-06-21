/* eslint-disable max-len */
import ioc from 'socket.io-client';
import AElf from 'aelf-sdk';
import { getWallet } from '../../../src/utils/wallet';
import Socket from '../../../src/command/dappServer/socket';
import { logger } from '../../../src/utils/myLogger';
import * as utils from '../../../src/command/dappServer/utils';
import Sign from '../../../src/command/dappServer/sign';
import { endpoint, account, password, dataDir } from '../../constants.js';

jest.mock('../../../src/command/dappServer/sign');
jest.mock('../../../src/utils/myLogger');

const connectData = {
  action: 'connect',
  params: {
    publicKey:
      '04b00b9a0c0359a5e0a55b0efa32469929765b30bc5a8b375d2dbffa43322f87df3401845a4cc3841a36c3f14a7481ce1c4e9d920f18ede0f4bcbd29e291a4190a',
    timestamp: 1718870995,
    encryptAlgorithm: 'secp256k1',
    signature:
      '33977ec3965229628feb4b95846442d71d20fa9bfd54efe6958daa5fdf369a3ecde738f9a10374dd8b56064618e50746b9c3581ade80abfc3b69decadadec7a200'
  },
  appId: '28e653ec-20d4-55e1-b077-a346df57666a',
  id: '4b62bc590a4d43beb432c1692e1a2234'
};
let clientSocket,
  socketInstance,
  port = 35444;
const serverUrl = `http://localhost:${port}`;
const aelf = new AElf(new AElf.providers.HttpProvider(endpoint));
const wallet = getWallet(dataDir, account, password);

describe('Socket Server with sign', () => {
  beforeEach(done => {
    socketInstance = new Socket({
      port,
      endpoint,
      aelf,
      wallet,
      address: account
    });
    clientSocket = ioc(serverUrl, {
      transports: ['websocket'],
      timeout: 5000,
      reconnectionAttempts: 5
    });
    clientSocket.on('connect', async message => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      done();
    });
  });

  afterEach(() => {
    clientSocket.close();
    socketInstance.socket.close();
  });
  test('should handle invalid signature', done => {
    clientSocket.on('bridge', message => {
      expect(logger.error).toHaveBeenCalledWith('error happened');
      expect(logger.error).toHaveBeenCalledWith(new Error('Not a valid signature'));
      done();
    });

    Sign.verify = jest.fn().mockReturnValue(false);
    Sign.mockImplementation(() => {
      return {
        verify: () => true,
        sign: () =>
          '5a54b642b72af76fdd707fc00f7b48a6166e0816240f1fb5528777c55289e0c7c94eb88e67d9a07f8b5c99777ecbbb99d5482147ef7766888c29c837b023afd101',
        getPublicKey: () =>
          '04e8feb5a19d6de284218083c75b16bdf9bc356e46c2c6da7ec5f9a96ae150d194bfae36782ae54094e4a3be41dd1f92a8eef2e42b0af82511795d25f37a6945c0'
      };
    });
    jest.spyOn(utils, 'checkTimestamp').mockReturnValue(true);
    clientSocket.emit('bridge', connectData);
  });

  test('should handle invalid Timestamp', done => {
    clientSocket.on('bridge', message => {
      expect(logger.error).toHaveBeenCalledWith('error happened');
      expect(logger.error).toHaveBeenCalledWith(new Error('Timestamp is not valid'));
      done();
    });

    Sign.verify = jest.fn().mockReturnValue(true);
    Sign.mockImplementation(() => {
      return {
        verify: () => true,
        sign: () =>
          '5a54b642b72af76fdd707fc00f7b48a6166e0816240f1fb5528777c55289e0c7c94eb88e67d9a07f8b5c99777ecbbb99d5482147ef7766888c29c837b023afd101',
        getPublicKey: () =>
          '04e8feb5a19d6de284218083c75b16bdf9bc356e46c2c6da7ec5f9a96ae150d194bfae36782ae54094e4a3be41dd1f92a8eef2e42b0af82511795d25f37a6945c0'
      };
    });
    jest.spyOn(utils, 'checkTimestamp').mockReturnValue(false);
    clientSocket.emit('bridge', connectData);
  });
  test('should handle not support encrypt method or not enough params', done => {
    clientSocket.on('bridge', message => {
      expect(logger.error).toHaveBeenCalledWith(new Error('Not support encrypt method or not enough params'));
      expect(logger.error).toHaveBeenCalledWith('error happened');
      done();
    });
    const invalidConnectData = {
      action: 'connect',
      params: {
        publicKey:
          '04b00b9a0c0359a5e0a55b0efa32469929765b30bc5a8b375d2dbffa43322f87df3401845a4cc3841a36c3f14a7481ce1c4e9d920f18ede0f4bcbd29e291a4190a',
        timestamp: 1718870995,
        encryptAlgorithm: 'secp256k1'
      },
      appId: '28e653ec-20d4-55e1-b077-a346df57666a',
      id: '4b62bc590a4d43beb432c1692e1a2234'
    };
    clientSocket.emit('bridge', invalidConnectData);
  });
});

describe('Socket Server with sign', () => {
  // let clientSocket,
  //   socketInstance,
  //   port = 35444;
  // const serverUrl = `http://localhost:${port}`;
  // const aelf = new AElf(new AElf.providers.HttpProvider(endpoint));
  // const wallet = getWallet(dataDir, account, password);

  beforeEach(done => {
    socketInstance = new Socket({
      port,
      endpoint,
      aelf,
      wallet,
      address: account
    });
    clientSocket = ioc(serverUrl, {
      transports: ['websocket'],
      timeout: 5000,
      reconnectionAttempts: 5
    });
    clientSocket.on('connect', async message => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      done();
    });
    // first need to connect
    // const connectData = {
    //   action: 'connect',
    //   params: {
    //     publicKey:
    //       '04b00b9a0c0359a5e0a55b0efa32469929765b30bc5a8b375d2dbffa43322f87df3401845a4cc3841a36c3f14a7481ce1c4e9d920f18ede0f4bcbd29e291a4190a',
    //     timestamp: 1718870995,
    //     encryptAlgorithm: 'secp256k1',
    //     signature:
    //       '33977ec3965229628feb4b95846442d71d20fa9bfd54efe6958daa5fdf369a3ecde738f9a10374dd8b56064618e50746b9c3581ade80abfc3b69decadadec7a200'
    //   },
    //   appId: '28e653ec-20d4-55e1-b077-a346df57666a',
    //   id: '4b62bc590a4d43beb432c1692e1a2234'
    // };
    Sign.verify = jest.fn().mockReturnValue(true);
    Sign.mockImplementation(() => {
      return {
        verify: () => true,
        sign: () =>
          '5a54b642b72af76fdd707fc00f7b48a6166e0816240f1fb5528777c55289e0c7c94eb88e67d9a07f8b5c99777ecbbb99d5482147ef7766888c29c837b023afd101',
        getPublicKey: () =>
          '04e8feb5a19d6de284218083c75b16bdf9bc356e46c2c6da7ec5f9a96ae150d194bfae36782ae54094e4a3be41dd1f92a8eef2e42b0af82511795d25f37a6945c0'
      };
    });
    jest.spyOn(utils, 'checkTimestamp').mockReturnValue(true);
    clientSocket.emit('bridge', connectData);
  });

  afterEach(() => {
    clientSocket.close();
    socketInstance.socket.close();
  });

  test('should handle account action', done => {
    clientSocket.on('bridge', message => {
      expect(logger.info).toHaveBeenCalledWith('Message received');
      expect(logger.info).toHaveBeenCalledWith('Querying account information');
      expect(logger.error).not.toHaveBeenCalled();
      done();
    });
    Sign.mockImplementation(() => {
      return {
        verify: () => true,
        sign: () =>
          'd319351e191c8a5f751ed3b3f586af53017dba17f5ec58980ba51ec51f968a3cc8deadb4e9acbb8ddd84b065a8b919d2d32724e87d7df6f412581fa3d375523e01'
      };
    });
    const data = {
      action: 'account',
      params: {
        signature:
          '8747f44c44d468554fcaeadb64a3cd75444c2bbb91c8e52855679bebc1ca9282a6499911b92da3d627a5b03788c6b5817a61b4183a0e5d7535c2af0abce11a4e01',
        originalParams: 'JTdCJTIydGltZXN0YW1wJTIyJTNBMTcxODg3MDk5NiU3RA=='
      },
      appId: '28e653ec-20d4-55e1-b077-a346df57666a',
      id: 'cd78bea8c031411fb6659939f9070527'
    };
    clientSocket.emit('bridge', data);
  }, 20000);

  test('should handle api action', done => {
    clientSocket.on('bridge', message => {
      expect(logger.info).toHaveBeenCalledWith('Message received');
      expect(logger.info).toHaveBeenCalledWith('Querying api /api/blockChain/chainStatus...');
      expect(logger.error).not.toHaveBeenCalled();
      done();
    });
    Sign.mockImplementation(() => {
      return {
        verify: () => true,
        sign: () =>
          'd319351e191c8a5f751ed3b3f586af53017dba17f5ec58980ba51ec51f968a3cc8deadb4e9acbb8ddd84b065a8b919d2d32724e87d7df6f412581fa3d375523e01'
      };
    });
    const data = {
      action: 'api',
      params: {
        signature:
          '9f6017bf0c5acee66be32d64edb63471309f7597ef175b64a1329faa3741b875cbec16a46d31a9dd69416cddb6542e3b85a974510869a597d5c099a5d1f6a95501',
        originalParams:
          'JTdCJTIyZW5kcG9pbnQlMjIlM0ElMjIlMjIlMkMlMjJhcGlQYXRoJTIyJTNBJTIyJTJGYXBpJTJGYmxvY2tDaGFpbiUyRmNoYWluU3RhdHVzJTIyJTJDJTIybWV0aG9kTmFtZSUyMiUzQSUyMmdldENoYWluU3RhdHVzJTIyJTJDJTIyYXJndW1lbnRzJTIyJTNBJTVCJTVEJTJDJTIydGltZXN0YW1wJTIyJTNBMTcxODg3Mjc4MCU3RA=='
      },
      appId: '28e653ec-20d4-55e1-b077-a346df57666a',
      id: 'e647eda5134a4325a5bf03f429336c03'
    };
    clientSocket.emit('bridge', data);
  }, 20000);

  test('should handle invoke action', done => {
    clientSocket.on('bridge', message => {
      expect(logger.info).toHaveBeenCalledWith('Message received');
      expect(logger.info).toHaveBeenCalledWith(
        'Sending contract ASh2Wt7nSEmYqnGxPPzp4pnVDU4uhj1XW9Se5VeZcX2UDdyjx method Transfer...'
      );
      expect(logger.error).not.toHaveBeenCalled();
      done();
    });
    Sign.mockImplementation(() => {
      return {
        verify: () => true,
        sign: () =>
          'd319351e191c8a5f751ed3b3f586af53017dba17f5ec58980ba51ec51f968a3cc8deadb4e9acbb8ddd84b065a8b919d2d32724e87d7df6f412581fa3d375523e01'
      };
    });
    const data = {
      action: 'invoke',
      params: {
        signature:
          '9f6017bf0c5acee66be32d64edb63471309f7597ef175b64a1329faa3741b875cbec16a46d31a9dd69416cddb6542e3b85a974510869a597d5c099a5d1f6a95501',
        originalParams:
          'JTdCJTIyZW5kcG9pbnQlMjIlM0ElMjIlMjIlMkMlMjJjb250cmFjdEFkZHJlc3MlMjIlM0ElMjJBU2gyV3Q3blNFbVlxbkd4UFB6cDRwblZEVTR1aGoxWFc5U2U1VmVaY1gyVURkeWp4JTIyJTJDJTIyY29udHJhY3RNZXRob2QlMjIlM0ElMjJUcmFuc2ZlciUyMiUyQyUyMmFyZ3VtZW50cyUyMiUzQSU1QiU3QiUyMm5hbWUlMjIlM0ElMjJwYXJhbXMlMjIlMkMlMjJ2YWx1ZSUyMiUzQSU3QiUyMnN5bWJvbCUyMiUzQSUyMkVMRiUyMiUyQyUyMmFtb3VudCUyMiUzQTEwMDAwMDAwMCUyQyUyMm1lbW8lMjIlM0ElMjJ5ZWFoJTIyJTJDJTIydG8lMjIlM0ElMjIyUkNMbVpRMjI5MXhEd1NiREVKUjZuTGhGSmNNa3lmclZUcTFpMVl4V0M0U2RZNDlhNiUyMiU3RCU3RCU1RCUyQyUyMnRpbWVzdGFtcCUyMiUzQTE3MTg4NzMzMDAlN0Q='
      },
      appId: '28e653ec-20d4-55e1-b077-a346df57666a',
      id: 'a31b390269ad4caa8da0557c43dea556'
    };
    clientSocket.emit('bridge', data);
  }, 20000);

  test('should handle invokeRead action', done => {
    clientSocket.on('bridge', message => {
      expect(logger.info).toHaveBeenCalledWith('Message received');
      expect(logger.info).toHaveBeenCalledWith(
        'Calling contract 2UKQnHcQvhBT6X6ULtfnuh3b9PVRvVMEroHHkcK4YfcoH1Z1x2 method GetContractAddressByName...'
      );
      expect(logger.error).not.toHaveBeenCalled();
      done();
    });
    Sign.mockImplementation(() => {
      return {
        verify: () => true,
        sign: () =>
          'd319351e191c8a5f751ed3b3f586af53017dba17f5ec58980ba51ec51f968a3cc8deadb4e9acbb8ddd84b065a8b919d2d32724e87d7df6f412581fa3d375523e01'
      };
    });
    const data = {
      action: 'invokeRead',
      params: {
        signature:
          '9f6017bf0c5acee66be32d64edb63471309f7597ef175b64a1329faa3741b875cbec16a46d31a9dd69416cddb6542e3b85a974510869a597d5c099a5d1f6a95501',
        originalParams:
          'JTdCJTIyZW5kcG9pbnQlMjIlM0ElMjIlMjIlMkMlMjJjb250cmFjdEFkZHJlc3MlMjIlM0ElMjIyVUtRbkhjUXZoQlQ2WDZVTHRmbnVoM2I5UFZSdlZNRXJvSEhrY0s0WWZjb0gxWjF4MiUyMiUyQyUyMmNvbnRyYWN0TWV0aG9kJTIyJTNBJTIyR2V0Q29udHJhY3RBZGRyZXNzQnlOYW1lJTIyJTJDJTIyYXJndW1lbnRzJTIyJTNBJTVCJTdCJTIybmFtZSUyMiUzQSUyMnBhcmFtcyUyMiUyQyUyMnZhbHVlJTIyJTNBJTIyYTJhMDBmODU4M2MwOGRhYTAwYjgwYjBiYmFjNDY4NDM5NmZlOTY2YjY4M2VhOTU2YTYzYmQ4ODQ1ZWVlNmFlNyUyMiU3RCU1RCUyQyUyMnRpbWVzdGFtcCUyMiUzQTE3MTg4NzMyMjclN0Q='
      },
      appId: '28e653ec-20d4-55e1-b077-a346df57666a',
      id: '36055f21b2d6418998dda7eda6526a2a'
    };
    clientSocket.emit('bridge', data);
  }, 20000);

  test('should handle getContractMethods action', done => {
    clientSocket.on('bridge', message => {
      expect(logger.info).toHaveBeenCalledWith('Message received');
      expect(logger.error).not.toHaveBeenCalled();
      done();
    });
    Sign.mockImplementation(() => {
      return {
        verify: () => true,
        sign: () =>
          'd319351e191c8a5f751ed3b3f586af53017dba17f5ec58980ba51ec51f968a3cc8deadb4e9acbb8ddd84b065a8b919d2d32724e87d7df6f412581fa3d375523e01'
      };
    });
    const data = {
      action: 'getContractMethods',
      params: {
        signature:
          '9f6017bf0c5acee66be32d64edb63471309f7597ef175b64a1329faa3741b875cbec16a46d31a9dd69416cddb6542e3b85a974510869a597d5c099a5d1f6a95501',
        originalParams:
          'JTdCJTIyZW5kcG9pbnQlMjIlM0ElMjIlMjIlMkMlMjJhZGRyZXNzJTIyJTNBJTIyQVNoMld0N25TRW1ZcW5HeFBQenA0cG5WRFU0dWhqMVhXOVNlNVZlWmNYMlVEZHlqeCUyMiUyQyUyMnRpbWVzdGFtcCUyMiUzQTE3MTg4NzMyMjklN0Q='
      },
      appId: '28e653ec-20d4-55e1-b077-a346df57666a',
      id: '08400d6bac284c40a5984821c2ef4f53'
    };
    clientSocket.emit('bridge', data);
  }, 20000);

  test('should handle invalid signature', done => {
    clientSocket.on('bridge', message => {
      expect(logger.error).toHaveBeenCalledWith(new Error('Signature is not valid'));
      done();
    });
    socketInstance.clientConfig['28e653ec-20d4-55e1-b077-a346df57666a'].encrypt.verify = () => false;
    const data = {
      action: 'getContractMethods',
      params: {
        signature:
          '9f6017bf0c5acee66be32d64edb63471309f7597ef175b64a1329faa3741b875cbec16a46d31a9dd69416cddb6542e3b85a974510869a597d5c099a5d1f6a95501',
        originalParams:
          'JTdCJTIyZW5kcG9pbnQlMjIlM0ElMjIlMjIlMkMlMjJhZGRyZXNzJTIyJTNBJTIyQVNoMld0N25TRW1ZcW5HeFBQenA0cG5WRFU0dWhqMVhXOVNlNVZlWmNYMlVEZHlqeCUyMiUyQyUyMnRpbWVzdGFtcCUyMiUzQTE3MTg4NzMyMjklN0Q='
      },
      appId: '28e653ec-20d4-55e1-b077-a346df57666a',
      id: '08400d6bac284c40a5984821c2ef4f53'
    };
    clientSocket.emit('bridge', data);
  }, 20000);

  test('should handle invalid signature', done => {
    clientSocket.on('bridge', message => {
      expect(logger.error).toHaveBeenCalledWith(new Error('Timestamp is not valid'));
      done();
    });
    jest.spyOn(utils, 'checkTimestamp').mockReturnValue(false);
    const data = {
      action: 'getContractMethods',
      params: {
        signature:
          '9f6017bf0c5acee66be32d64edb63471309f7597ef175b64a1329faa3741b875cbec16a46d31a9dd69416cddb6542e3b85a974510869a597d5c099a5d1f6a95501',
        originalParams:
          'JTdCJTIyZW5kcG9pbnQlMjIlM0ElMjIlMjIlMkMlMjJhZGRyZXNzJTIyJTNBJTIyQVNoMld0N25TRW1ZcW5HeFBQenA0cG5WRFU0dWhqMVhXOVNlNVZlWmNYMlVEZHlqeCUyMiUyQyUyMnRpbWVzdGFtcCUyMiUzQTE3MTg4NzMyMjklN0Q='
      },
      appId: '28e653ec-20d4-55e1-b077-a346df57666a',
      id: '08400d6bac284c40a5984821c2ef4f53'
    };
    clientSocket.emit('bridge', data);
  }, 20000);
});
