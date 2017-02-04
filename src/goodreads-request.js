const request = require('request');
const queryString = require('query-string');
const xml2js = require('xml2js');
const { APIError, XMLError } = require('./goodreads-error');

const xmlParser = new xml2js.Parser({
  explicitArray: false,
  mergeAttrs: true,
});

const RequestManager = {};

RequestManager.get = function(req) {
  const queryParams = req.getQueryParams();
  const path = req.getPath() + '?' + queryString.stringify(queryParams);

  return new Promise((resolve, reject) => {
    request(path, (error, response, body) => {
      if (error) reject(error);
      else {
        xmlParser.parseString(body, function(err, result) {
          if (err) reject(XMLError(err.error, 'RequestManager.get()'));
          else if (result.error) reject(APIError(result.error, 'RequestManager.get()'));
          else resolve(result.GoodreadsResponse);
        });
      }
    });
  });
};

RequestManager.oAuthGet = function(req) {
  const { access_token, access_token_secret } = req.getAccessToken();
  const queryParams = req.getQueryParams();
  const path = req.getPath() + '?' + queryString.stringify(queryParams);
  const oauth = req.getOAuth();

  return new Promise((resolve, reject) => {
    oauth.get(path, access_token, access_token_secret, (error, response) => {
      if (error) reject(error);
      else {
        xmlParser.parseString(response, function(err, result) {
          if (err) reject(XMLError(err.error, 'RequestManager.oAuthGet()'));
          else resolve(result.GoodreadsResponse);
        });
      }
    });
  });
};

RequestManager.oAuthPost = function(req) {
  const { access_token, access_token_secret } = req.getAccessToken();
  const oauth = req.getOAuth();
  const queryParams = req.getQueryParams();
  const path = req.getPath() + '?' +  queryString.stringify(queryParams);

  return new Promise((resolve, reject) => {
    oauth.post(path, access_token, access_token_secret, null, null, (error, response) => {
      if (error) reject(error);
      else {
        xmlParser.parseString(response, function(err, result) {
          if (err) reject(XMLError(err.error, 'RequestManager.oAuthPost()'));
          else resolve(result.GoodreadsResponse);
        });
      }
    });
  });
};

RequestManager.oAuthDelete = function(req) {
  const { access_token, access_token_secret } = req.getAccessToken();
  const oauth = req.getOAuth();
  const queryParams = req.getQueryParams();
  const path = req.getPath() + '?' + queryString.stringify(queryParams);

  return new Promise((resolve, reject) => {
    oauth.delete(path, access_token, access_token_secret, (error, response) => {
      if (error) reject(error);
      else {
        xmlParser.parseString(response, function(err, result) {
          if (err) reject(XMLError(err.error, 'RequestManager.oAuthDelete()'));
          else resolve();
        });
      }
    });
  });
};

module.exports = exports = RequestManager;
