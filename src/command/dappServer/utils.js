/**
 * Serializes a message object to a string.
 * @param {any} data - The message object to serialize.
 * @returns {string} The serialized message as a string.
 */
const serializeMessage = data => {
  let result = JSON.stringify(data);
  if (data === null || data === undefined) {
    result = '';
  }
  return Buffer.from(encodeURIComponent(result)).toString('base64');
};

/**
 * Deserializes a string to a message object.
 * @param {string} str - The string to deserialize.
 * @returns {any} The deserialized message object.
 */
const deserializeMessage = str => {
  let result = decodeURIComponent(Buffer.from(str, 'base64').toString());
  try {
    result = JSON.parse(result);
  } catch (e) {}
  return result;
};
/**
 * Checks if the given timestamp is within the specified time buffer from the current time.
 * @param {string} time - The timestamp to check, either as a number or a string.
 * @param {number} [timeBuffer=300] - The time buffer in seconds. Default is 300 seconds.
 * @returns {boolean} True if the timestamp is within the time buffer, false otherwise.
 */
const checkTimestamp = (time, timeBuffer = 4 * 60) => {
  const checkTime = parseInt(time, 10);
  if (!checkTime) {
    return false;
  }
  const now = Math.ceil(new Date().getTime() / 1000);
  const diff = now - checkTime;
  return diff >= 0 && diff <= timeBuffer;
};

export { serializeMessage, deserializeMessage, checkTimestamp };
