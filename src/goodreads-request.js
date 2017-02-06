const request = require('request');
const queryString = require('query-string');
const { APIError, XMLError } = require('./goodreads-error');


module.exports = {
 get: function(req) {
    const queryParams = req.getQueryParams();
    const path = req.getPath() + '?' + queryString.stringify(queryParams);

    return new Promise((resolve, reject) => {
      request(path, (error, response, body) => {
        if (error) reject(error);
        else resolve(body);
      });
    });
  },

   oAuthGet: function(req) {
    const { access_token, access_token_secret } = req.getAccessToken();
    const queryParams = req.getQueryParams();
    const path = req.getPath() + '?' + queryString.stringify(queryParams);
    const oauth = req.getOAuth();

    return new Promise((resolve, reject) => {
      oauth.get(path, access_token, access_token_secret, (error, response) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  },

  oAuthPost: function(req) {
    const { access_token, access_token_secret } = req.getAccessToken();
    const oauth = req.getOAuth();
    const queryParams = req.getQueryParams();
    const path = req.getPath() + '?' +  queryString.stringify(queryParams);

    return new Promise((resolve, reject) => {
      oauth.post(path, access_token, access_token_secret, null, null, (error, response) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  },

   oAuthDelete: function(req) {
    const { access_token, access_token_secret } = req.getAccessToken();
    const oauth = req.getOAuth();
    const queryParams = req.getQueryParams();
    const path = req.getPath() + '?' + queryString.stringify(queryParams);

    return new Promise((resolve, reject) => {
      oauth.delete(path, access_token, access_token_secret, (error, response) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  },
};
