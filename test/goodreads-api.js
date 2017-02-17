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
    expect(gr._getAccessToken).to.be.undefined;
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

    it('should get the accessToken if there is an oAuthToken', function() {
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

      it('should return the right data', function() {
        return Promise.all([
          result.should.be.a('promise'),
          result.should.be.fulfilled,
          result.should.eventually.be.an('object'),
          result.should.eventually.have.keys('books', 'id', 'link', 'name'),
        ]);
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

      it('should return the right data', function() {
        return Promise.all([
          result.should.be.a('promise'),
          result.should.be.fulfilled,
          result.should.eventually.be.an('object'),
          result.should.eventually.have.keys('books', 'fans_count', 'id', 'link', 'name'),
        ]);
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

      it('should return the right data', function() {
        return Promise.all([
          result.should.be.a('promise'),
          result.should.be.fulfilled,
          result.should.eventually.be.an('object'),
          result.should.eventually.have.keys('series_work'),
        ]);
      });

      it('should reject when no authorID is passed', function() {
        const noIdResult = gr.getAllSeriesByAuthor();
        return noIdResult.should.be.rejectedWith(Error);
      });
    });

    // getUserInfo
    describe('getUserInfo', function() {
      gr = goodreads(credentials);
      const { path, query, response } = requestData.getUserInfo;

      nock('https://goodreads.com')
      .get(path)
      .query(query)
      .reply(200, response);

      const result = gr.getUserInfo('175417');

      it('should return the right data', function() {
        return Promise.all([
          result.should.be.a('promise'),
          result.should.be.fulfilled,
          result.should.eventually.be.an('object'),
          result.should.eventually.have.keys('id'),
        ]);
      });

      it('should reject when no userID is passed', function() {
        const noIdResult = gr.getUserInfo();
        return noIdResult.should.be.rejectedWith(Error);
      });
    });
    
    // getUsersShelves
    describe('getUsersShelves', function() {
      gr = goodreads(credentials);
      const { path, query, response } = requestData.getUsersShelves;

      nock('https://goodreads.com')
      .get(path)
      .query(query)
      .reply(200, response);

      const result = gr.getUsersShelves('175417');

      it('should return the right data', function() {
        return Promise.all([
          result.should.be.a('promise'),
          result.should.be.fulfilled,
          result.should.eventually.be.an('object'),
          result.should.eventually.have.keys('user_shelf'), ]);
      });

      it('should reject when no userID is passed', function() {
        const noIdResult = gr.getUsersShelves();
        return noIdResult.should.be.rejectedWith(Error);
      });
    });
    
    // getUsersGroups
    describe('getUsersGroups', function() {
      gr = goodreads(credentials);
      const { path, query, response } = requestData.getUsersGroups;

      nock('https://goodreads.com')
      .get(path)
      .query(query)
      .reply(200, response);

      const result = gr.getUsersGroups('175417');

      it('should return the right data', function() {
        return Promise.all([
          result.should.be.a('promise'),
          result.should.be.fulfilled,
          result.should.eventually.be.an('object'),
          result.should.eventually.have.keys('user', 'list'),
        ]);
      });

      it('should reject when no userID is passed', function() {
        const noIdResult = gr.getUsersGroups();
        return noIdResult.should.be.rejectedWith(Error);
      });
    });
    
    // getGroupMembers
    describe('getGroupMembers', function() {
      gr = goodreads(credentials);
      const { path, query, response } = requestData.getGroupMembers;

      nock('https://goodreads.com')
      .get(path)
      .query(query)
      .reply(200, response);

      const result = gr.getGroupMembers('12345');

      it('should return the right data', function() {
        return Promise.all([
          result.should.be.a('promise'),
          result.should.be.fulfilled,
          result.should.eventually.be.an('object'),
          result.should.eventually.have.keys('group_user'),
        ]);
      });

      it('should reject when no userID is passed', function() {
        const noIdResult = gr.getGroupMembers();
        return noIdResult.should.be.rejectedWith(Error);
      });
    });
  });
});
