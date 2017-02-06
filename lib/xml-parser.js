'use strict';

var xml2js = require('xml2js');

var _require = require('./goodreads-error'),
    APIError = _require.APIError,
    XMLError = _require.XMLError;

var xmlParser = new xml2js.Parser({
  explicitArray: false,
  mergeAttrs: true
});

module.exports = function parseXML(xml) {
  return new Promise(function (resolve, reject) {
    xmlParser.parseString(xml, function (err, result) {
      if (err) reject(XMLError(err.error, 'RequestManager.get()'));
      // else if (result.error) reject(APIError(result.error, 'RequestManager.get()'));
      else resolve(result);
    });
  });
};