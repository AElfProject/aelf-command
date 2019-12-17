/**
 * @file socket server
 * @author atom-yang
 */
const Server = require('socket.io');
const AElf = require('aelf-sdk');
const Schema = require('async-validator/dist-node/index').default;
const Sign = require('./sign');
const Encrypt = require('./encrypt');
const { logger } = require('../../utils/myLogger');
const {
  randomId
} = require('../../utils/utils');
const {
  serializeMessage,
  deserializeMessage,
  checkTimestamp
} = require('./utils');
const {
  CHAIN_APIS
} = require('./constants');

const signRequestRules = {
  id: {
    required: true,
    type: 'string',
    min: 32
  },
  appId: {
    required: true,
    type: 'string',
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
        type: 'string',
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
    type: 'object',
    required: true,
    fields: {
      iv: {
        type: 'string',
        required: true
      },
      encryptedParams: {
        type: 'string',
        required: true
      }
    }
  }
};

const connectSignRules = {
  ...signRequestRules,
  params: {
    type: 'object',
    required: true,
    fields: {
      encryptAlgorithm: {
        type: 'enum',
        enum: ['secp256k1'],
        required: true
      },
      timestamp: {
        type: 'number',
        required: true
      },
      publicKey: {
        type: 'string',
        required: true
      },
      signature: {
        type: 'string',
        required: true,
        min: 129,
        max: 130
      }
    }
  }
};

const connectEncryptRules = {
  ...signRequestRules,
  params: {
    type: 'object',
    required: true,
    fields: {
      encryptAlgorithm: {
        type: 'enum',
        enum: ['curve25519'],
        required: true
      },
      cipher: {
        type: 'string',
        required: true
      },
      publicKey: {
        type: 'string',
        required: true
      }
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
    this.handleConnection = this.handleConnection.bind(this);
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
    if (errors && (errors instanceof Error || (Array.isArray(errors) && errors.length > 0) || errors.Error)) {
      return {
        id,
        result: {
          error: Array.isArray(errors) ? errors : [errors.Error ? errors.Error : errors],
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
        error: [],
        data: result
      }
    };
  }

  send(client, result, action, appId) {
    client.emit('bridge', result);
    if (action === 'disconnect') {
      delete this.clientConfig[appId];
      client.disconnect(true);
    }
  }

  handleConnection(client) {
    client.on('bridge', async data => {
      logger.info('Message received');
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
            result = await this.handleAccount(data);
            break;
          case 'invoke':
          case 'invokeRead':
            result = await this.handleInvoke(data, action === 'invokeRead');
            break;
          case 'disconnect':
            result = await this.handleDisconnect(data);
            break;
          case null:
          case undefined:
          case '':
            throw new Error('You should set a action name');
          default:
            throw new Error(`${action} is not supported`);
        }
        result = this.responseFormat(id, result, null);
        if (action !== 'connect') {
          result.result = this.serializeResult(appId, result.result);
        }
        this.send(client, result, action, appId);
      } catch (e) {
        console.log(e);
        result = this.responseFormat(id, {}, e.errors ? e.errors : e);
        if (action !== 'connect') {
          result.result = this.serializeResult(appId, result.result);
        }
        this.send(client, result, action, appId);
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
      await signRequestValidator.validate(request);
      const {
        signature,
        originalParams
      } = params;
      const isValid = this.clientConfig[appId].encrypt.verify(Buffer.from(originalParams, 'base64'), signature);
      if (!isValid) {
        throw new Error('Signature is not valid');
      }
      const deserializeParams = deserializeMessage(originalParams);
      if (checkTimestamp(deserializeParams.timestamp)) {
        return deserializeParams;
      }
      throw new Error('Timestamp is not valid');
    }
    await encryptRequestValidator.validate(request);
    const {
      iv,
      encryptedParams
    } = params;
    const originalParams = this.clientConfig[appId].encrypt.decrypt(encryptedParams, iv);
    const deserializeParams = deserializeMessage(originalParams);
    console.log(deserializeParams);
    if (checkTimestamp(deserializeParams.timestamp)) {
      return deserializeParams;
    }
    throw new Error('Timestamp is not valid');
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
        cipher
      } = params;
      const random = randomId();
      const encrypt = new Encrypt(encryptAlgorithm, publicKey, random, cipher);
      this.clientConfig = {
        ...this.clientConfig,
        [appId]: {
          encryptWay: 'encrypt',
          encrypt
        }
      };
      logger.info(`App ${appId} has connected successfully in message encrypted way`);
      return {
        publicKey: encrypt.getPublicKey(),
        random
      };
    }
    if (params.signature) {
      await connectSignValidator.validate(message);
      const {
        timestamp,
        signature
      } = params;
      const result = Sign.verify(encryptAlgorithm, publicKey, Buffer.from(String(timestamp)), signature);
      if (!result) {
        throw new Error('Not a valid signature');
      }
      if (!checkTimestamp(timestamp)) {
        throw new Error('Timestamp is not valid');
      }
      this.clientConfig = {
        ...this.clientConfig,
        [appId]: {
          encryptWay: 'sign',
          encrypt: new Sign(encryptAlgorithm, publicKey)
        }
      };
      const responseRandom = randomId();
      const responseSignature = this.clientConfig[appId].encrypt.sign(Buffer.from(responseRandom, 'hex'));
      const responsePublicKey = this.clientConfig[appId].encrypt.getPublicKey();
      logger.info(`App ${appId} has connected successfully in message signed way`);
      return {
        publicKey: responsePublicKey,
        random: responseRandom,
        signature: responseSignature
      };
    }
    logger.error('Not support encrypt method or not enough params');
    throw new Error('Not support encrypt method or not enough params');
  }

  async handleApi(message) {
    const params = await this.deserializeParams(message);
    const {
      endpoint = this.defaultEndpoint,
      apiPath,
      arguments: apiArgs
    } = params;
    logger.info(`Querying api ${apiPath}...`);
    if (!CHAIN_APIS[apiPath]) {
      throw new Error(`Not support api ${apiPath}`);
    }
    this.aelf.setProvider(new AElf.providers.HttpProvider(endpoint || this.defaultEndpoint));
    const result = await this.aelf.chain[CHAIN_APIS[apiPath]](apiArgs.map(v => v.value));
    return result;
  }

  async handleAccount(message) {
    logger.info('Querying account information');
    await this.deserializeParams(message);
    // todo: support config file or passed by CLI parameters
    return {
      accounts: [
        {
          name: 'aelf-command',
          address: this.address,
          publicKey: this.wallet.keyPair.getPublic('hex')
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
    logger.info(`${isReadOnly ? 'Calling' : 'Sending'} contract ${contractAddress} method ${contractMethod}...`);
    this.aelf.setProvider(new AElf.providers.HttpProvider(endpoint || this.defaultEndpoint));
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
    // just to verify client
    // eslint-disable-next-line no-unused-vars
    const params = await this.deserializeParams(message);
    logger.info(`App ${message.appId} disconnected`);
    return {};
  }
}

module.exports = Socket;
