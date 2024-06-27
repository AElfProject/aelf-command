import fs from 'fs';
import os from 'os';
import { writeFilePreservingEol } from '../../src/utils/fs.js';
import { promisify } from '../../src/utils/utils';

jest.mock('fs');
jest.mock('../../src/utils/utils', () => {
  return {
    promisify: fn => fn
  };
});

describe('File System Operators', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('writeFilePreservingEol', () => {
    test('should write data with preserved EOL', async () => {
      const path = '/path/to/existing/file.txt';
      const existingData = 'Line 1\nLine 2\nLine 3\n';
      const newData = 'New Line 1\nNew Line 2\nNew Line 3\n';
      const expectedData = 'New Line 1\nNew Line 2\nNew Line 3\n';

      const mockBuffer = Buffer.from(existingData, 'utf-8');
      fs.existsSync.mockReturnValue(true);
      fs.readFile.mockReturnValue(mockBuffer);

      let writtenData = '';
      fs.writeFile.mockImplementation((filePath, data) => {
        writtenData = data.toString();
      });

      await writeFilePreservingEol(path, newData);
      expect(writtenData).toBe(expectedData);
    });

    test('should write data with default EOL if file does not exist', async () => {
      const path = '/path/to/nonexistent/file.txt';
      const newData = 'Line 1\nLine 2\nLine 3\n';
      fs.existsSync.mockReturnValue(false);
      let writtenData = '';
      fs.writeFile.mockImplementation((filePath, data) => {
        writtenData = data.toString();
      });
      await writeFilePreservingEol(path, newData);
      expect(writtenData).toBe(newData);
    });
  });
});
