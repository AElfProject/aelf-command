export default Sign;
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
    constructor(algorithm: any, publicKey: any);
    keyPair: any;
    remoteKeyPair: any;
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
    getPublicKey(): any;
}
