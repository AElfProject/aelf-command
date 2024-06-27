/* eslint-disable max-len */
import elliptic from 'elliptic';
import Encrypt from '../../../src/command/dappServer/encrypt';
import { randomId } from '../../../src/utils/utils.js';

jest.mock('../../../src/utils/utils.js', () => {
  return {
    randomId: () => '1ef39a09ce4f415da335dcb408989116'
  };
});

describe('Encrypt', () => {
  const algorithm = 'curve25519';
  const remotePublicKey = '75d5e81323eecc4e887ef0934a52d8de1a2785ca04f4a4e9a39359c4bfd8cc9d';
  const random = 'e44ab14618724a80be03f4565e7ed668';
  const ecInstance = new Encrypt(algorithm, remotePublicKey, random);
  const data =
    'JTdCJTIyY29kZSUyMiUzQTAlMkMlMjJtc2clMjIlM0ElMjJzdWNjZXNzJTIyJTJDJTIyZXJyb3IlMjIlM0ElNUIlNUQlMkMlMjJkYXRhJTIyJTNBJTdCJTIyYWNjb3VudHMlMjIlM0ElNUIlN0IlMjJuYW1lJTIyJTNBJTIyYWVsZi1jb21tYW5kJTIyJTJDJTIyYWRkcmVzcyUyMiUzQSUyMkd5UVg2dDE4a3B3YUQ5WEhYZTFUb0t4Zm92OG1TZVRMRTlxOU53VUFlVEU4dFVMWmslMjIlMkMlMjJwdWJsaWNLZXklMjIlM0ElMjIwNDcwM2JiZTk1ZTk4NmM5ZDkwMWYyOGVkZDYwOTc1YTdhNmMzYjJkY2U0MWRmZWMyZTc5ODNkMjkzYzYwMGU4MjQ5NjQyYTNkYTM3OWM0MTk0YTZkNjJiZDg5YWZlNjc1M2U4MWFjZmMyYjZiYmYzYjQwNzM2ZWUwOTQ5MTAyMDcxJTIyJTdEJTVEJTJDJTIyY2hhaW5zJTIyJTNBJTVCJTdCJTIydXJsJTIyJTNBJTIyaHR0cHMlM0ElMkYlMkZ0ZHZ3LXRlc3Qtbm9kZS5hZWxmLmlvJTJGJTIyJTJDJTIyaXNNYWluQ2hhaW4lMjIlM0F0cnVlJTJDJTIyY2hhaW5JZCUyMiUzQSUyMkFFTEYlMjIlN0QlNUQlN0QlN0Q=';
  const encrypted =
    'U5E3LMWOVAintuE4zJf+8O4XSHgAtZTeQX831sc53r9yZJGnh6fiwNR3tF8zCORnwtVUaYh+pnzPgxeQz8b1tKEUhc/VYoy2dtqMubMDq+WUeF5tFnFhv6kuhHkMSDYQnpwOpwSvzJ4kWr+cxdHGOg+qoWe1nPujQlc/gQ/7Z4MeEHWXDagtKXzKGfE/rYJhnlAN+K1xHhq//tS4g4izEuHe2J2RK5xYa91e5p1qzLTEQyqax2q1pyYFPbaRyrP/6yAlUPOkdyuIGdMXwEp7BdfPXF3xPemaj6w+WgOkmAUcKk35blQvNLuJAWux6ZhLl+P+w6sfinT3Mk1ymrz2SEdThjB/LEPbbBlx+in80y0S8bSgUpsXbW1mfMPX3svDks0cK3Thjf/o+sGed5Ej4cFMFbgeCI4JdDnKeG7RWPWN9lL77kzPq0q60zXr/70jyRElktzSWzGfcOEr+TQiEx3MfiRHgAoqz5glc/ml7VlUP9ouLvRQfmrWcYIsbkf9WnBac/G68rSGOEqR/qbugsQCclO+V6yJt3o4NL94Nbn8V/+gQo430zdefkljGum84c0e2vVYxXyRbrFIAROJeO4IRiVWAaLrnFc0h/Shtt8EupaWGYJps+aYODUpfulJjDm6pZoDE+bp5h02XV0C/akhIUclLveNJc14qYc7tGpSRBDNXC/z6PfZgPlV3OL+';
  const iv = '1ef39a09ce4f415da335dcb408989116';
  afterEach(() => {
    jest.clearAllMocks();
  });
  test('should initialize correctly', () => {
    expect(ecInstance).toHaveProperty('keyPair');
    expect(ecInstance).toHaveProperty('cipher');
    expect(ecInstance).toHaveProperty('remoteKeyPair');
    expect(ecInstance).toHaveProperty('sharedKey');
    expect(ecInstance).toHaveProperty('derivedKey');
  });

  test('should ecInstance data correctly', () => {
    // mock
    ecInstance.sharedKey = Buffer.from('7f8e6db3591d76846d8b6ffefe5e0a19f85feee2cb5d41131dac2b9a668b41ca', 'hex');
    ecInstance.derivedKey = Buffer.from('0369788fa050c720131722efb25281f444857db4b833ea89ede08a8fdf6117c0', 'hex');
    const result = ecInstance.encrypt(data);
    expect(result).toEqual({
      encryptedResult: encrypted,
      iv
    });
  });
  test('should decrypt data correctly', () => {
    const decrypt = ecInstance.decrypt(encrypted, iv);
    expect(decrypt).toBe(data);
  });
  test('should return correct public key', () => {
    const result = ecInstance.getPublicKey();
    expect(result.length).toBe(64);
  });

  test(`should initialize with not default algorithm`, () => {
    // another algorithm
    const ecInstanceNotDefault = new Encrypt(
      'secp256k1',
      '04695fb2e8ce837d5b9e79df046dd1947a558b884165c8f83a9e9b01e47a37135fc4ff42256e4a79f25f740a840b58f47f79a3bf934857c7397e545163cddf663e',
      'beae60451b554891bb8967d0c2bdaa4e'
    );
    expect(ecInstance).toHaveProperty('keyPair');
    expect(ecInstance).toHaveProperty('cipher');
    expect(ecInstance).toHaveProperty('remoteKeyPair');
    expect(ecInstance).toHaveProperty('sharedKey');
    expect(ecInstance).toHaveProperty('derivedKey');
  });
});
