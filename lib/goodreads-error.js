'use strict';

function GoodreadsApiError(message, functionName) {
  this.name = 'GoodreadsApiError';
  this.message = functionName + ': ' + message;
};

GoodreadsApiError.prototype = Error.prototype;

var wrongParamsError = function wrongParamsError(functionName, param) {
  return new GoodreadsApiError('You have not passed ' + param + '.', functionName);
};
var noOAuthError = function noOAuthError(functionName) {
  return new GoodreadsApiError('You need an oAuth connection for this request', functionName);
};
var APIError = function APIError(message, functionName) {
  return new GoodreadsApiError('API returned following Error: ' + message, functionName);
};
var XMLError = function XMLError(message, functionName) {
  return new GoodreadsApiError('Error parsing XML response: ' + message, functionName);
};
var logWarning = function logWarning(message, functionName) {
  return console.warn(functionName + ': ' + message);
};

module.exports = {
  GoodreadsApiError: GoodreadsApiError,
  noOAuthError: noOAuthError,
  APIError: APIError,
  XMLError: XMLError,
  logWarning: logWarning,
  wrongParamsError: wrongParamsError
};