'use strict';

var request = require('request');
var queryString = require('query-string');
var xml2js = require('xml2js');

var _require = require('./goodreads-error'),
    APIError = _require.APIError;

var xmlParser = new xml2js.Parser({
  explicitArray: false,
  mergeAttrs: true
});

var RequestManager = {};

RequestManager.get = function (req) {
  var queryParams = req.getQueryParams();
  var path = req.getPath() + '?' + queryString.stringify(queryParams);

  return new Promise(function (resolve, reject) {
    request(path, function (error, response, body) {
      if (error) reject(error);else {
        xmlParser.parseString(body, function (err, result) {
          if (err) reject(err);else if (result.error) reject(APIError(result.error, 'RequestManager.get()'));else resolve(result.GoodreadsResponse);
        });
      }
    });
  });
};

RequestManager.oAuthGet = function (req) {
  var _req$getAccessToken = req.getAccessToken(),
      access_token = _req$getAccessToken.access_token,
      access_token_secret = _req$getAccessToken.access_token_secret;

  var queryParams = req.getQueryParams();
  var path = req.getPath() + '?' + queryString.stringify(queryParams);
  var oauth = req.getOAuth();
  console.log(path);

  return new Promise(function (resolve, reject) {
    oauth.get(path, access_token, access_token_secret, function (error, response) {
      if (error) reject(error);else {
        xmlParser.parseString(response, function (err, result) {
          if (err) reject(err);else resolve(result.GoodreadsResponse);
        });
      }
    });
  });
};

RequestManager.oAuthPost = function (req) {
  var _req$getAccessToken2 = req.getAccessToken(),
      access_token = _req$getAccessToken2.access_token,
      access_token_secret = _req$getAccessToken2.access_token_secret;

  var oauth = req.getOAuth();
  var queryParams = req.getQueryParams();
  var path = req.getPath() + '?' + queryString.stringify(queryParams);

  return new Promise(function (resolve, reject) {
    oauth.post(path, access_token, access_token_secret, null, null, function (error, response) {
      if (error) reject(error);else {
        xmlParser.parseString(response, function (err, result) {
          if (err) reject(err);else resolve(result.GoodreadsResponse);
        });
      }
    });
  });
};

RequestManager.oAuthDelete = function (req) {
  var _req$getAccessToken3 = req.getAccessToken(),
      access_token = _req$getAccessToken3.access_token,
      access_token_secret = _req$getAccessToken3.access_token_secret;

  var oauth = req.getOAuth();
  var queryParams = req.getQueryParams();
  var path = req.getPath() + '?' + queryString.stringify(queryParams);

  console.log(path);
  return new Promise(function (resolve, reject) {
    oauth.delete(path, access_token, access_token_secret, function (error, response) {
      if (error) reject(error);else {
        xmlParser.parseString(response, function (err, result) {
          if (err) reject(err);else resolve();
        });
      }
    });
  });
};

module.exports = exports = RequestManager;