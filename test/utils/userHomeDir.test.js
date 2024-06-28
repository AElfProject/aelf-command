import path from 'path';
import { homedir } from 'os';
import { userHomeDir, home, isFakeRoot, isRootUser, ROOT_USER } from '../../src/utils/userHomeDir';

jest.mock('os', () => ({
  homedir: jest.fn(() => {
    const mockHomeDir = '/mock/home';
    return mockHomeDir;
  })
}));
describe('userHomeDir', () => {
  let originalPlatform;
  let originalEnv;
  const mockHomeDir = '/mock/home';
  beforeAll(() => {
    originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
    originalEnv = { ...process.env };
  });

  afterAll(() => {
    Object.defineProperty(process, 'platform', originalPlatform);
    process.env = originalEnv;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  test('home should be the user home directory', () => {
    expect(home).toBe(mockHomeDir);
  });

  test('isFakeRoot should return true if FAKEROOTKEY is set', () => {
    process.env.FAKEROOTKEY = 'true';
    expect(isFakeRoot()).toBe(true);
  });

  test('isFakeRoot should return false if FAKEROOTKEY is not set', () => {
    delete process.env.FAKEROOTKEY;
    expect(isFakeRoot()).toBe(false);
  });

  test('isRootUser should return true if uid is 0', () => {
    expect(isRootUser(0)).toBe(true);
  });

  test('isRootUser should return false if uid is not 0', () => {
    expect(isRootUser(1000)).toBe(false);
  });

  test('isWindows should return true if platform is win32', () => {
    Object.defineProperty(process, 'platform', {
      value: 'win32'
    });
    expect(process.platform).toBe('win32');
  });

  test('isWindows should return false if platform is not win32', () => {
    Object.defineProperty(process, 'platform', {
      value: 'linux'
    });
    expect(process.platform).toBe('linux');
  });

  test('userHomeDir should be correct for Windows platform', () => {
    Object.defineProperty(process, 'platform', {
      value: 'win32'
    });

    jest.resetModules();
    const { userHomeDir } = require('../../src/utils/userHomeDir');
    expect(userHomeDir).toBe(path.resolve(mockHomeDir, './AppData/Local'));
  });

  test('userHomeDir should be correct for non-Windows platform', () => {
    Object.defineProperty(process, 'platform', {
      value: 'linux'
    });

    jest.resetModules();
    const { userHomeDir } = require('../../src/utils/userHomeDir');
    expect(userHomeDir).toBe(path.resolve(mockHomeDir, './.local/share'));
  });

  test('ROOT_USER should be true if user is root and not fake root', () => {
    jest.spyOn(process, 'getuid').mockReturnValue(0);
    delete process.env.FAKEROOTKEY;

    jest.resetModules();
    const { ROOT_USER } = require('../../src/utils/userHomeDir');
    expect(ROOT_USER).toBe(true);
  });

  test('ROOT_USER should be false if user is not root', () => {
    jest.spyOn(process, 'getuid').mockReturnValue(1000);

    jest.resetModules();
    const { ROOT_USER } = require('../../src/utils/userHomeDir');
    expect(ROOT_USER).toBe(false);
  });

  test('ROOT_USER should be false if user is root but is fake root', () => {
    jest.spyOn(process, 'getuid').mockReturnValue(0);
    process.env.FAKEROOTKEY = 'true';

    jest.resetModules();
    const { ROOT_USER } = require('../../src/utils/userHomeDir');
    expect(ROOT_USER).toBe(false);
  });
});
