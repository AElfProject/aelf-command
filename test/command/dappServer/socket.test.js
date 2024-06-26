/* eslint-disable max-len */
import ioc from 'socket.io-client';
import AElf from 'aelf-sdk';
import { getWallet } from '../../../src/utils/wallet';
import Socket from '../../../src/command/dappServer/socket';
import { logger } from '../../../src/utils/myLogger';
import * as utils from '../../../src/command/dappServer/utils';
import Encrypt from '../../../src/command/dappServer/encrypt';
import { endpoint, account, password, dataDir } from '../../constants.js';

jest.mock('../../../src/command/dappServer/encrypt');
jest.mock('../../../src/utils/myLogger');

describe('Socket Server', () => {
  let clientSocket,
    socketInstance,
    port = 35443;
  const serverUrl = `http://localhost:${port}`;
  const aelf = new AElf(new AElf.providers.HttpProvider(endpoint));
  const wallet = getWallet(dataDir, account, password);

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
    const connectData = {
      action: 'connect',
      params: {
        publicKey: '1cc7d260e79e3b83b4525cba2edd47063f8ad05a2adc229a0ff4a5716aa365e3',
        encryptAlgorithm: 'curve25519',
        cipher: 'aes-256-cbc'
      },
      appId: '8a430b69-31df-5ea9-8a55-695faf0623d9',
      id: '47bf3177c41344ca988cfedbba51cf4a'
    };
    Encrypt.mockImplementation(() => {
      return {
        decrypt: () => 'JTdCJTIydGltZXN0YW1wJTIyJTNBMTcxODc5MjM4MCU3RA==',
        encrypt: () => {
          return {
            id: 'a199de9ebed04676a3b0ede012854e26',
            result: {
              encryptedResult:
                'w7ZqPE5MYtoLVIJPjXsAd6I0sbuHQIA10PbS/d4+Iw6C62avXlcNQSjH36R/3B5+psxKGpps/buCT6yATPwB3TUI1o1NdGBpe59VIdAE6BYySvHOzWnKOiiuc4LOMD0to//YsPy5SYYkYqLVVfjdOSHBmvs7qtI1x3RN57KwDjz9s0/MJlRg9olCwWkCABqqECdE8fP9jeLnWyjyKdPE++qGF4rSnPrEpYTXCjWNjYAX2m1SqV0fcfmLCHqE+NbbTEXLtfort3ZDPAl1nr/kKEp6HkXg8hXKzYHQFv45m78PzEkyUBMS8Jsuy8tw1JPkv+TcwtdhPQemcv8aA1B/nrfVVXGPLM0MVlLOctsisiU50nq21/NhTqUR/85GolfMoDQnMXYa/GilLUiPI1ZqWeV4ZqEgZWcVS3AvEWPgZmQ4sNeaDgXFAWOBZa3bPecqqyKGAu3+LPlchLOHCqV46bH6GodrVkma2n7q92LO2Bx13TZ1v4oF/Kp4N+X1K/5BpbPOsVEyM9DfFj8+vDHY467tBOi2TvLfh46H31Jma5J8hYrghs8G9vkEsYPzVMIYhfEpw0pftrSCK9DV6AVlwJU3Pop2CTlvdBtSLNIL7Iz1SLL27Tonb93VysEAXEw+86fZZCb61+f45JExLMc21AWcdSuDmAMZGBe7mAMU/oyUjkXPC8Hv6VRmLPhcPjLY',
              iv: '442e8595ba6345e39a8248993a5ca18f'
            }
          };
        },
        getPublicKey: () => '5074c544a996ea80d95555fef4da21a3f57673ea949293405cee975aba653b4a'
      };
    });
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
    jest.spyOn(utils, 'deserializeMessage').mockReturnValue({ timestamp: 1718784774 });
    jest.spyOn(utils, 'checkTimestamp').mockReturnValue(true);
    const data = {
      action: 'account',
      params: {
        encryptedParams: 'yi4N41XoCTSz0ibXKQ2/rIYZz8D0u6vbaRxLPx+cu7AQjv3nsdWA9bqDSeQMr0ye',
        iv: '67b83b89bdd44e2f8bcbb02251783825'
      },
      appId: '8a430b69-31df-5ea9-8a55-695faf0623d9',
      id: '281537101483488da8c12a9b02c4f563'
    };
    clientSocket.emit('bridge', data);
  });

  test('should handle api action', done => {
    clientSocket.on('bridge', message => {
      expect(logger.info).toHaveBeenCalledWith('Message received');
      expect(logger.info).toHaveBeenCalledWith('Querying api /api/blockChain/chainStatus...');
      expect(logger.error).not.toHaveBeenCalled();
      done();
    });
    Encrypt.mockImplementation(() => {
      return {
        decrypt: () =>
          'JTdCJTIyZW5kcG9pbnQlMjIlM0ElMjIlMjIlMkMlMjJhcGlQYXRoJTIyJTNBJTIyJTJGYXBpJTJGYmxvY2tDaGFpbiUyRmNoYWluU3RhdHVzJTIyJTJDJTIybWV0aG9kTmFtZSUyMiUzQSUyMmdldENoYWluU3RhdHVzJTIyJTJDJTIyYXJndW1lbnRzJTIyJTNBJTVCJTVEJTJDJTIydGltZXN0YW1wJTIyJTNBMTcxODc5NDg2NyU3RA====',
        encrypt: () => {
          return {
            id: '45b66a0738ff48a7b06cec79ff673dba',
            result: {
              encryptedResult:
                'WOsz8XNcMS66yp6qni9+oV9m1pelGe7uLWuICVrc4Urq1gH+XmErWMKZy7vCqPYHfS3kBVwnKMl5WHS6rEUQBZg4mPux3IfozDgNrY7NC9DN81kt/h5tKbSHSx6GMgB9GeVLH5ELj+O+ZZXSszge5k2/xRa0GZYGdX04EXG5OO4XJ+3KxE5YXmO1PhfQenZR19GynQQxymMwByRxZM0GvpKhHM3oQbq7s600wPvulHdIdXY3W4QCPyLTqQD+18aNEVzFYZjr0WGZJKVTv8NsS04gDghVIShmMCTzkvEYPM0kI9JocfSDSI5MqsMGbdpNhKAYCFBgC3ILOpbpGXG53qUUdhFcDIAnj6yeyB8ZG+pkMEBcbn+aZoWjdqS/z7UrIF0RatCKGRzZyOO8La0d+KsHOm11d/cukTsyyz9/Yvds1Equlyk9vz4BUQNkIaM2zXP6AZfE3QwoMf0IhcXdFCEoBybDNEuaxueEBVkHdM+9WF4EwqX2iRHgXa4D6qKfIGgD5zhTASWCEOJj5Q57/eSu2cZ6xT+hJiX95sO1PB0TqatQMhGz2n/fAKf5roKAXxgjAx/eiAzygTVldmMGHQtj++UveilXCeZ9BEInb3K3mRyx5pc/t874dGF44l/VqC18RK0X1xgUDYcV2ru/HJwH0OHKxDJSDlEIzME8U5x6FVGHc33kFgY1LcLEXHd+r0MpSYdtbHiwwPPTSGhgFwnpF+mWZnQepQh4VsNcfJRg8tMG9Jcx4vM9vaT7b7a9LaT333WZ1d6DiXQYZ3MJBewUwqfNlqTaz+O7o51tOXMHzX4FxcUwgsGLSgH9al5hjWb3uZZarXrF/dhB4zyQBmTdPO6k4cowcoWLvEnKiSU2mYKqSvUoqmM1o7cI21VD4reV7XQiFxUEP3CNlkNFm1imImhANZoltx+GkzZRsL9IHMgkEO5ixLR+ouOEZt4RGqmLQnQfdZyZTAOBS95izXjEchWM+W0EEXh+wfvCAphcyfSK0m+KZRsc6z5CN9FvF3nkfVN+pt7G59j0+CbJpGHDqXQm9OcuUqqbHkvUNArrNtHpZSadK6m2TewBuLeujLqG1MQD7P7jzDMvg8vMjOiX7KaqQoKaMlWdM6woEusNT0ddua4ReJ+PJtk7W3AjNIVYGhO47cGjFrb7i4gHPQ==',
              iv: '640c59919fa84f7aa6ea9dcaba8c7a0b'
            }
          };
        }
      };
    });
    jest.spyOn(utils, 'deserializeMessage').mockReturnValue({
      //   endpoint: '',
      apiPath: '/api/blockChain/chainStatus',
      methodName: 'getChainStatus',
      arguments: [],
      timestamp: 1718794867
    });
    jest.spyOn(utils, 'checkTimestamp').mockReturnValue(true);
    const data = {
      action: 'api',
      params: {
        encryptedParams:
          'bJiUPLoclvINMQDHJw2Dt4sGCFB5LV65UaIwUuoqs+O+K3H7bhexPNUecHrbqiSxfpoynsh72lrAWcykNPsfL8/XxYqnmJnGACdA+vCRVIdmL91/FzXfZoE8LgfhdELooVk2PCsfVLUuiOfZPVqo05SPvU320hIJbm4jqyCDTnNofLvSwq+bFULdpa1QmLxMiLaiKXXj6ktO3nER75sb3hLk7Lrun3rRvnFrbfC2Qlw4Zia2b0yMIacC0DmomWU0',
        iv: '2ef43a6a71ed4aad9811ffba7d39464f'
      },
      appId: '8a430b69-31df-5ea9-8a55-695faf0623d9',
      id: '45b66a0738ff48a7b06cec79ff673dba'
    };
    clientSocket.emit('bridge', data);
  });

  test('should handle invoke action', done => {
    clientSocket.on('bridge', message => {
      expect(logger.info).toHaveBeenCalledWith('Message received');
      expect(logger.info).toHaveBeenCalledWith(
        'Sending contract ASh2Wt7nSEmYqnGxPPzp4pnVDU4uhj1XW9Se5VeZcX2UDdyjx method Transfer...'
      );
      expect(logger.error).not.toHaveBeenCalled();
      done();
    });
    Encrypt.mockImplementation(() => {
      return {
        decrypt: () =>
          'JTdCJTIyZW5kcG9pbnQlMjIlM0ElMjIlMjIlMkMlMjJjb250cmFjdEFkZHJlc3MlMjIlM0ElMjJBU2gyV3Q3blNFbVlxbkd4UFB6cDRwblZEVTR1aGoxWFc5U2U1VmVaY1gyVURkeWp4JTIyJTJDJTIyY29udHJhY3RNZXRob2QlMjIlM0ElMjJUcmFuc2ZlciUyMiUyQyUyMmFyZ3VtZW50cyUyMiUzQSU1QiU3QiUyMm5hbWUlMjIlM0ElMjJwYXJhbXMlMjIlMkMlMjJ2YWx1ZSUyMiUzQSU3QiUyMnN5bWJvbCUyMiUzQSUyMkVMRiUyMiUyQyUyMmFtb3VudCUyMiUzQTEwMDAwMDAwMCUyQyUyMm1lbW8lMjIlM0ElMjJ5ZWFoJTIyJTJDJTIydG8lMjIlM0ElMjIyUkNMbVpRMjI5MXhEd1NiREVKUjZuTGhGSmNNa3lmclZUcTFpMVl4V0M0U2RZNDlhNiUyMiU3RCU3RCU1RCUyQyUyMnRpbWVzdGFtcCUyMiUzQTE3MTg4NTI5NzIlN0Q=',
        encrypt: () => {
          return {
            id: 'f84f494d82ce42c5b4018d37d6bd1d34',
            result: {
              encryptedResult:
                'gE0Mdb25HVglTZdjs26pvgq337LybbfPFZOsL/FWeKi/EBFdT+Vv8J+8xnU5dp/NNy49gTJQI8ggm9QRvpLz2rSb0fT+9fakQcC5REpOIO+WzZ93OCLE2pg/dRyTpyaeZNc7Hk9TGYV5puG2BfLye9ZpdxcUvMzaNqlw6s6frZp2m5djHRskGi+zcsU95JbjEDeqh1s2xtOBbL7JvrT/QTccSPcgTFFLYfoYGhD+SMt/+o049lBGa8c91rQRPbFj',
              iv: '9e5d79cb079d49a295e5fa5f795a06c4'
            }
          };
        }
      };
    });

    jest.spyOn(utils, 'deserializeMessage').mockReturnValue({
      endpoint: '',
      contractAddress: 'ASh2Wt7nSEmYqnGxPPzp4pnVDU4uhj1XW9Se5VeZcX2UDdyjx',
      contractMethod: 'Transfer',
      arguments: [
        {
          name: 'params',
          value: {
            symbol: 'ELF',
            amount: 1 * 10 ** 8,
            memo: 'yeah',
            to: '2RCLmZQ2291xDwSbDEJR6nLhFJcMkyfrVTq1i1YxWC4SdY49a6'
          }
        }
      ],
      timestamp: 1718852972
    });
    jest.spyOn(utils, 'checkTimestamp').mockReturnValue(true);

    const data = {
      action: 'invoke',
      params: {
        encryptedParams:
          'CWI3wEtHiyihMfMerb4UmU5wAOnv2Z652Hho7CltDuKwr8ZD69FNvjeoaxwg14bwxvSHRe5Myjuzp06wGrmRv1i+FaZfNrhBYu3afPqJx4cE6a6HSXwAOoUz3yhHTFU+gTSTeOS3MjkZUcEquu6/RYb0k4g6IwTWgxyRe9hppnbYJO3f0YGqQiP1M2awfWNKgs/OzpqI9FPqLRH/5Rzb1IKNHx8utks02vA2dVna+HgF9H13Pnu7joyuoz/LlKhZJwrAow4Me1c93+KIY1dgVjwgVxyIqxQ9vFe2dBxlPCJWvQB4/NZXVwFKeOlBAEy7o0tpUKnYX5NY7may6fnv1avw2Doi7xnCa4tLrZT4FGzpewxTCvg2WARjEqm/XqQQkXOPTv/wuCUmh6LEkMcccFgR7O87SPLkhLCv5QCrlWwBa4DkxgYO0Uo32X1igdTMwXLvu4yiPT7Od4pfyvMRuMwVEFmqbblbLpT/U1WwzIIcTG3x0CFiw0lJCdZ2zIjy5vIGp/ybxLez3TNn39e8CJTOU95XXsg6xcj2szF4LpE=',
        iv: '2fccb196db614d05abc09deaa3798242'
      },
      appId: '8a430b69-31df-5ea9-8a55-695faf0623d9',
      id: 'f84f494d82ce42c5b4018d37d6bd1d34'
    };
    clientSocket.emit('bridge', data);
  });

  test('should handle invokeRead action', done => {
    clientSocket.on('bridge', message => {
      expect(logger.info).toHaveBeenCalledWith('Message received');
      expect(logger.info).toHaveBeenCalledWith(
        'Calling contract 2UKQnHcQvhBT6X6ULtfnuh3b9PVRvVMEroHHkcK4YfcoH1Z1x2 method GetContractAddressByName...'
      );
      expect(logger.error).not.toHaveBeenCalled();
      done();
    });

    Encrypt.mockImplementation(() => {
      return {
        decrypt: () =>
          'JTdCJTIyZW5kcG9pbnQlMjIlM0ElMjIlMjIlMkMlMjJjb250cmFjdEFkZHJlc3MlMjIlM0ElMjIyVUtRbkhjUXZoQlQ2WDZVTHRmbnVoM2I5UFZSdlZNRXJvSEhrY0s0WWZjb0gxWjF4MiUyMiUyQyUyMmNvbnRyYWN0TWV0aG9kJTIyJTNBJTIyR2V0Q29udHJhY3RBZGRyZXNzQnlOYW1lJTIyJTJDJTIyYXJndW1lbnRzJTIyJTNBJTVCJTdCJTIybmFtZSUyMiUzQSUyMnBhcmFtcyUyMiUyQyUyMnZhbHVlJTIyJTNBJTIyYTJhMDBmODU4M2MwOGRhYTAwYjgwYjBiYmFjNDY4NDM5NmZlOTY2YjY4M2VhOTU2YTYzYmQ4ODQ1ZWVlNmFlNyUyMiU3RCU1RCUyQyUyMnRpbWVzdGFtcCUyMiUzQTE3MTg4NDkwMzElN0Q=',
        encrypt: () => {
          return {
            id: '0dfbd2c9112140f485e6d809b3a70744',
            result: {
              encryptedResult:
                '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',
              iv: '883c926ef17a4c97845c6cad65a030e9'
            }
          };
        }
      };
    });

    jest.spyOn(utils, 'deserializeMessage').mockReturnValue({
      //   endpoint: '',
      contractAddress: '2UKQnHcQvhBT6X6ULtfnuh3b9PVRvVMEroHHkcK4YfcoH1Z1x2',
      contractMethod: 'GetContractAddressByName',
      arguments: [
        {
          name: 'params',
          value: 'a2a00f8583c08daa00b80b0bbac4684396fe966b683ea956a63bd8845eee6ae7'
        }
      ],
      timestamp: 1718849031
    });
    jest.spyOn(utils, 'checkTimestamp').mockReturnValue(true);

    const data = {
      action: 'invokeRead',
      params: {
        encryptedParams:
          'lqmIluuPMyQw/2/LXMEnKYfxp5KsQvwPpAEPCvsUc6Cf0X1K7d1CcCKv+h6W35vV6+d3sOSZLyeX0SIM7375wKsu14A+tO1OiaJ9DdKyJ6LJo+Mj+aA2Qp0N8zaXQmoTZPsKg/VYI3+YFXQU0tkPUCb+/YkPs/aE5T2KItU9WI3hVN6Xkd0vK2dShaTwhngVeXlcXeymcH/C0CevesDY+opYOHfqY/jP0LqDeXjXUP06LKGx+uMObJJvupslRI2HTbfwJWNYbsM3LY6VCbnA4tKnsfdxZZ3PvIoD6LRaMoIGjbsaTKl0hyZ38TPh+15r+OcoJjWka0TYpTFk93pTKnyGnkClGikWu4VNNe9CKKTSksjc5SNsBNNimxd/L4LLw2/yPIG3ZsaQ0AliaWOhO9SuvPKZnWBPdX/I4sPLkX1UZ5p0adUzQfXjnom2vCg/LeN8TcThw/+LlGAct0c4uQ==',
        iv: 'da4512e2c1ed4f819d86fb3816b55aca'
      },
      appId: '8a430b69-31df-5ea9-8a55-695faf0623d9',
      id: '98c8b690fbbe43ca9f6fd1f72c18f2db'
    };
    clientSocket.emit('bridge', data);
  });

  test('should handle getContractMethods action', done => {
    clientSocket.on('bridge', message => {
      expect(logger.info).toHaveBeenCalledWith('Message received');
      expect(logger.error).not.toHaveBeenCalled();
      done();
    });

    Encrypt.mockImplementation(() => {
      return {
        decrypt: () =>
          'JTdCJTIyZW5kcG9pbnQlMjIlM0ElMjIlMjIlMkMlMjJhZGRyZXNzJTIyJTNBJTIyQVNoMld0N25TRW1ZcW5HeFBQenA0cG5WRFU0dWhqMVhXOVNlNVZlWmNYMlVEZHlqeCUyMiUyQyUyMnRpbWVzdGFtcCUyMiUzQTE3MTg4NTI5NjMlN0Q=',
        encrypt: () => {
          return {
            id: '7c4aafc53b804bb189c77ea95baf70c1',
            result: {
              encryptedResult:
                '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',
              iv: '9038ab6200ac48c0a0ffef278f5afbb8'
            }
          };
        }
      };
    });

    jest.spyOn(utils, 'deserializeMessage').mockReturnValue({
      endpoint: '',
      address: 'ASh2Wt7nSEmYqnGxPPzp4pnVDU4uhj1XW9Se5VeZcX2UDdyjx',
      timestamp: 1718852963
    });
    jest.spyOn(utils, 'checkTimestamp').mockReturnValue(true);

    const data = {
      action: 'getContractMethods',
      params: {
        encryptedParams:
          'bY89mIBq4wRbI0LWkDN52aFFgbgJbusedG+A54+sOTOnlSk9PxQ93Nw92D8Hc2zBL9DDROudC75dlqxCP8nGD3NKZyeAPQXM1BFTpc/8+OoD8AVpp+XAkO2SFFjHzS35JqspnaeJuJHKGvvnySFUkR/0OOq6ES8pj0nsogPl8wupWHlcDp0+mUo2hrYPddBZ',
        iv: 'ea22631f45b34416ae01d95f095cba49'
      },
      appId: '8a430b69-31df-5ea9-8a55-695faf0623d9',
      id: '7c4aafc53b804bb189c77ea95baf70c1'
    };
    clientSocket.emit('bridge', data);
  }, 40000);

  test('should handle disconnect action', done => {
    clientSocket.on('bridge', message => {
      expect(logger.info).toHaveBeenCalledWith('Message received');
      expect(logger.info).toHaveBeenCalledWith('App 8a430b69-31df-5ea9-8a55-695faf0623d9 disconnected');
      expect(logger.error).not.toHaveBeenCalled();
      done();
    });

    Encrypt.mockImplementation(() => {
      return {
        decrypt: () =>
          'JTdCJTIyY29kZSUyMiUzQTAlMkMlMjJtc2clMjIlM0ElMjJzdWNjZXNzJTIyJTJDJTIyZXJyb3IlMjIlM0ElNUIlNUQlMkMlMjJkYXRhJTIyJTNBJTdCJTdEJTdE',
        encrypt: () => {
          return {
            id: 'ded9643a0095440a9a5684c4b4c10e35',
            result: {
              encryptedResult:
                'BytgmULgGg7yEJ9EOvqipB+8uwBjAD4Dv44X7nba6j+ISTnx4QCFtjNpCAbDw9DloC/FMfl/4q+QbORXbtE1DqbGsae0bsAUQ03jLFU40Aui9Dq/AZLrcJ7/usU+2pbk',
              iv: 'b08cbd888f8a400e8c0ded10826f4c03'
            }
          };
        }
      };
    });

    jest.spyOn(utils, 'deserializeMessage').mockReturnValue({
      endpoint: '',
      address: 'ASh2Wt7nSEmYqnGxPPzp4pnVDU4uhj1XW9Se5VeZcX2UDdyjx',
      timestamp: 1718852963
    });
    jest.spyOn(utils, 'checkTimestamp').mockReturnValue(true);

    const data = {
      action: 'disconnect',
      params: {
        encryptedParams: 'K/ZzGwmGdGBvypMkYEFkKNj8BiGnqndWwPPar1vejw/FOFptyhGTBe27NCRObzoR',
        iv: 'f009bd251db14d13b1e87273b8b828b5'
      },
      appId: '8a430b69-31df-5ea9-8a55-695faf0623d9',
      id: 'ded9643a0095440a9a5684c4b4c10e35'
    };
    clientSocket.emit('bridge', data);
  });
  test('should handle null action', done => {
    clientSocket.on('bridge', message => {
      expect(logger.error).toHaveBeenCalledWith('error happened');
      expect(logger.error).toHaveBeenCalledWith(new Error('You should set a action name'));
      done();
    });

    const data = {
      action: null,
      params: {
        encryptedParams: 'K/ZzGwmGdGBvypMkYEFkKNj8BiGnqndWwPPar1vejw/FOFptyhGTBe27NCRObzoR',
        iv: 'f009bd251db14d13b1e87273b8b828b5'
      },
      appId: '8a430b69-31df-5ea9-8a55-695faf0623d9',
      id: 'ded9643a0095440a9a5684c4b4c10e35'
    };
    clientSocket.emit('bridge', data);
  });
  test('should handle undefined action', done => {
    clientSocket.on('bridge', message => {
      expect(logger.error).toHaveBeenCalledWith('error happened');
      expect(logger.error).toHaveBeenCalledWith(new Error('You should set a action name'));
      done();
    });

    const data = {
      action: undefined,
      params: {
        encryptedParams: 'K/ZzGwmGdGBvypMkYEFkKNj8BiGnqndWwPPar1vejw/FOFptyhGTBe27NCRObzoR',
        iv: 'f009bd251db14d13b1e87273b8b828b5'
      },
      appId: '8a430b69-31df-5ea9-8a55-695faf0623d9',
      id: 'ded9643a0095440a9a5684c4b4c10e35'
    };
    clientSocket.emit('bridge', data);
  });
  test('should handle empty string action', done => {
    clientSocket.on('bridge', message => {
      expect(logger.error).toHaveBeenCalledWith('error happened');
      expect(logger.error).toHaveBeenCalledWith(new Error('You should set a action name'));
      done();
    });

    const data = {
      action: '',
      params: {
        encryptedParams: 'K/ZzGwmGdGBvypMkYEFkKNj8BiGnqndWwPPar1vejw/FOFptyhGTBe27NCRObzoR',
        iv: 'f009bd251db14d13b1e87273b8b828b5'
      },
      appId: '8a430b69-31df-5ea9-8a55-695faf0623d9',
      id: 'ded9643a0095440a9a5684c4b4c10e35'
    };
    clientSocket.emit('bridge', data);
  });

  test('should handle not supported action', done => {
    clientSocket.on('bridge', message => {
      expect(logger.error).toHaveBeenCalledWith('error happened');
      expect(logger.error).toHaveBeenCalledWith(new Error('test is not supported'));
      done();
    });

    const data = {
      action: 'test',
      params: {
        encryptedParams: 'K/ZzGwmGdGBvypMkYEFkKNj8BiGnqndWwPPar1vejw/FOFptyhGTBe27NCRObzoR',
        iv: 'f009bd251db14d13b1e87273b8b828b5'
      },
      appId: '8a430b69-31df-5ea9-8a55-695faf0623d9',
      id: 'ded9643a0095440a9a5684c4b4c10e35'
    };
    clientSocket.emit('bridge', data);
  });

  test('should handle not connected appId', done => {
    clientSocket.on('bridge', message => {
      expect(logger.error).toHaveBeenCalledWith('error happened');
      expect(logger.error).toHaveBeenCalledWith(new Error('AppId test-id has not connected'));
      done();
    });

    const data = {
      action: 'account',
      params: {
        encryptedParams: 'K/ZzGwmGdGBvypMkYEFkKNj8BiGnqndWwPPar1vejw/FOFptyhGTBe27NCRObzoR',
        iv: 'f009bd251db14d13b1e87273b8b828b5'
      },
      appId: 'test-id',
      id: 'ded9643a0095440a9a5684c4b4c10e35'
    };
    clientSocket.emit('bridge', data);
  });
  test('should handle Timestamp is not valid', done => {
    clientSocket.on('bridge', message => {
      expect(logger.error).toHaveBeenCalledWith(new Error('Timestamp is not valid'));
      done();
    });
    jest.spyOn(utils, 'deserializeMessage').mockReturnValue({ timestamp: 1718784774 });
    jest.spyOn(utils, 'checkTimestamp').mockReturnValue(false);

    const data = {
      action: 'account',
      params: {
        encryptedParams: 'yi4N41XoCTSz0ibXKQ2/rIYZz8D0u6vbaRxLPx+cu7AQjv3nsdWA9bqDSeQMr0ye',
        iv: '67b83b89bdd44e2f8bcbb02251783825'
      },
      appId: '8a430b69-31df-5ea9-8a55-695faf0623d9',
      id: '281537101483488da8c12a9b02c4f563'
    };
    clientSocket.emit('bridge', data);
  });

  test('should handle not supported api', done => {
    clientSocket.on('bridge', message => {
      expect(logger.error).toHaveBeenCalledWith('error happened');
      expect(logger.error).toHaveBeenCalledWith(new Error(`Not support api /test`));
      done();
    });

    Encrypt.mockImplementation(() => {
      return {
        decrypt: () =>
          'JTdCJTIyZW5kcG9pbnQlMjIlM0ElMjIlMjIlMkMlMjJhcGlQYXRoJTIyJTNBJTIyJTJGYXBpJTJGYmxvY2tDaGFpbiUyRmNoYWluU3RhdHVzJTIyJTJDJTIybWV0aG9kTmFtZSUyMiUzQSUyMmdldENoYWluU3RhdHVzJTIyJTJDJTIyYXJndW1lbnRzJTIyJTNBJTVCJTVEJTJDJTIydGltZXN0YW1wJTIyJTNBMTcxODc5NDg2NyU3RA====',
        encrypt: () => {
          return {
            id: '45b66a0738ff48a7b06cec79ff673dba',
            result: {
              encryptedResult:
                'WOsz8XNcMS66yp6qni9+oV9m1pelGe7uLWuICVrc4Urq1gH+XmErWMKZy7vCqPYHfS3kBVwnKMl5WHS6rEUQBZg4mPux3IfozDgNrY7NC9DN81kt/h5tKbSHSx6GMgB9GeVLH5ELj+O+ZZXSszge5k2/xRa0GZYGdX04EXG5OO4XJ+3KxE5YXmO1PhfQenZR19GynQQxymMwByRxZM0GvpKhHM3oQbq7s600wPvulHdIdXY3W4QCPyLTqQD+18aNEVzFYZjr0WGZJKVTv8NsS04gDghVIShmMCTzkvEYPM0kI9JocfSDSI5MqsMGbdpNhKAYCFBgC3ILOpbpGXG53qUUdhFcDIAnj6yeyB8ZG+pkMEBcbn+aZoWjdqS/z7UrIF0RatCKGRzZyOO8La0d+KsHOm11d/cukTsyyz9/Yvds1Equlyk9vz4BUQNkIaM2zXP6AZfE3QwoMf0IhcXdFCEoBybDNEuaxueEBVkHdM+9WF4EwqX2iRHgXa4D6qKfIGgD5zhTASWCEOJj5Q57/eSu2cZ6xT+hJiX95sO1PB0TqatQMhGz2n/fAKf5roKAXxgjAx/eiAzygTVldmMGHQtj++UveilXCeZ9BEInb3K3mRyx5pc/t874dGF44l/VqC18RK0X1xgUDYcV2ru/HJwH0OHKxDJSDlEIzME8U5x6FVGHc33kFgY1LcLEXHd+r0MpSYdtbHiwwPPTSGhgFwnpF+mWZnQepQh4VsNcfJRg8tMG9Jcx4vM9vaT7b7a9LaT333WZ1d6DiXQYZ3MJBewUwqfNlqTaz+O7o51tOXMHzX4FxcUwgsGLSgH9al5hjWb3uZZarXrF/dhB4zyQBmTdPO6k4cowcoWLvEnKiSU2mYKqSvUoqmM1o7cI21VD4reV7XQiFxUEP3CNlkNFm1imImhANZoltx+GkzZRsL9IHMgkEO5ixLR+ouOEZt4RGqmLQnQfdZyZTAOBS95izXjEchWM+W0EEXh+wfvCAphcyfSK0m+KZRsc6z5CN9FvF3nkfVN+pt7G59j0+CbJpGHDqXQm9OcuUqqbHkvUNArrNtHpZSadK6m2TewBuLeujLqG1MQD7P7jzDMvg8vMjOiX7KaqQoKaMlWdM6woEusNT0ddua4ReJ+PJtk7W3AjNIVYGhO47cGjFrb7i4gHPQ==',
              iv: '640c59919fa84f7aa6ea9dcaba8c7a0b'
            }
          };
        }
      };
    });
    jest.spyOn(utils, 'deserializeMessage').mockReturnValue({
      endpoint: '',
      apiPath: '/test',
      methodName: 'getChainStatus',
      arguments: [],
      timestamp: 1718794867
    });
    jest.spyOn(utils, 'checkTimestamp').mockReturnValue(true);

    const data = {
      action: 'api',
      params: {
        encryptedParams:
          'bJiUPLoclvINMQDHJw2Dt4sGCFB5LV65UaIwUuoqs+O+K3H7bhexPNUecHrbqiSxfpoynsh72lrAWcykNPsfL8/XxYqnmJnGACdA+vCRVIdmL91/FzXfZoE8LgfhdELooVk2PCsfVLUuiOfZPVqo05SPvU320hIJbm4jqyCDTnNofLvSwq+bFULdpa1QmLxMiLaiKXXj6ktO3nER75sb3hLk7Lrun3rRvnFrbfC2Qlw4Zia2b0yMIacC0DmomWU0',
        iv: '2ef43a6a71ed4aad9811ffba7d39464f'
      },
      appId: '8a430b69-31df-5ea9-8a55-695faf0623d9',
      id: '45b66a0738ff48a7b06cec79ff673dba'
    };
    clientSocket.emit('bridge', data);
  });

  test('should handle invoke with not supported method', done => {
    clientSocket.on('bridge', message => {
      expect(logger.error).toHaveBeenCalledWith('error happened');
      expect(logger.error).toHaveBeenCalledWith(new Error(`No such method Test`));
      done();
    });

    Encrypt.mockImplementation(() => {
      return {
        decrypt: () =>
          'JTdCJTIyZW5kcG9pbnQlMjIlM0ElMjIlMjIlMkMlMjJjb250cmFjdEFkZHJlc3MlMjIlM0ElMjIyVUtRbkhjUXZoQlQ2WDZVTHRmbnVoM2I5UFZSdlZNRXJvSEhrY0s0WWZjb0gxWjF4MiUyMiUyQyUyMmNvbnRyYWN0TWV0aG9kJTIyJTNBJTIyR2V0Q29udHJhY3RBZGRyZXNzQnlOYW1lJTIyJTJDJTIyYXJndW1lbnRzJTIyJTNBJTVCJTdCJTIybmFtZSUyMiUzQSUyMnBhcmFtcyUyMiUyQyUyMnZhbHVlJTIyJTNBJTIyYTJhMDBmODU4M2MwOGRhYTAwYjgwYjBiYmFjNDY4NDM5NmZlOTY2YjY4M2VhOTU2YTYzYmQ4ODQ1ZWVlNmFlNyUyMiU3RCU1RCUyQyUyMnRpbWVzdGFtcCUyMiUzQTE3MTg4NDkwMzElN0Q=',
        encrypt: () => {
          return {
            id: '0dfbd2c9112140f485e6d809b3a70744',
            result: {
              encryptedResult:
                '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',
              iv: '883c926ef17a4c97845c6cad65a030e9'
            }
          };
        }
      };
    });

    jest.spyOn(utils, 'deserializeMessage').mockReturnValue({
      endpoint: '',
      contractAddress: '2UKQnHcQvhBT6X6ULtfnuh3b9PVRvVMEroHHkcK4YfcoH1Z1x2',
      contractMethod: 'Test',
      arguments: [
        {
          name: 'params',
          value: 'a2a00f8583c08daa00b80b0bbac4684396fe966b683ea956a63bd8845eee6ae7'
        }
      ],
      timestamp: 1718849031
    });
    jest.spyOn(utils, 'checkTimestamp').mockReturnValue(true);

    const data = {
      action: 'invokeRead',
      params: {
        encryptedParams:
          'lqmIluuPMyQw/2/LXMEnKYfxp5KsQvwPpAEPCvsUc6Cf0X1K7d1CcCKv+h6W35vV6+d3sOSZLyeX0SIM7375wKsu14A+tO1OiaJ9DdKyJ6LJo+Mj+aA2Qp0N8zaXQmoTZPsKg/VYI3+YFXQU0tkPUCb+/YkPs/aE5T2KItU9WI3hVN6Xkd0vK2dShaTwhngVeXlcXeymcH/C0CevesDY+opYOHfqY/jP0LqDeXjXUP06LKGx+uMObJJvupslRI2HTbfwJWNYbsM3LY6VCbnA4tKnsfdxZZ3PvIoD6LRaMoIGjbsaTKl0hyZ38TPh+15r+OcoJjWka0TYpTFk93pTKnyGnkClGikWu4VNNe9CKKTSksjc5SNsBNNimxd/L4LLw2/yPIG3ZsaQ0AliaWOhO9SuvPKZnWBPdX/I4sPLkX1UZ5p0adUzQfXjnom2vCg/LeN8TcThw/+LlGAct0c4uQ==',
        iv: 'da4512e2c1ed4f819d86fb3816b55aca'
      },
      appId: '8a430b69-31df-5ea9-8a55-695faf0623d9',
      id: '98c8b690fbbe43ca9f6fd1f72c18f2db'
    };
    clientSocket.emit('bridge', data);
  });
});
