import { Server } from 'socket.io';
import AElf from 'aelf-sdk';
import { interopImportCJSDefault } from 'node-cjs-interop';
import asyncValidator from 'async-validator';
const Schema = interopImportCJSDefault(asyncValidator);
import Sign from './sign.js';
import Encrypt from './encrypt.js';
import { logger } from '../../utils/myLogger.js';
import { randomId } from '../../utils/utils.js';
import { serializeMessage, deserializeMessage, checkTimestamp } from './utils.js';
import { CHAIN_APIS } from './constants.js';

/**
 * @typedef {import ('async-validator').Rules} Rules
 */
/** @type {Rules} */
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
/** @type {Rules} */
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
/** @type {Rules} */
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
/** @type {Rules} */
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

/**
 * Represents the result of an operation.
 * @typedef {Object} Result
 * @property {number} code - The status code of the result.
 * @property {string} msg - The message associated with the result.
 * @property {any[]} error - An array of errors, if any.
 * @property {any} data - The data returned by the operation.
 */

/**
 * Represents a client connected to the server.
 * @typedef {Object} Client
 * @property {function(string, any): void} emit - Sends an event to the client.
 * @property {function(boolean=): void} disconnect - Disconnects the client.
 * @property {function(string, function): void} on - Sends an event to the client.
 */

/**
 * Represents a message sent to the server.
 * @typedef {Object} Message
 * @property {string} id - The unique identifier for the message.
 * @property {string} appId - The application ID sending the message.
 * @property {string} action - The action to be performed.
 * @property {any} params - The parameters for the action.
 */
