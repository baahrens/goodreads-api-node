const xml2js = require('xml2js');
const { APIError, XMLError } = require('./goodreads-error');

const xmlParser = new xml2js.Parser({
  explicitArray: false,
  mergeAttrs: true,
});

module.exports = function parseXML(xml) {
  return new Promise((resolve, reject) => {
    xmlParser.parseString(xml, function(err, result) {
      if (err) reject(XMLError(err.error, 'RequestManager.get()'));
      // else if (result.error) reject(APIError(result.error, 'RequestManager.get()'));
      else resolve(result);
    });
  });
};
