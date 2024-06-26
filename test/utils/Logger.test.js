import chalk from 'chalk';
import Logger from '../../src/utils/Logger';

describe('Logger', () => {
  let consoleLogSpy;
  const fnName = 'trace',
    level = 'Trace';
  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  // test(`should log correctly formatted message`, () => {
  //   const logger = new Logger({ log: true, onlyWords: false, name: 'TestLogger' });
  //   const message = 'Test message';
  //   logger[fnName](message);
  //   const expectedPrefix = `[${level}]: `;
  //   const expectedLog = chalk.gray(`TestLogger ${expectedPrefix}${message}`);
  //   // second params: add spaces
  //   expect(consoleLogSpy).toHaveBeenCalledWith(expectedLog, '');
  // });
  // test(`should return correctly formatted chalk message`, () => {
  //   const logger = new Logger({ log: false, onlyWords: false, name: 'TestLogger' });
  //   const message = 'Test message';
  //   const result = logger[fnName](message);
  //   const expectedPrefix = `TestLogger [${level}]: `;
  //   const expectedChalk = chalk(chalk.gray(`${expectedPrefix}${message}`));
  //   expect(result.trim()).toEqual(expectedChalk);
  // });
  test(`should log correctly formatted object message`, () => {
    const logger = new Logger({ log: true, onlyWords: false, name: 'TestLogger' });
    const message = { key: 'value' };
    logger[fnName](message);
    const expectedPrefix = `TestLogger [${level}]: \n`;
    const expectedLog = chalk.gray(`${expectedPrefix}`);
    expect(consoleLogSpy).toHaveBeenCalledWith(expectedLog, message);
  });
  test(`should log correctly formatted object message (onlyWords: true)`, () => {
    const logger = new Logger({ onlyWords: true, name: 'TestLogger' });
    logger.symbol = '*';
    const message = { key: 'value' };
    logger[fnName](message);

    const expectedPrefix = `* [${level}]: \n`;
    const expectedLog = chalk.gray(`${expectedPrefix}`);

    expect(consoleLogSpy).toHaveBeenCalledWith(expectedLog, message);
  });
});
