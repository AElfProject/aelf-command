/**
 * @file socket server
 * @author atom-yang
 */
const Server = require('socket.io');
const AElf = require('aelf-sdk');
const Schema = require('async-validator/dist-node/index').default;
const Sign = require('./sign');
const Encrypt = require('./encrypt');
const {
  randomId
} = require('../../utils/utils');
const {
  serializeMessage,
  deserializeMessage
} = require('./utils');
const {
  CHAIN_APIS
} = require('./constants');

const signRequestRules = {
  id: {
    required: true,
    type: 'hex',
    min: 32
  },
  appId: {
    required: true,
    type: 'hex',
    min: 32
  },
  action: {
    required: true,
    type: 'string'
  },
  params: {
    required: true,
    type: 'object',
    fields: {
      originalParams: {
        type: 'string',
        required: true
      },
      signature: {
        type: 'hex',
        required: true,
        min: 129,
        max: 130
      }
    }
  }
};

const encryptRequestRules = {
  ...signRequestRules,
  params: {
    iv: {
      type: 'hex',
      required: true
    },
    encryptedParams: {
      type: 'string',
      required: true
    }
  }
};

const connectSignRules = {
  ...signRequestRules,
  params: {
    encryptAlgorithm: {
      type: 'enum',
      enum: ['secp256k1'],
      required: true
    },
    random: {
      type: 'hex',
      required: true
    },
    publicKey: {
      type: 'hex',
      required: true
    },
    signature: {
      type: 'hex',
      required: true,
      min: 129,
      max: 130
    }
  }
};

const connectEncryptRules = {
  ...signRequestRules,
  params: {
    encryptAlgorithm: {
      type: 'enum',
      enum: ['curve25519'],
      required: true
    },
    cipher: {
      type: 'hex',
      required: true
    },
    publicKey: {
      type: 'hex',
      required: true
    }
  }
};

const signRequestValidator = new Schema(signRequestRules);
const encryptRequestValidator = new Schema(encryptRequestRules);
const connectSignValidator = new Schema(connectSignRules);
const connectEncryptValidator = new Schema(connectEncryptRules);

class Socket {
  constructor(options) {
    const {
      port,
      endpoint,
      aelf,
      wallet,
      address
    } = options;
    this.aelf = aelf;
    this.defaultEndpoint = endpoint;
    this.wallet = wallet;
    this.address = address;
    this.handleConenction = this.handleConenction.bind(this);
    this.socket = new Server(port, {
      transports: ['websocket']
    });
    this.socket.on('connection', this.handleConnection);
    this.clientConfig = {
      // default: {
      //   encryptWay: 'sign', // or 'encrypt'
      //   encrypt: new Sign()
      // }
    };
  }

  responseFormat(id, result, errors) {
    if (errors && (errors instanceof Error || (Array.isArray(errors) && errors.length > 0))) {
      return {
        id,
        result: {
          errors: Array.isArray(errors) ? errors : [errors],
          code: errors.code || 500,
          msg: errors.message || 'err happened',
          data: result
        }
      };
    }
    return {
      id,
      result: {
        code: 0,
        msg: 'success',
        errors: [],
        data: result
      }
    };
  }

  send(client, appId, id, data, error, needSerialized = true) {
    const result = this.responseFormat(id, data, error);
    if (needSerialized) {
      result.result = this.serializeResult(appId, result.result);
    }
    client.emit('bridge', result);
    client.emit('bridge', result);
  }

  handleConnection(client) {
    client.on('bridge', async data => {
      let result = {};
      const {
        action,
        id,
        appId
      } = data;
      try {
        switch (action) {
          case 'connect':
            result = await this.handleConnect(data);
            break;
          case 'api':
            result = await this.handleApi(data);
            break;
          case 'account':
            result = this.handleAccount();
            break;
          case 'invoke':
          case 'invokeRead':
            result = await this.handleInvoke(data, action === 'invokeRead');
            break;
          case 'disconnect':
            result = await this.handleDisconnect(appId);
            break;
          case null:
          case undefined:
          case '':
            throw new Error('You should set a action name');
          default:
            throw new Error(`${action} is not supported`);
        }
        this.send(client, appId, id, result, null, action !== 'connect');
      } catch (e) {
        this.send(client, appId, id, {}, e);
      }
    });
  }

