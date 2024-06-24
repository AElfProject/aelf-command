/* eslint-disable max-len */
import elliptic from 'elliptic';
import Sign from '../../../src/command/dappServer/sign';

describe('Sign', () => {
  const algorithm = 'secp256k1';
  const remotePublicKey =
    '04a6eba849ac6cbd7f61df41fee59f46540b3d969da6f859d6ccbac9cdc9af94e10045b52074ba4c154dd3cc395c45b757e3e515740d67fc5e7b6215ec7cd281fb';
  const msg = Buffer.from('31373138393634323633', 'hex');
  const signature =
    'b8b201b3599ea04b196c836697d6fa42a5841cf42a6b4a22394022afed0fd41274f25b0f5520efbcc98834640abf7f83508a3a8904e992a8324ad8cc59ff3da200';
  const signInstance = new Sign(algorithm, remotePublicKey);
  afterEach(() => {
    jest.clearAllMocks();
  });
  test('should initialize correctly', () => {
    expect(signInstance).toHaveProperty('keyPair');
    expect(signInstance).toHaveProperty('remoteKeyPair');
  });

  test('should verify data correctly', () => {
    const result = Sign.verify(algorithm, remotePublicKey, msg, signature);
    expect(result).toEqual(true);
  });
  test('should sign msg correctly', () => {
    const data = Buffer.from('4811b3d9e39b4214af728436159f7387', 'hex');
    const result = signInstance.sign(data);
    expect(result.length).toBe(130);
  });
  test('should verify msg in fixed algorithm and publicKey', () => {
    const msg = Buffer.from('25374225323274696d657374616d7025323225334131373138393635333132253744', 'hex');
    const signature =
      '8904880db5ecb7bc4b5b09046cb359dbc78c9cf507f5445244b24bdcec7def1599393bf98ad27178c6052a6e2b95d4393dceac7420e776544797f5e2f74d7ac800';
    const result = signInstance.verify(msg, signature);
    expect(result).toBe(true);
  });
  test('should return correct public key', () => {
    const result = signInstance.getPublicKey();
    expect(result.length).toBe(130);
  });

  test(`should initialize with not default algorithm`, () => {
    // another algorithm
    const signInstanceNotDefault = new Sign('curve25519', '75d5e81323eecc4e887ef0934a52d8de1a2785ca04f4a4e9a39359c4bfd8cc9d');
    expect(signInstance).toHaveProperty('keyPair');
    expect(signInstance).toHaveProperty('remoteKeyPair');
  });
});
