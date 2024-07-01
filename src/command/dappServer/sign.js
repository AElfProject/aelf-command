import elliptic from 'elliptic';

const defaultEncryptAlgorithm = 'secp256k1';
const defaultEc = elliptic.ec(defaultEncryptAlgorithm);

const keyPairs = {
  [defaultEncryptAlgorithm]: defaultEc.genKeyPair()
};

class Sign {
  /**
   * static verify
   * @param {string} algorithm ec algorithm
   * @param {string} publicKey hex string, remote dapp public key
   * @param {Buffer} msg message to be verified
   * @param {string} signature remote dapp signature
   * @return {boolean} result
   */
  static verify(algorithm, publicKey, msg, signature) {
    const remoteKeyPair = elliptic.ec(algorithm).keyFromPublic(publicKey, 'hex');
    const r = signature.slice(0, 64);
    const s = signature.slice(64, 128);
    const recoveryParam = signature.slice(128);
    const signatureObj = {
      r,
      s,
      recoveryParam
    };
    try {
      const result = remoteKeyPair.verify(msg, signatureObj);
      return result;
    } catch (e) {
      return false;
    }
  }

  constructor(algorithm, publicKey) {
    if (!keyPairs[algorithm]) {
      keyPairs[algorithm] = elliptic.ec(algorithm).genKeyPair();
    }
    this.keyPair = keyPairs[algorithm];
    this.remoteKeyPair = elliptic.ec(algorithm).keyFromPublic(publicKey, 'hex');
  }

  /**
   * sign message
   * @param {Buffer} msg message to be signed
   * @return {string} signature
   */
  sign(msg) {
    const signedMsg = this.keyPair.sign(msg);
    return [signedMsg.r.toString(16, 64), signedMsg.s.toString(16, 64), `0${signedMsg.recoveryParam.toString()}`].join('');
  }

  /**
   * verify signature
   * @param {Buffer} msg message to be verified
   * @param {string} signature hex string
   * @return {boolean} result
   */
  verify(msg, signature) {
    const r = signature.slice(0, 64);
    const s = signature.slice(64, 128);
    const recoveryParam = signature.slice(128);
    const signatureObj = {
      r,
      s,
      recoveryParam
    };
    try {
      const result = this.remoteKeyPair.verify(msg, signatureObj);
      return result;
    } catch (e) {
      return false;
    }
  }

  /**
   * Gets the public key.
   * @returns {string} The public key.
   */
  getPublicKey() {
    return this.keyPair.getPublic().encode('hex');
  }
}

export default Sign;