class Socket {
  /**
   * Creates an instance of Socket.
   * @param {Object} options - The socket options.
   * @param {number} options.port - The port to run the socket server.
   * @param {string} options.endpoint - The default endpoint for the socket server.
   * @param {any} options.aelf - The AElf instance.
   * @param {any} options.wallet - The wallet instance.
   * @param {string} options.address - The address associated with the wallet.
   */
  constructor(options) {
    const { port, endpoint, aelf, wallet, address } = options;
    this.aelf = aelf;
    this.defaultEndpoint = endpoint;
    this.wallet = wallet;
    this.address = address;
    this.handleConnection = this.handleConnection.bind(this);
    this.socket = new Server(port, {
      transports: ['websocket']
    });
    // @ts-ignore
    this.socket.on('connection', this.handleConnection);
    this.clientConfig = {
      // default: {
      //   encryptWay: 'sign', // or 'encrypt'
      //   encrypt: new Sign()
      // }
    };
  }
  /**
   * Formats the response.
   * @param {string} id - The request ID.
   * @param {any} [result] - The result data.
   * @param {any} [errors] - The errors array.
   * @returns {{id: string, result: Result}} The formatted result.
   */
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
  /**
   * Sends a response to the client.
   * @param {Client} client - The client instance.
   * @param {Result} result - The result object.
   * @param {string} action - The action type.
   * @param {string} appId - The application ID.
   */
  send(client, result, action, appId) {
    client.emit('bridge', result);
    if (action === 'disconnect') {
      delete this.clientConfig[appId];
      client.disconnect(true);
    }
  }
  /**
   * Handles new client connections.
   * @param {Client} client - The client instance.
   */
  handleConnection(client) {
    client.on('bridge', async data => {
      logger.info('Message received');
      /**@type {any} */
      let result = {};
      const { action, id, appId } = data;
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
          case 'getContractMethods':
            result = await this.handleMethodList(data);
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
        // @ts-ignore
        logger.error('error happened');
        // @ts-ignore
        logger.error(e);
        result = this.responseFormat(id, {}, e.errors ? e.errors : e);
        if (action !== 'connect') {
          result.result = this.serializeResult(appId, result.result);
        }
        this.send(client, result, action, appId);
      }
    });
  }
  /**
   * Deserializes request parameters.
   * @param {Message} request - The request message.
   * @returns {Promise<any>} The deserialized parameters.
   */
  async deserializeParams(request) {
    const { appId, params } = request;
    if (!this.clientConfig[appId]) {
      throw new Error(`AppId ${appId} has not connected`);
    }
    if (this.clientConfig[appId].encryptWay === 'sign') {
      await signRequestValidator.validate(request);
      const { signature, originalParams } = params;
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
    const { iv, encryptedParams } = params;
    const originalParams = this.clientConfig[appId].encrypt.decrypt(encryptedParams, iv);
    const deserializeParams = deserializeMessage(originalParams);
    if (checkTimestamp(deserializeParams.timestamp)) {
      return deserializeParams;
    }
    throw new Error('Timestamp is not valid');
  }

  serializeResult(appId, result) {
    // delete next line as function deserializeParams already has the logic
    // if (!this.clientConfig[appId]) {
    //   throw new Error(`AppId ${appId} has not connected`);
    // }
    if (this.clientConfig[appId]?.encryptWay === 'sign') {
      const originalResult = serializeMessage(result);
      const signature = this.clientConfig[appId].encrypt.sign(Buffer.from(originalResult, 'base64'));
      return {
        signature,
        originalResult
      };
    }
    const originalResult = serializeMessage(result);
    return this.clientConfig[appId]?.encrypt.encrypt(originalResult);
  }
  /**
   * Handles connect actions.
   * @param {Message} message - The message object.
   * @returns {Promise<any>} The result of the connect action.
   */
  async handleConnect(message) {
    const { appId, params } = message;
    const { encryptAlgorithm, publicKey } = params;
    if (params.cipher) {
      await connectEncryptValidator.validate(message);
      const { cipher } = params;
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
      const { timestamp, signature } = params;
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
    // @ts-ignore
    logger.error('Not support encrypt method or not enough params');
    throw new Error('Not support encrypt method or not enough params');
  }
  /**
   * Handles method list requests.
   * @param {Message} message - The message object.
   * @returns {Promise<string[]>} The list of methods.
   */
  async handleMethodList(message) {
    const params = await this.deserializeParams(message);
    const { endpoint = this.defaultEndpoint, address } = params;
    this.aelf.setProvider(new AElf.providers.HttpProvider(endpoint || this.defaultEndpoint));
    const contract = await this.aelf.chain.contractAt(address, this.wallet);
    return Object.keys(contract)
      .filter(v => /^[A-Z]/.test(v))
      .sort();
  }
  /**
   * Handles API requests.
   * @param {Message} message - The message object.
   * @returns {Promise<any>} The API result.
   */
  async handleApi(message) {
    const params = await this.deserializeParams(message);
    const { endpoint = this.defaultEndpoint, apiPath, arguments: apiArgs, methodName } = params;
    logger.info(`Querying api ${apiPath}...`);
    if (!CHAIN_APIS[apiPath]) {
      throw new Error(`Not support api ${apiPath}`);
    }
    this.aelf.setProvider(new AElf.providers.HttpProvider(endpoint || this.defaultEndpoint));
    const result = await this.aelf.chain[methodName](...apiArgs.map(v => v.value));
    return result;
  }
  /**
   * Handles account actions.
   * @param {Message} message - The message object.
   * @returns {Promise<any>} The account result.
   */
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
  /**
   * Handles invoke actions.
   * @param {Message} message - The message object.
   * @param {boolean} isReadOnly - If the invoke action is read-only.
   * @returns {Promise<any>} The invoke result.
   */
  async handleInvoke(message, isReadOnly) {
    const params = await this.deserializeParams(message);
    const { endpoint = this.defaultEndpoint, contractAddress, contractMethod, arguments: contractArgs } = params;
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

  /**
   * Handles disconnect actions.
   * @param {Message} message - The message object.
   * @returns {Promise<{}>} The result of the disconnect action.
   */
  async handleDisconnect(message) {
    // just to verify client
    await this.deserializeParams(message);
    logger.info(`App ${message.appId} disconnected`);
    return {};
  }
}

export default Socket;
