import { createHmac } from 'crypto';

class HKDF {
  /**
   * @param {string} hash
   * @param {Buffer} salt
   * @param {string} initialKey
   */
  constructor(hash, salt, initialKey) {
    if (!HKDF.hashList[hash]) {
      throw new Error('not supported hash method');
    }
    this.hashMethod = hash;
    this.hashLength = HKDF.hashList[hash];
    this.salt = salt;
    this.initialKey = initialKey;
    const hmac = createHmac(hash, this.salt);
    hmac.update(this.initialKey);
    this.prk = hmac.digest();
  }

  /**
   * Expands the pseudorandom key to the desired length.
   * @param {string} [info] - Optional context and application-specific information.
   * @param {number} [size] - The length of the output keying material in bytes.
   * @returns {Buffer} - The expanded keying material.
   */
  expand(info = '', size = 32) {
    /** @type {string | Buffer} */
    let pre = '';
    const output = [];
    const numBlocks = Math.ceil(size / this.hashLength);
    for (let i = 0; i < numBlocks; i++) {
      const hmac = createHmac(this.hashMethod, this.prk);
      hmac.update(pre);
      hmac.update(info);
      hmac.update(Buffer.alloc(1, i + 1));
      pre = hmac.digest();
      output.push(pre);
    }
    return Buffer.concat(output, size);
  }
}
/**
 * A static property that maps hash algorithm names to their output lengths in bytes.
 * @type {{ [key: string]: number }}
 */
HKDF.hashList = {
  sha256: 32,
  sha224: 54,
  sha512: 64
};

export default HKDF;
