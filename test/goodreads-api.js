const goodreads = require('../lib/goodreads-api');
const { GoodreadsApiError } = require('../lib/goodreads-error');
const credentials = require('../.credentials');
const requestData = require('./request-data');

const nock = require('nock');
const chai = require('chai');
const expect = chai.expect;
const should = chai.should();
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);


describe('goodreads API', function() {
  let gr = goodreads(credentials);

  it('should throw an error when called with no key/secret', function() {
    expect(goodreads).to.throw(GoodreadsApiError);
  });

  it('should return API object when called with key/scret', function() {
    expect(gr).to.be.an('object');
    expect(gr).to.have.property('getAccessToken');
    expect(gr).to.have.property('getRequestToken');
    expect(gr).to.have.property('initOAuth');
  });

  it('does not expose tokens/secrets', function() {
    expect(gr.KEY).to.be.undefined;
    expect(gr.SECRET).to.be.undefined;
    expect(gr._getAuthOptions).to.be.undefined;
  });
  describe('getRequestToken', function() {
    gr = goodreads(credentials);

    nock('https://goodreads.com')
    .post('/oauth/request_token')
    .reply(200);

    gr.initOAuth();
    const promise = gr.getRequestToken();

    it('should resolve after calling initOauth()', function() {
      return promise.should.be.fulfilled;
    });

    it('should resolve with URL', function() {
      return promise.should.eventually.be.a('string');
    });
  });

  describe('getAccessToken', function() {
    gr = goodreads(credentials);

    nock('https://goodreads.com')
    .post('/oauth/request_token')
    .reply(200);


    nock('https://goodreads.com')
    .post('/oauth/access_token')
    .reply(200);

    it('should fail without requestToken', function() {
      const promise = gr.getAccessToken();
      return promise.should.be.rejected;
    });

    it('should get the accessToken if there is a oAuthToken', function() {
      gr.initOAuth();
      gr._setOAuthToken({ OAUTH_TOKEN: "TOKEN", OAUTH_TOKEN_SECRET: "SECRET" });
      const promise = gr.getAccessToken();
      return promise.should.be.fulfilled;
    });
  });

  describe('non OAuth API methods', function() {

    // getBooksByAuthor
    describe('getBooksByAuthor', function() {
      gr = goodreads(credentials);
      const { path, query, response } = requestData.getBooksByAuthor;

      nock('https://goodreads.com')
      .get(path)
      .query(query)
      .reply(200, response);

      const result = gr.getBooksByAuthor('175417');

      it('should return a promise', function() {
        return result.should.be.a('promise');
      });

      it('should resolve given a correct authorID', function() {
        return result.should.be.fulfilled;
      });

      it('should resolve an object', function() {
        return result.should.eventually.be.an('object');
      });

      it('should return the right data', function() {
        return expect(result).to.eventually.have.keys('books', 'id', 'link', 'name');
      });

      it('should reject when no authorID is passed', function() {
        const noIdResult = gr.getBooksByAuthor();
        return noIdResult.should.be.rejectedWith(Error);
      });
    });
    
    // getAuthorInfo
    describe('getAuthorInfo', function() {
      gr = goodreads(credentials);
      const { path, query, response } = requestData.getAuthorInfo;

      nock('https://goodreads.com')
      .get(path)
      .query(query)
      .reply(200, response);

      const result = gr.getAuthorInfo('175417');

      it('should return a promise', function() {
        return result.should.be.a('promise');
      });

      it('should resolve given a correct authorID', function() {
        return result.should.be.fulfilled;
      });

      it('should resolve an object', function() {
        return result.should.eventually.be.an('object');
      });

      it('should return the right data', function() {
        return expect(result).to.eventually.have.keys('books', 'fans_count', 'id', 'link', 'name');
      });

      it('should reject when no authorID is passed', function() {
        const noIdResult = gr.getBooksByAuthor();
        return noIdResult.should.be.rejectedWith(Error);
      });
    });
    
    // getAllSeriesByAuthor
    describe('getAllSeriesByAuthor', function() {
      gr = goodreads(credentials);
      const { path, query, response } = requestData.getAllSeriesByAuthor;

      nock('https://goodreads.com')
      .get(path)
      .query(query)
      .reply(200, response);

      const result = gr.getAllSeriesByAuthor('175417');

      it('should return a promise', function() {
        return result.should.be.a('promise');
      });

      it('should resolve given a correct authorID', function() {
        return result.should.be.fulfilled;
      });

      it('should resolve an object', function() {
        return result.should.eventually.be.an('object');
      });

      it('should return the right data', function() {
        return expect(result).to.eventually.have.keys('series_work');
      });

      it('should reject when no authorID is passed', function() {
        const noIdResult = gr.getBooksByAuthor();
        return noIdResult.should.be.rejectedWith(Error);
      });
    });
  });
});
