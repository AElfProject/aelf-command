/* eslint-disable max-len */
import { Command } from 'commander';
import path from 'path';
import chalk from 'chalk';
import DeployCommand from '../../src/command/deploy.js';
import { userHomeDir } from '../../src/utils/userHomeDir.js';
import { endpoint as endPoint, account, password, dataDir } from '../constants.js';

jest.mock('chalk', () => {
  return {
    blue: jest.fn(),
    green: jest.fn(),
    yellow: jest.fn(),
    red: jest.fn(),
    hex: jest.fn(),
    redBright: jest.fn((...args) => `redBright(${args.join('')})`),
    yellowBright: jest.fn(text => `yellowBright(${text})`)
  };
});

describe('DeployCommand', () => {
  let deployCommand;
  let consoleSpy;
  const sampleRc = { getConfigs: jest.fn() };
  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    deployCommand = new DeployCommand(sampleRc);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should log deprecation message when run is called', async () => {
    const expectedTips = `redBright(Deprecated! Please use yellowBright(\`aelf-command send\`), check details in aelf-command \`README.md\`)`;
    const commander = new Command();
    commander.option('-e, --endpoint <URI>', 'The URI of an AElf node. Eg: http://127.0.0.1:8000');
    commander.option('-a, --account <account>', 'The address of AElf wallet');
    commander.option('-p, --password <password>', 'The password of encrypted keyStore');
    commander.option(
      '-d, --datadir <directory>',
      `The directory that contains the AElf related files. Default to be ${userHomeDir}/aelf`
    );
    commander.parse([process.argv[0], '', 'console', '-e', endPoint, '-a', account, '-p', password, '-d', dataDir]);
    await deployCommand.run(commander);
    expect(consoleSpy).toHaveBeenCalledWith(expectedTips);
  });
});
