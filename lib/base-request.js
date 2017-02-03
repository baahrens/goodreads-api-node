'use strict';

var OAuth = require('oauth').OAuth;
var request = require('request');
var xml2js = require('xml2js');

var xmlParser = new xml2js.Parser({
  explicitArray: false,
  mergeAttrs: true
});

var Builder = function Builder() {
  var responseKey = void 0,
      queryParams = void 0,
      port = void 0,
      path = void 0,
      oauth = void 0,
      access_token = void 0,
      access_token_secret = void 0;
};

Builder.prototype.withResponseKey = function (responseKey) {
  this.responseKey = responseKey;
  return this;
};

Builder.prototype.withQueryParams = function (queryParams) {
  this.queryParams = queryParams;
  return this;
};

Builder.prototype.withPort = function (port) {
  this.port = port;
  return this;
};

Builder.prototype.withPath = function (path) {
  this.path = path;
  return this;
};

Builder.prototype.withOAuth = function (authOptions) {
  this.oauth = authOptions.OAUTH;
  this.access_token = authOptions.ACCESS_TOKEN;
  this.access_token_secret = authOptions.ACCESS_TOKEN_SECRET;
  return this;
};

Builder.prototype.build = function () {
  return new Request(this);
};

var Request = function Request(builder) {
  if (!builder) throw new Error('No Builder');

  this.path = builder.path;
  this.port = builder.port || 80;
  this.queryParams = builder.queryParams || {};
  this.responseKey = builder.responseKey || '';
  this.access_token = builder.access_token;
  this.access_token_secret = builder.access_token_secret;
  this.oauth = builder.oauth;
};

Request.prototype.getQueryParams = function () {
  return this.queryParams;
};

Request.prototype.getResponseKey = function () {
  return this.responseKey;
};

Request.prototype.getPort = function () {
  return this.port;
};

Request.prototype.getPath = function () {
  return this.path;
};

Request.prototype.getAccessToken = function () {
  var access_token = this.access_token,
      access_token_secret = this.access_token_secret;

  return { access_token: access_token, access_token_secret: access_token_secret };
};

Request.prototype.getOAuth = function () {
  return this.oauth;
};

// Request.prototype.getRequest = function() {
//   return new Promise((resolve, reject) => {
//     request(this.path, this.queryParams, (error, response, body) => {
//       if (error) reject(error);
//       else xmlParser.parseString(body, (err, result) => {
//         if (err) reject(err);
//         else {
//           resolve(this.responseKey ? result.GoodreadsResponse[this.responseKey]: result.GoodreadsResponse);
//         }
//       });
//     });
//   });
// };

// Request.prototype.oAuthPostRequest = function() {
//   return new Promise((resolve, reject) => {
//     if (this.access_token && this.access_token_secret) {
//       this.oauth.post(this.path, this.access_token, this.access_token_secret, null, null, (error, body, response) => {
//         if (error) reject(error);
//         resolve(response);
//       });
//     } else {
//       reject("Not authenticated");
//     }
//   });
// };

// Request.prototype.oAuthDeleteRequest = function() {
//   return new Promise((resolve, reject) => {
//     if (this.access_token && this.access_token_secret) {
//       this.oauth.delete(this.path, this.access_token, this.access_token_secret, (error, body, response) => {
//         if (error) reject(error);
//         else xmlParser.parseString(body, (err, result) => {
//           if (err) reject(err);
//           else resolve(this.responseKey ? result.GoodreadsResponse[this.responseKey]: result.GoodreadsResponse);
//         });
//       });
//     } else {
//       reject("Not authenticated");
//     }
//   });
// };
// Request.prototype.oAuthGetRequest = function() {
//   return new Promise((resolve, reject) => {
//     if (this.access_token && this.access_token_secret) {
//       this.oauth.get(this.path, this.access_token, this.access_token_secret, (error, body, response) => {
//         console.log(response);
//         if (error) reject(error);
//         else xmlParser.parseString(body, (err, result) => {
//           if (err) reject(err);
//           else resolve(this.responseKey ? result.GoodreadsResponse[this.responseKey]: result.GoodreadsResponse);
//         });
//       });
//     } else {
//       reject("Not authenticated");
//     }
//   });
// };

module.exports.builder = function () {
  return new Builder();
};