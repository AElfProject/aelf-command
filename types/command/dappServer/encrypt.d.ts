import { ec } from 'elliptic';

class Encrypt {
  constructor(algorithm: string, remotePublicKey: string, random: string, cipher?: string);
  private keyPair: ec.KeyPair;
  private cipher: string;
  private remoteKeyPair: ec.KeyPair;
  private sharedKey: Buffer;
  private derivedKey: Buffer;

  /**
   * Encrypts the given data.
   * @param data - The data to be encrypted, base64 string.
   * @returns An object containing the encrypted result and the initialization vector (iv).
   */
  encrypt(data: string): { encryptedResult: string; iv: string };

  /**
   * Decrypts the given data.
   * @param encrypted - The encrypted data, base64 string.
   * @param iv - The initialization vector, hex string.
   * @returns The decrypted data, base64 string.
   */
  decrypt(encrypted: string, iv: string): string;

  /**
   * Gets the public key.
   * @returns The public key in hex string format.
   */
  getPublicKey(): string;
}
export default Encrypt;
