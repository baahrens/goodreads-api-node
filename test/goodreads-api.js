const goodreads = require('../lib/goodreads-api');
const { GoodreadsApiError } = require('../lib/goodreads-error');
const credentials = require('../.credentials');

const nock = require('nock');
const chai = require('chai');
const expect = chai.expect;
const should = chai.should();
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const requestData = {
  getBooksByAuthor: {
    path: '/author/list/175417',
    response: "<GoodreadsResponse><Request>x</Request><author><books></books><id></id><link></link><name></name></author></GoodreadsResponse>",
    query: { key: credentials.key, format: 'xml' },
  },
};

describe('goodreads API', function() {
  it('should throw an error when called with no key/secret', function() {
    expect(goodreads).to.throw(GoodreadsApiError);
  });

  it('should return API object when called with key/scret', function() {
    const gr = goodreads(credentials);

    expect(gr).to.be.an('object');
    expect(gr).to.have.property('getAccessToken');
    expect(gr).to.have.property('getRequestToken');
    expect(gr).to.have.property('initOAuth');
  });

  it('does not expose tokens/secrets', function() {
    const gr = goodreads(credentials);

    expect(gr.KEY).to.be.undefined;
    expect(gr.SECRET).to.be.undefined;

    expect(gr._getAccessToken).to.be.undefined;
    expect(gr._setAccessToken).to.be.undefined;
    expect(gr._getOAuthToken).to.be.undefined;
    expect(gr._setOAuthToken).to.be.undefined;
    expect(gr._getAuthOptions).to.be.undefined;
  });
  describe('non OAuth API methods', function() {

    const gr = goodreads(credentials); 

    describe('getBooksByAuthor', function() {
      const result = gr.getBooksByAuthor('175417');
      const { path, query, response } = requestData.getBooksByAuthor;

      nock('https://goodreads.com').get(path).query(query).reply(200, response);

      it('should return a promise', function() {
        result.should.be.a('promise');
      });

      it('should resolve given a correct authorID', function(done) {
        result.should.be.fulfilled.notify(done);
      });
      
      it('should resolve an object', function(done) {
        result.should.eventually.be.an('object').notify(done);
      });

      it('should return the right data', function(done) {
        expect(result).to.eventually.have.keys('books', 'id', 'link', 'name').notify(done);
      });

      it('should reject when no authorID is passed', function(done) {
        const noIdResult = gr.getBooksByAuthor();
        noIdResult.should.be.rejectedWith(Error).notify(done);
      });
    });
  });
});
