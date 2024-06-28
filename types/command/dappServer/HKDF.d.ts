class HKDF {
  constructor(hash: string, salt: Buffer, initialKey: string);
  private hashMethod: string;
  private hashLength: number;
  private salt: Buffer;
  private initialKey: string;
  private prk: Buffer;
  expand(info?: string, size?: number): Buffer;
  static hashList: { [key: string]: number };
}
export default HKDF;
