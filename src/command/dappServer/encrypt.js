import Crypto from 'crypto';
import elliptic from 'elliptic';
import { randomId } from '../../utils/utils.js';
import HKDF from './HKDF.js';

const defaultEncryptAlgorithm = 'curve25519';
const defaultCipher = 'aes-256-cbc';
const defaultEc = elliptic.ec(defaultEncryptAlgorithm);

const keyPairs = {
  [defaultEncryptAlgorithm]: defaultEc.genKeyPair()
};

class Encrypt {
  /**
   * Creates an instance of Encrypt.
   * @param {string} algorithm - The algorithm to use for encryption.
   * @param {string} remotePublicKey - The public key of the remote party.
   * @param {string} random - A random string used for key generation.
   * @param {string} [cipher] - The cipher to use for encryption (optional).
   */
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
   * Encrypts data using the specified algorithm and shared key.
   * @param {string} data - The data to encrypt.
   * @returns {{ encryptedResult: string, iv: string }} - The encrypted data and initialization vector.
   */
  encrypt(data) {
    const iv = randomId();
    const cipher = Crypto.createCipheriv(this.cipher, this.derivedKey, Buffer.from(iv, 'hex'));
    let encrypted = cipher.update(Buffer.from(data, 'base64'), undefined, 'base64');
    encrypted += cipher.final('base64');
    return {
      encryptedResult: encrypted,
      iv
    };
  }

  /**
   * Decrypts data using the specified algorithm and shared key.
   * @param {string} encrypted - The encrypted data to decrypt.
   * @param {string} iv - The initialization vector used during encryption.
   * @returns {string} - The decrypted data.
   */
  decrypt(encrypted, iv) {
    const decipher = Crypto.createDecipheriv(this.cipher, this.derivedKey, Buffer.from(iv, 'hex'));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(encrypted, 'base64')), decipher.final()]).toString('base64');
    return decrypted;
  }

  /**
   * Gets the public key of the key pair.
   * @returns {string} - The public key in hexadecimal format.
   */
  getPublicKey() {
    return this.keyPair.getPublic('hex');
  }
}

export default Encrypt;
