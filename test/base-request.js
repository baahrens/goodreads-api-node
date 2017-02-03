const Request = require('../lib/base-request');
const expect = require('chai').expect;

describe("build requests", function() {
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
