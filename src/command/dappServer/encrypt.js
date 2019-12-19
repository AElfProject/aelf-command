/**
 * @file encrypt channel
 * @author atom-yang
 */
const Crypto = require('crypto');
const elliptic = require('elliptic');
const {
  randomId
} = require('../../utils/utils');
const HKDF = require('./HKDF');

const defaultEncryptAlgorithm = 'curve25519';
const defaultCipher = 'aes-256-cbc';
const defaultEc = elliptic.ec(defaultEncryptAlgorithm);

const keyPairs = {
  [defaultEncryptAlgorithm]: defaultEc.genKeyPair()
};

class Encrypt {
  constructor(algorithm, remotePublicKey, random, cipher = defaultCipher) {
    if (!keyPairs[algorithm]) {
      keyPairs[algorithm] = elliptic.ec(algorithm).genKeyPair();
    }
    this.keyPair = keyPairs[algorithm];
    this.cipher = cipher;
    this.remoteKeyPair = elliptic.ec(algorithm).keyFromPublic(remotePublicKey, 'hex');
    this.sharedKey = Buffer.from(this.keyPair.derive(this.remoteKeyPair.getPublic()).toString('hex'), 'hex');
    const hkdf = new HKDF('sha256', Buffer.from(random, 'hex'), this.sharedKey.toString('hex'));
    this.derivedKey = hkdf.expand();
  }

  /**
   * encrypt data
   * @param {WindowBase64} data
   * @return {{encryptedResult: string, iv: string}}
   */
  encrypt(data) {
    const iv = randomId();
    const cipher = Crypto.createCipheriv(this.cipher, this.derivedKey, Buffer.from(iv, 'hex'));
    let encrypted = cipher.update(Buffer.from(data, 'base64'), null, 'base64');
    encrypted += cipher.final('base64');
    return {
      encryptedResult: encrypted,
      iv
    };
  }

  /**
   * decrypt data
   * @param {WindowBase64} encrypted
   * @param {string} iv initial vector, hex string
   * @return {string} result, base64 string
   */
  decrypt(encrypted, iv) {
    const decipher = Crypto.createDecipheriv(this.cipher, this.derivedKey, Buffer.from(iv, 'hex'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encrypted, 'base64')),
      decipher.final()
    ]).toString('base64');
    return decrypted;
  }

  /**
   * @return {string} hex string, public key
   */
  getPublicKey() {
    return this.keyPair.getPublic('hex');
  }
}

module.exports = Encrypt;
