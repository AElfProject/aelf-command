export default HKDF;
declare class HKDF {
    /**
     * @param {string} hash
     * @param {Buffer} salt
     * @param {string} initialKey
     */
    constructor(hash: string, salt: Buffer, initialKey: string);
    hashMethod: string;
    hashLength: any;
    salt: Buffer;
    initialKey: string;
    prk: Buffer;
    expand(info?: string, size?: number): Buffer;
}
declare namespace HKDF {
    namespace hashList {
        let sha256: number;
        let sha224: number;
        let sha512: number;
    }
}