  async deserializeParams(request) {
    const {
      appId,
      params
    } = request;
    if (!this.clientConfig[appId]) {
      throw new Error(`AppId ${appId} has not connected`);
    }
    if (this.clientConfig[appId].encryptWay === 'sign') {
      await signRequestValidator.validate(params);
      const {
        signature,
        originalParams
      } = params;
      const isValid = this.clientConfig[appId].encrypt.verify(Buffer.from(originalParams, 'base64'), signature);
      if (!isValid) {
        throw new Error('Signature is not valid');
      }
      return deserializeMessage(originalParams);
    }
    await encryptRequestValidator.validate(params);
    const {
      iv,
      encryptedParams
    } = params;
    const originalParams = this.clientConfig[appId].encrypt.decrypt(encryptedParams, iv);
    return deserializeMessage(originalParams);
  }

  serializeResult(appId, result) {
    if (!this.clientConfig[appId]) {
      throw new Error(`AppId ${appId} has not connected`);
    }
    if (this.clientConfig[appId].encryptWay === 'sign') {
      const originalResult = serializeMessage(result);
      const signature = this.clientConfig[appId].encrypt.sign(Buffer.from(originalResult, 'base64'));
      return {
        signature,
        originalResult
      };
    }
    const originalResult = serializeMessage(result);
    return this.clientConfig[appId].encrypt.encrypt(originalResult);
  }

  async handleConnect(message) {
    const {
      appId,
      params
    } = message;
    const {
      encryptAlgorithm,
      publicKey
    } = params;
    if (params.cipher) {
      await connectEncryptValidator.validate(message);
      const {
        cipher,
      } = params;
      const encrypt = new Encrypt(encryptAlgorithm, publicKey, cipher);
      this.clientConfig = {
        ...this.clientConfig,
        [appId]: {
          encryptWay: 'encrypt',
          encrypt
        }
      };
      return {
        publicKey: encrypt.getPublicKey()
      };
    }
    if (params.signature) {
      await connectSignValidator.validate(message);
      const {
        random,
        signature
      } = params;
      const result = Sign.verify(encryptAlgorithm, publicKey, Buffer.from(random, 'hex'), signature);
      if (!result) {
        throw new Error('Not a valid signature');
      }
      this.clientConfig = {
        ...this.clientConfig,
        [appId]: {
          encryptWay: 'sign',
          encrypt: new Sign(encryptAlgorithm, publicKey)
        }
      };
      const responseRandom = randomId();
      const responseSignature = this.clientConfig[appId].encrypt.sign(Buffer.from(random, 'hex'));
      const responsePublicKey = this.clientConfig[appId].encrypt.getPublicKey();
      return {
        publicKey: responsePublicKey,
        random: responseRandom,
        signature: responseSignature
      };
    }
    throw new Error('Not support encrypt method or not enough params');
  }

  async handleApi(message) {
    const params = await this.deserializeParams(message);
    const {
      endpoint = this.defaultEndpoint,
      apiPath,
      arguments: apiArgs
    } = params;
    if (!CHAIN_APIS[apiPath]) {
      throw new Error(`Not support api ${apiPath}`);
    }
    this.aelf.setProvider(new AElf.providers.HttpProvider(endpoint));
    const result = await this.aelf.chain[CHAIN_APIS[apiPath]](apiArgs.map(v => v.value));
    return result;
  }

  handleAccount() {
    // todo: support config file or passed by CLI parameters
    return {
      accounts: [
        {
          name: 'aelf-command',
          address: this.address
        }
      ],
      chains: [
        {
          url: this.defaultEndpoint,
          isMainChain: true,
          chainId: 'AELF'
        }
      ]
    };
  }

  async handleInvoke(message, isReadOnly = false) {
    const params = await this.deserializeParams(message);
    const {
      endpoint = this.defaultEndpoint,
      contractAddress,
      contractMethod,
      arguments: contractArgs
    } = params;
    this.aelf.setProvider(new AElf.providers.HttpProvider(endpoint));
    const contract = await this.aelf.chain.contractAt(contractAddress, this.wallet);
    if (!contract[contractMethod]) {
      throw new Error(`No such method ${contractMethod}`);
    }
    let result;
    if (isReadOnly) {
      result = await contract[contractMethod].call(...contractArgs.map(v => v.value));
    } else {
      result = await contract[contractMethod](...contractArgs.map(v => v.value));
    }
    return result;
  }

  async handleDisconnect(message) {
    const {
      appId
    } = message;
    // just to verify client;
    // eslint-disable-next-line no-unused-vars
    const params = await this.deserializeParams(message);
    delete this.clientConfig[appId];
    return {};
  }
}

module.exports = Socket;
