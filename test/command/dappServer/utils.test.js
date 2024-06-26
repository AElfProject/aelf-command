import { serializeMessage, deserializeMessage, checkTimestamp } from '../../../src/command/dappServer/utils';

describe('Utils module', () => {
  describe('serializeMessage', () => {
    test('should serialize a valid JSON object', () => {
      const data = { key: 'value' };
      const serialized = serializeMessage(data);
      const expected = Buffer.from(encodeURIComponent(JSON.stringify(data))).toString('base64');
      expect(serialized).toBe(expected);
    });

    test('should return an empty string for null input', () => {
      const serialized = serializeMessage(null);
      expect(serialized).toBe('');
    });

    test('should return an empty string for undefined input', () => {
      const serialized = serializeMessage(undefined);
      expect(serialized).toBe('');
    });

    test('should serialize an empty object', () => {
      const data = {};
      const serialized = serializeMessage(data);
      const expected = Buffer.from(encodeURIComponent(JSON.stringify(data))).toString('base64');
      expect(serialized).toBe(expected);
    });
  });

  describe('deserializeMessage', () => {
    test('should deserialize a valid base64-encoded string', () => {
      const data = { key: 'value' };
      const serialized = Buffer.from(encodeURIComponent(JSON.stringify(data))).toString('base64');
      const deserialized = deserializeMessage(serialized);
      expect(deserialized).toEqual(data);
    });

    test('should return an empty object for an invalid JSON string', () => {
      const invalidSerialized = Buffer.from('invalid json').toString('base64');
      const deserialized = deserializeMessage(invalidSerialized);
      expect(deserialized).toBe('invalid json');
    });

    test('should return an empty string for an empty input string', () => {
      const deserialized = deserializeMessage('');
      expect(deserialized).toBe('');
    });
  });

  describe('checkTimestamp', () => {
    test('should return true for a valid timestamp within the buffer', () => {
      const time = Math.ceil(new Date().getTime() / 1000);
      const isValid = checkTimestamp(time);
      expect(isValid).toBe(true);
    });

    test('should return false for a timestamp outside the buffer', () => {
      // 5 minutes ago
      const time = Math.ceil(new Date().getTime() / 1000) - 5 * 60;
      const isValid = checkTimestamp(time, 4 * 60);
      expect(isValid).toBe(false);
    });

    test('should return false for an invalid timestamp', () => {
      const isValid = checkTimestamp('invalid timestamp');
      expect(isValid).toBe(false);
    });

    test('should return false for a future timestamp', () => {
      // 1 minute in the future
      const time = Math.ceil(new Date().getTime() / 1000) + 60;
      const isValid = checkTimestamp(time);
      expect(isValid).toBe(false);
    });
  });
});
