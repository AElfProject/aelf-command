import { Command } from 'commander';
import path from 'path';
import EventCommand from '../../src/command/event.js';
import { logger, plainLogger } from '../../src/utils/myLogger';
import { userHomeDir } from '../../src/utils/userHomeDir.js';

jest.mock('../../src/utils/myLogger');

describe('EventCommand', () => {
  let eventCommand;
  let oraInstanceMock;
  const sampleRc = { getConfigs: jest.fn() };
  const endPoint = 'https://tdvw-test-node.aelf.io/';
  const account = 'GyQX6t18kpwaD9XHXe1ToKxfov8mSeTLE9q9NwUAeTE8tULZk';
  const password = '1234*Qwer';
  const dataDir = path.resolve(__dirname, '../datadir/aelf');

  beforeEach(() => {
    oraInstanceMock = {
      start: jest.fn(),
      clear: jest.fn(),
      succeed: jest.fn(),
      fail: jest.fn()
    };
    eventCommand = new EventCommand(sampleRc);
    eventCommand.oraInstance = oraInstanceMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should deserialize logs and succeed', async () => {
    const txId = 'ef17ac2078c2b31a702b9edc754bfa56f1c37931f52f9dd8e2b9dc65769966b1';
    const commander = new Command();
    commander.option('-e, --endpoint <URI>', 'The URI of an AElf node. Eg: http://127.0.0.1:8000');
    commander.option('-a, --account <account>', 'The address of AElf wallet');
    commander.option('-p, --password <password>', 'The password of encrypted keyStore');
    commander.option(
      '-d, --datadir <directory>',
      `The directory that contains the AElf related files. Default to be ${userHomeDir}/aelf`
    );
    commander.parse([process.argv[0], '', 'event', '-e', endPoint, '-a', account, '-p', password, '-d', dataDir]);
    const logs = [
      {
        Address: 'ASh2Wt7nSEmYqnGxPPzp4pnVDU4uhj1XW9Se5VeZcX2UDdyjx',
        Name: 'Transferred',
        Indexed: [
          'CiIKIKl+hAq40lOArRO+3srxpNVRFOaGZtH4WUSLGW7qDyoI',
          'EiIKINhKsag9MOuJ2sbYwzlGfKCeOcGHu4qPWYp6DeqjrOZw',
          'GgNFTEY='
        ],
        NonIndexed: 'IICglKWNHQ==',
        Result: {
          from: '2HeW7S9HZrbRJZeivMppUuUY3djhWdfVnP5zrDsz8wqq6hKMfT',
          to: '2eFtDbjWBDPJ6oNtRLjYuS5XrtjSzw4CnrCM79U1HjdvKkGYrF',
          symbol: 'ELF',
          amount: '1000000000000'
        }
      }
    ];
    await eventCommand.run(commander, txId);
    expect(plainLogger.info).toHaveBeenCalledWith(
      `\nThe results returned by \nTransaction: ${txId} is: \n${JSON.stringify(logs, null, 2)}`
    );
    expect(oraInstanceMock.fail).not.toHaveBeenCalled();
  }, 20000);

  it('should log "not mined" if transaction status is not mined', async () => {
    const txId = '3553df418c6ec9a159560440f13a6ae29f786392574737036cf63786321c8a40';
    const commander = new Command();
    commander.option('-e, --endpoint <URI>', 'The URI of an AElf node. Eg: http://127.0.0.1:8000');
    commander.option('-a, --account <account>', 'The address of AElf wallet');
    commander.option('-p, --password <password>', 'The password of encrypted keyStore');
    commander.option(
      '-d, --datadir <directory>',
      `The directory that contains the AElf related files. Default to be ${userHomeDir}/aelf`
    );
    commander.parse([process.argv[0], '', 'event', '-e', endPoint, '-a', account, '-p', password, '-d', dataDir]);
    await eventCommand.run(commander, txId);
    expect(plainLogger.info).toHaveBeenCalledWith(`Transaction ${txId} is not mined`);
    expect(oraInstanceMock.fail).not.toHaveBeenCalled();
  }, 20000);

  it('should log error and fail on exception', async () => {
    const txId = 'test';
    const commander = new Command();
    commander.option('-e, --endpoint <URI>', 'The URI of an AElf node. Eg: http://127.0.0.1:8000');
    commander.option('-a, --account <account>', 'The address of AElf wallet');
    commander.option('-p, --password <password>', 'The password of encrypted keyStore');
    commander.option(
      '-d, --datadir <directory>',
      `The directory that contains the AElf related files. Default to be ${userHomeDir}/aelf`
    );
    commander.parse([process.argv[0], '', 'event', '-e', endPoint, '-a', account, '-p', password, '-d', dataDir]);
    await eventCommand.run(commander, txId);
    expect(oraInstanceMock.fail).toHaveBeenCalledWith('Failed!');
  }, 20000);
});
