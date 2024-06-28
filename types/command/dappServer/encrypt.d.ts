export default Encrypt;
declare class Encrypt {
    constructor(algorithm: any, remotePublicKey: any, random: any, cipher?: string);
    keyPair: any;
    cipher: string;
    remoteKeyPair: any;
    sharedKey: Buffer;
    derivedKey: Buffer;
    /**
     * encrypt data
     * @param {WindowBase64} data
     * @return {{encryptedResult: string, iv: string}}
     */
    encrypt(data: WindowBase64): {
        encryptedResult: string;
        iv: string;
    };
    /**
     * decrypt data
     * @param {WindowBase64} encrypted
     * @param {string} iv initial vector, hex string
     * @return {string} result, base64 string
     */
    decrypt(encrypted: WindowBase64, iv: string): string;
    /**
     * @return {string} hex string, public key
     */
    getPublicKey(): string;
}
