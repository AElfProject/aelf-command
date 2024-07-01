import { ec } from 'elliptic';
declare class Sign {
  static verify(algorithm: string, publicKey: string, msg: Buffer, signature: string): boolean;
  constructor(algorithm: string, publicKey: string);
  keyPair: ec.KeyPair;
  remoteKeyPair: ec.KeyPair;
  sign(msg: Buffer): string;
  verify(msg: Buffer, signature: string): boolean;
  getPublicKey(): string;
}
export default Sign;
