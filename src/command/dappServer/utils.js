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
