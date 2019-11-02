/**
 * @file encrypt channel
 * @author atom-yang
 */
const Crypto = require('crypto');
const elliptic = require('elliptic');
const {
  randomId
} = require('../../utils/utils');

const defaultEncryptAlgorithm = 'curve25519';
const defaultCipher = 'aes-256-cbc';
const defaultEc = elliptic.ec(defaultEncryptAlgorithm);

const keyPairs = {
  [defaultEncryptAlgorithm]: defaultEc.genKeyPair()
};

class Encrypt {
  constructor(algorithm, remotePublicKey, cipher = defaultCipher) {
    if (!keyPairs[algorithm]) {
      keyPairs[algorithm] = elliptic.ec(algorithm).genKeyPair();
    }
    this.keyPair = keyPairs[algorithm];
    this.cipher = cipher;
    this.remoteKeyPair = elliptic.ec(algorithm).keyFromPublic(remotePublicKey, 'hex');
    this.sharedKey = this.keyPair.derive(this.remoteKeyPair.getPublic()).toString('hex');
  }

  encrypt(data) {
    const iv = randomId();
    const cipher = Crypto.createCipheriv(this.cipher, this.sharedKey.slice(0, 32), Buffer.from(iv, 'hex'));
    let encrypted = cipher.update(Buffer.from(data, 'base64'), null, 'base64');
    encrypted += cipher.final('base64');
    return {
      encrypted,
      iv
    };
  }

  decrypt(encrypted, iv) {
    const decipher = Crypto.createDecipheriv(this.cipher, this.sharedKey.slice(0, 32), Buffer.from(iv, 'hex'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encrypted, 'base64')),
      decipher.final()
    ]).toString('base64');
    return decrypted;
  }

  getPublicKey() {
    return this.keyPair.getPublic('hex');
  }
}

module.exports = Encrypt;
