/**
 * @file utils
 * @author atom-yang
 */

module.exports.serializeMessage = data => {
  let result = JSON.stringify(data);
  if (data === null || data === undefined) {
    result = '';
  }
  return Buffer.from(encodeURIComponent(result)).toString('base64');
};

module.exports.deserializeMessage = str => {
  let result = decodeURIComponent(Buffer.from(str, 'base64').toString());
  try {
    result = JSON.parse(result);
  } catch (e) {}
  return result;
};

module.exports.checkTimestamp = (time, timeBuffer = 4 * 60) => {
  const checkTime = parseInt(time, 10);
  if (!checkTime) {
    return false;
  }
  const now = Math.ceil(new Date().getTime() / 1000);
  const diff = now - checkTime;
  return diff >= 0 && diff <= timeBuffer;
};
