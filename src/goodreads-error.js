function GoodreadsApiError(message, functionName) {
  this.name = 'GoodreadsApiError';
  this.message = `${functionName}: ${message}`;
};

GoodreadsApiError.prototype = Error.prototype;

const wrongParamsError = (functionName, param) => new GoodreadsApiError(`You have not passed ${param}.`, functionName);
const noOAuthError = functionName => new GoodreadsApiError('You need an oAuth connection for this request', functionName);
const APIError = (message, functionName) => new GoodreadsApiError(`API returned following Error: ${message}`, functionName);
const XMLError = (message, functionName) => new GoodreadsApiError(`Error parsing XML response: ${message}`, functionName);
const logWarning = (message, functionName) => console.warn(`${functionName}: ${message}`);

module.exports = {
  GoodreadsApiError,
  noOAuthError,
  APIError,
  XMLError,
  logWarning,
  wrongParamsError,
};
