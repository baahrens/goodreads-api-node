'use strict';

var request = require('request');
var queryString = require('query-string');

var _require = require('./goodreads-error'),
    APIError = _require.APIError,
    XMLError = _require.XMLError;

module.exports = {
  get: function get(req) {
    var queryParams = req.getQueryParams();
    var path = req.getPath() + '?' + queryString.stringify(queryParams);

    return new Promise(function (resolve, reject) {
      request(path, function (error, response, body) {
        if (error) reject(error);else resolve(body);
      });
    });
  },

  oAuthGet: function oAuthGet(req) {
    var _req$getAccessToken = req.getAccessToken(),
        access_token = _req$getAccessToken.access_token,
        access_token_secret = _req$getAccessToken.access_token_secret;

    var queryParams = req.getQueryParams();
    var path = req.getPath() + '?' + queryString.stringify(queryParams);
    var oauth = req.getOAuth();

    return new Promise(function (resolve, reject) {
      oauth.get(path, access_token, access_token_secret, function (error, response) {
        if (error) reject(error);else resolve(response);
      });
    });
  },

  oAuthPost: function oAuthPost(req) {
    var _req$getAccessToken2 = req.getAccessToken(),
        access_token = _req$getAccessToken2.access_token,
        access_token_secret = _req$getAccessToken2.access_token_secret;

    var oauth = req.getOAuth();
    var queryParams = req.getQueryParams();
    var path = req.getPath() + '?' + queryString.stringify(queryParams);

    return new Promise(function (resolve, reject) {
      oauth.post(path, access_token, access_token_secret, null, null, function (error, response) {
        if (error) reject(error);else resolve(response);
      });
    });
  },

  oAuthDelete: function oAuthDelete(req) {
    var _req$getAccessToken3 = req.getAccessToken(),
        access_token = _req$getAccessToken3.access_token,
        access_token_secret = _req$getAccessToken3.access_token_secret;

    var oauth = req.getOAuth();
    var queryParams = req.getQueryParams();
    var path = req.getPath() + '?' + queryString.stringify(queryParams);

    return new Promise(function (resolve, reject) {
      oauth.delete(path, access_token, access_token_secret, function (error, response) {
        if (error) reject(error);else resolve(response);
      });
    });
  }
};