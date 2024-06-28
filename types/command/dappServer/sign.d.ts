import { ec } from 'elliptic';
declare class Sign {
  /**
   * static verify
   * @param {string} algorithm ec algorithm
   * @param {string} publicKey hex string, remote dapp public key
   * @param {Buffer} msg message to be verified
   * @param {string} signature remote dapp signature
   * @return {boolean} result
   */
  static verify(algorithm: string, publicKey: string, msg: Buffer, signature: string): boolean;
  constructor(algorithm: string, publicKey: string);
  keyPair: ec.KeyPair;
  remoteKeyPair: ec.KeyPair;
  /**
   * sign message
   * @param {Buffer} msg message to be signed
   * @return {string} signature
   */
  sign(msg: Buffer): string;
  /**
   * verify signature
   * @param {Buffer} msg message to be verified
   * @param {string} signature hex string
   * @return {boolean} result
   */
  verify(msg: Buffer, signature: string): boolean;
  getPublicKey(): string;
}
export default Sign;
