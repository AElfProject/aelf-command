import HKDF from '../../../src/command/dappServer/HKDF';

describe('HKDF', () => {
  const hash = 'sha256';
  const random = '52695e07c0c545e8a279a71b1f47b9b7';
  const salt = Buffer.from(random, 'hex');
  console.log(salt, 'salt');
  const initialKey = '667a8937f4da939b93e716211e83f787741be3fe0c938bea9e333d37c779b5';
  afterEach(() => {
    jest.clearAllMocks();
  });
  test('should initialize with correct values', () => {
    const hkdf = new HKDF(hash, salt, initialKey);
    expect(hkdf.hashMethod).toBe(hash);
    expect(hkdf.hashLength).toBe(32);
    expect(hkdf.salt).toBe(salt);
    expect(hkdf.initialKey).toBe(initialKey);
    console.log(hkdf.prk, 'hkdf.prk');
    expect(hkdf.prk.toString('hex')).toEqual('6269eb093d3ed47cd698158c8f404b6380cd3222f3889323ea7814ea341456f2');
  });
  test('should throw an error for unsupported hash method', () => {
    expect(() => new HKDF('sha1', Buffer.from('salt'), 'initialKey')).toThrow('not supported hash method');
  });
  test('should expand correctly', () => {
    const hkdf = new HKDF(hash, salt, initialKey);
    const result = hkdf.expand();
    expect(result.toString('hex')).toBe('50649277a8ec2090de2c15af4aab197a7baa3c09accb755d3fafa829c370ba62');
  });
});
