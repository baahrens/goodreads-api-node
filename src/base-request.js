
const Builder = function(){
  let responseKey, queryParams, port, path, oauth, access_token, access_token_secret;
};

Builder.prototype.withResponseKey = function(responseKey) {
  this.responseKey = responseKey;
  return this;
};

Builder.prototype.withQueryParams = function(queryParams) {
  this.queryParams = queryParams;
  return this;
};

Builder.prototype.withPort = function(port) {
  this.port = port;
  return this;
};

Builder.prototype.withPath = function(path) {
  this.path = path;
  return this;
};

Builder.prototype.withOAuth = function(authOptions) {
  this.oauth = authOptions.OAUTH;
  this.access_token = authOptions.ACCESS_TOKEN;
  this.access_token_secret = authOptions.ACCESS_TOKEN_SECRET;
  return this;
};

Builder.prototype.build = function() {
  return new Request(this);
};

const Request = function(builder) {
  if (!builder) throw new Error('No Builder');

  this.path = builder.path;
  this.port = builder.port || 80;
  this.queryParams = builder.queryParams || {}
  this.access_token = builder.access_token;
  this.access_token_secret = builder.access_token_secret;
  this.oauth = builder.oauth;
};

Request.prototype.getQueryParams = function() {
  return this.queryParams;
};

Request.prototype.getPort = function() {
  return this.port;
};

Request.prototype.getPath = function() {
  return this.path;
};

Request.prototype.getAccessToken = function() {
  const { access_token, access_token_secret } = this;
  return { access_token, access_token_secret };
};

Request.prototype.getOAuth = function() {
  return this.oauth;
};

module.exports.builder = () => new Builder();
