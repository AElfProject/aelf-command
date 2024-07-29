import { run as aelfCommandRun } from '../src/index.js';
import path from 'path';
import check from 'check-node-version';
import updateNotifier from 'update-notifier';
import { logger } from '../src/utils/myLogger.js';
import { createRequire } from 'module'; // Bring in the ability to create the 'require' method
const require = createRequire(import.meta.url); // construct the require method
const pkg = require('../package.json');

const commandBin = path.resolve(__dirname, '../bin/aelf-command.js');

jest.mock('check-node-version');
jest.mock('update-notifier');
jest.mock('child_process', () => {
  return {
    execSync: str => str
  };
});
jest.mock('../src/utils/myLogger.js');
describe('test index', () => {
  afterEach(() => {
    // Restore any mocks
    jest.restoreAllMocks();
  });
  test('should check node version and run init if satisfied in test environment', () => {
    process.env.NODE_ENV = 'test';
    check.mockImplementation((options, callback) => {
      callback(null, { isSatisfied: true });
    });
    try {
      aelfCommandRun([process.argv[0], commandBin, '-v'], {
        exitOverride: true,
        suppressOutput: true
      });
    } catch (e) {
      expect(check).toHaveBeenCalledWith({ node: '>= 10.9.0' }, expect.any(Function));
    }
    expect(() =>
      aelfCommandRun([process.argv[0], commandBin, '-v'], {
        exitOverride: true,
        suppressOutput: true
      })
    ).toThrow(pkg.version);
  });
  test('should log error if node version is not satisfied in test environment', () => {
    // no notifier
    process.env.NODE_ENV = 'test';
    check.mockImplementation((options, callback) => {
      callback(null, { isSatisfied: false });
    });
    aelfCommandRun([process.argv[0], commandBin, '-v'], {
      exitOverride: true,
      suppressOutput: true
    });
    expect(check).toHaveBeenCalledWith({ node: '>= 10.9.0' }, expect.any(Function));
    expect(logger.error).toHaveBeenCalledWith('Your Node.js version is needed to >= %s', '10.9.0');
  });

  test('should notify update if update is available', () => {
    // no need in test environment because it will not check if update in this environment
    process.env.NODE_ENV = 'development';
    check.mockImplementation((options, callback) => {
      callback(null, { isSatisfied: true });
    });
    const mockNotifier = {
      update: { latest: '1.1.0' },
      notify: jest.fn()
    };
    updateNotifier.mockReturnValue(mockNotifier);
    aelfCommandRun([process.argv[0], commandBin, 'get-chain-status', '-e', 'https://aelf-test-node.aelf.io/'], {
      exitOverride: true,
      suppressOutput: true
    });
    expect(updateNotifier).toHaveBeenCalledWith({
      pkg,
      distTag: 'latest',
      updateCheckInterval: 1000 * 60 * 60 * 1 // one hour
    });
    expect(mockNotifier.notify).toHaveBeenCalled();
  });
  test('should notify update if update is unavailable', () => {
    // no need in test environment because it will not check if update in this environment
    process.env.NODE_ENV = 'development';
    check.mockImplementation((options, callback) => {
      callback(null, { isSatisfied: true });
    });
    const mockNotifier = {
      // no update
    };
    updateNotifier.mockReturnValue(mockNotifier);
    aelfCommandRun([process.argv[0], commandBin, 'get-chain-status', '-e', 'https://aelf-test-node.aelf.io/'], {
      exitOverride: true,
      suppressOutput: true
    });
    expect(updateNotifier).toHaveBeenCalledWith({
      pkg,
      distTag: 'latest',
      updateCheckInterval: 1000 * 60 * 60 * 1 // one hour
    });
  });
  test('should log error on check version failure', () => {
    process.env.NODE_ENV = 'development';
    const error = new Error('Failed to check version');
    check.mockImplementation((options, callback) => {
      callback(error, null);
    });
    aelfCommandRun([process.argv[0], commandBin, 'get-chain-status', '-e', 'https://aelf-test-node.aelf.io/'], {
      exitOverride: true,
      suppressOutput: true
    });
    expect(logger.error).toHaveBeenCalledWith(error);
  });
  test('handle invalid command', () => {
    const warnSpy = jest.spyOn(logger, 'warn');
    const infoSpy = jest.spyOn(logger, 'info');
    check.mockImplementation((options, callback) => {
      callback(null, { isSatisfied: true });
    });
    aelfCommandRun([process.argv[0], commandBin, 'test-command']);
    expect(warnSpy).toHaveBeenCalledWith('not a valid command\n');
    expect(infoSpy).toHaveBeenCalledWith('aelf-command -h');
  });
});
