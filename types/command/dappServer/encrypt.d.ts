import { ec } from 'elliptic';

declare class Encrypt {
  constructor(algorithm: string, remotePublicKey: string, random: string, cipher?: string);
  private keyPair: ec.KeyPair;
  private cipher: string;
  private remoteKeyPair: ec.KeyPair;
  private sharedKey: Buffer;
  private derivedKey: Buffer;

  encrypt(data: string): { encryptedResult: string; iv: string };

  decrypt(encrypted: string, iv: string): string;

  getPublicKey(): string;
}
export default Encrypt;
