const Request = require('../lib/base-request');
const expect = require('chai').expect;

describe("request builder", function() {
  it('should set path', function() {
    const req = Request.builder()
    .withPath('http://randomurl.com/path')
    .build();

    expect(req.getPath()).to.equal('http://randomurl.com/path');
  });

  it('should set query params', function() {
    const req = Request.builder()
    .withQueryParams({ first: 1, second: "two", third: 3 })
    .build();

    const queryParams = req.getQueryParams();

    expect(queryParams.first).to.equal(1);
    expect(queryParams.second).to.equal("two");
    expect(queryParams.third).to.equal(3);
  });

  it('should set port', function() {
    const req = Request.builder()
    .withPort(23)
    .build();

    const port = req.getPort();
    expect(port).to.equal(23);
  });

  it('should set oAuth properties', function() {
    const oAuthObj = {
      ACCESS_TOKEN: "YOUR_ACCESS_TOKEN",
      ACCESS_TOKEN_SECRET: "YOUR_ACCESS_TOKEN_SECRET",
      OAUTH: {},
    };

    const req = Request.builder()
    .withOAuth(oAuthObj)
    .build();

    const { access_token, access_token_secret } = req.getAccessToken();
    const oauth = req.getOAuth();

    expect(access_token).to.equal(oAuthObj.ACCESS_TOKEN);
    expect(access_token_secret).to.equal(oAuthObj.ACCESS_TOKEN_SECRET);
    expect(oauth).to.equal(oAuthObj.OAUTH);
  });
});

describe('Request object', function() {
  describe('Request', function() {
    it('should set default port', function() {
      const req = Request.builder().build();

      expect(req.getPort()).to.equal(80);
    });
  });
  describe('Request.getQueryParams()', function() {
    it('should return queryParams', function() {
      const req = Request.builder()
      .withQueryParams({ query: 'random query' })
      .build();

      const queryParams = req.getQueryParams();
      expect(queryParams.query).to.equal('random query');
    });
    it('should return an empty object, if initialized with no queryParams', function() {
      const req = Request.builder().build();

      const queryParams = req.getQueryParams();
      expect(queryParams).to.be.empty;
    });
  });
  describe('getPort()', function() {
    it('should return port', function() {
      const req = Request.builder()
      .withPort(99)
      .build();

      const port = req.getPort();
      expect(port).to.equal(99);
    });
  });
  describe('getPath()', function() {
    it('should return path', function() {
      const req = Request.builder()
      .withPath('http://testurl.com/random/path')
      .build();

      const path = req.getPath();
      expect(path).to.equal('http://testurl.com/random/path');
    });
  });
  describe('getAccessToken()', function() {
    it('should return accessToken object', function() {
      const accessData = {
        ACCESS_TOKEN: 'xyz',
        ACCESS_TOKEN_SECRET: 'abc',
      };
      const req = Request.builder()
      .withOAuth(accessData)
      .build();

      const reqAccessData = req.getAccessToken();
      expect(reqAccessData.access_token).to.equal('xyz');
      expect(reqAccessData.access_token_secret).to.equal('abc');
    });
  });
  describe('getOauth()', function() {
    it('should return oauth object', function() {
      const oAuth = { oauthData: 'some data' };
      const req = Request.builder()
      .withOAuth({ OAUTH: oAuth })
      .build();

      const reqOAuth = req.getOAuth();
      expect(reqOAuth).to.deep.equal(oAuth);
    });
  });
});
