const OAuth = require('oauth').OAuth;
const Request = require('./base-request');
const { GoodreadsApiError, noOAuthError, wrongParamsError, logWarning } = require('./goodreads-error');
const RequestManager = require('./goodreads-request');


/**
 * Goodreads
 *
 * @access public
 * @param {object} credentials Object with API key and secret
 * @param {string} callbackURL callbackURL to get user access
 * @returns {object} Goodreads API object
 */
const Goodreads = function(credentials, callbackURL) {
  if (!credentials || !credentials.key || !credentials.secret) throw new GoodreadsApiError('Please pass your API key and secret.', 'Goodreads()');
  if (callbackURL) initOAuth(callbackURL);

  const URL = 'https://goodreads.com';
  const KEY = credentials.key;
  const SECRET = credentials.secret;

  let OAUTH;
  let ACCESS_TOKEN;
  let ACCESS_TOKEN_SECRET;
  let OAUTH_TOKEN;
  let OAUTH_TOKEN_SECRET;
  let OAUTHENTICATED = false;


  /**
   * _setAccessToken
   *
   * @access private
   * @param {object} token ACCESS_TOKEN and ACCESS_TOKEN_SECRET
   */
  function _setAccessToken(token) {
    ACCESS_TOKEN = token.ACCESS_TOKEN;
    ACCESS_TOKEN_SECRET = token.ACCESS_TOKEN_SECRET;
  };

  /**
   * _getAccessToken
   *
   * @access private
   */
  function _getAccessToken() {
    return { ACCESS_TOKEN, ACCESS_TOKEN_SECRET }
  };

  /**
   * _setOAuthToken
   *
   * @access private
   * @param {object} token Object with OAUTH_TOKEN and OAUTH_TOKEN_SECRET
   */
  function _setOAuthToken(token) {
    OAUTH_TOKEN = token.OAUTH_TOKEN;
    OAUTH_TOKEN_SECRET = token.OAUTH_TOKEN_SECRET;
  };

  /**
   * _getOAuthToken
   *
   * @access private
   */
  function _getOAuthToken() {
    return { OAUTH_TOKEN, OAUTH_TOKEN_SECRET };
  };

  /**
   * _getAuthOptions
   *
   * @access private
   */
  function _getAuthOptions() {
    return { ..._getAccessToken(), OAUTH };
  };

  /**
   * initOAuth
   *
   * @access public
   * @param {string} callbackURL, callbackURL after user has granted/declined access
   * @returns {undefined}
   */
  function initOAuth(callbackURL) {
    if (!callbackURL) logWarning('Warning: You have passed no callbackURL.', 'initOauth()');

    const requestURL = `${URL}/oauth/request_token`;
    const accessURL = `${URL}/oauth/access_token`;
    const version = '1.0';
    const encryption = 'HMAC-SHA1';

    OAUTH = new OAuth(requestURL, accessURL, KEY, SECRET, version, callbackURL, encryption);
  };

  /**
   * getRequestToken
   *
   * @access public
   */
  function getRequestToken() {
    return new Promise((resolve, reject) => {

      if (!OAUTH) reject(noOAuthError('getRequestToken()'));

      OAUTH.getOAuthRequestToken((error, oAuthToken, oAuthTokenSecret, results) => {
        if (error) reject(new GoodreadsApiError(error.message, 'getRequestToken()'));

        const url = `${URL}/oauth/authorize?oauth_token=${oAuthToken}&oauth_callback=${OAUTH._authorize_callback}`;
        _setOAuthToken({ OAUTH_TOKEN: oAuthToken, OAUTH_TOKEN_SECRET: oAuthTokenSecret });

        resolve(url);
      });
    });
  };

  /**
   * getAccessToken
   *
   * @access public
   * @returns {promise}
   */
  function getAccessToken() {
    return new Promise((resolve, reject) => {
      const { OAUTH_TOKEN, OAUTH_TOKEN_SECRET } = _getOAuthToken();
      if (OAUTH_TOKEN && OAUTH_TOKEN_SECRET && OAUTH) {

        OAUTH.getOAuthAccessToken(OAUTH_TOKEN, OAUTH_TOKEN_SECRET, 1, (error, accessToken, accessTokenSecret, results) => {
          if (error) reject(new GoodreadsApiError(error.data.split("\n")[0], 'getAccessToken()'));

          _setAccessToken({ ACCESS_TOKEN: accessToken, ACCESS_TOKEN_SECRET: accessTokenSecret });
          OAUTHENTICATED = true;

          resolve();
        });
      } else reject(new GoodreadsApiError("No Request Token found. call getRequestToken()"));
    });
  };

  /**
   * followAuthor
   *
   * @access public
   * @param {string} authorID
   * @returns {promise}
   */
  function followAuthor(id) {
    const fn_name = 'followAuthor()';
    return new Promise((resolve, reject) => {
      if (!id) reject(wrongParamsError(fn_name, 'authorID'));
      if (!OAUTHENTICATED) reject(noOAuthError(fn_name));

      const path = `${URL}/author_followings`;
      const options = { id, format: 'xml' };
      const authOptions = _getAuthOptions();

      const req = Request.builder()
      .withPath(path)
      .withQueryParams(options)
      .withOAuth(authOptions)
      .build();

      RequestManager.oAuthPost(req)
      .then(res => resolve(res))
      .catch(err => reject(err));
    });
  };

  /**
  * unfollowAuthor
  *
  * @access public
  * @param {string} authorID
  * @returns {promise}
  */
  function unfollowAuthor(id) {
    const fn_name = 'unfollowAuthor()';
    return new Promise((resolve, reject) => {
      if (!id) reject(wrongParamsError(fn_name, 'authorID'));
      if (!OAUTHENTICATED) reject(noOAuthError(fn_name));

      const path = `${URL}/author_followings/${id}`;
      const options = { format: 'xml' };
      const authOptions = _getAuthOptions();

      const req = Request.builder()
      .withPath(path)
      .withQueryParams(options)
      .withOAuth(authOptions)
      .build();

      RequestManager.oAuthDelete(req)
      .then(res => resolve(res))
      .catch(err => reject(err));
    });
  };

  /**
  * showFollowing
  *
  * @access public
  * @param {string} author followingID
  * @returns {promise}
  */
  function showFollowing(id) {
    const fn_name = 'showFollowings()';
    return new Promise((resolve, reject) => {
      if (!id) reject(wrongParamsError(fn_name, 'authorFollowingID'));
      if (!OAUTHENTICATED) reject(noOAuthError(fn_name));

      const path = `${URL}/author_followings/${id}`;
      const options = { format: 'xml' };
      const authOptions = _getAuthOptions();

      const req = Request.builder()
      .withPath(path)
      .withQueryParams(options)
      .withOAuth(authOptions)
      .build();

      RequestManager.oAuthGet(req)
      .then(res => resolve(res))
      .catch(err => reject(err));
    });
  };

  /**
   * getUserFollowings
   *
   * @access public
   * @param {string} id userID
   * @returns {promise} returns infos about the following
   */
  function getUserFollowings(id) {
    const fn_name = 'getUserFollowings()';
    return new Promise((resolve, reject) => {
      if (!id) reject(wrongParamsError(fn_name, 'userID'));
      if (!OAUTHENTICATED) reject(noOAuthError(fn_name));

      const path = `${URL}/user/${id}/following.xml`;
      const options = { key: KEY };
      const authOptions = _getAuthOptions();

      const req = Request.builder()
      .withPath(path)
      .withQueryParams(options)
      .withOAuth(authOptions)
      .build();

      RequestManager.oAuthGet(req)
      .then(res => resolve(res))
      .catch(err => reject(err));
    });
  };

/**
  * getBooksByAuthor
  *
  * @access public
  * @param {string} authorID {number} page (optional)
  * @returns {promise}
  */
  function getBooksByAuthor(id, page) {
    const fn_name = 'getBooksByAuthor()';
    return new Promise((resolve, reject) => {
      if (!id) reject(wrongParamsError(fn_name, 'authorID'));

      const path = `${URL}/author/list/${id}`;
      const options = { format: 'xml', key: KEY };
      if (page) options.page = page;

      const req = Request.builder()
      .withPath(path)
      .withQueryParams(options)
      .build()

      RequestManager.get(req)
      .then(res => resolve(res))
      .catch(err => reject(err));
    });
  };

  /**
  * getInfo
  *
  * @access public
  * @param {string} id author ID
  * @returns {promise} returns author info if successful
  */
  function getAuthorInfo(id) {
    const fn_name = 'getAuthorInfo()';
    return new Promise((resolve, reject) => {
      if (!id) reject(wrongParamsError(fn_name, 'authorID'));

      const path = `${URL}/author/show/${id}`;
      const options = { key: KEY, format: 'xml' };

      const req = Request.builder()
      .withPath(path)
      .withQueryParams(options)
      .build();

      RequestManager.get(req)
      .then(res => resolve(res))
      .catch(err => reject(err));
    });
  };

  /**
  * getAllSeries
  *
  * @access public
  * @param {string} id author ID
  * @returns {promise} returns all series by author if successful
  */
  function getAllSeriesByAuthor(id) {
    const fn_name = 'getAllSeriesByAuthor()';
    return new Promise((resolve, reject) => {
      if (!id) reject(wrongParamsError(fn_name, 'authorID'));

      const path = `${URL}/series/list`;
      const options = {
        id,
        key: KEY,
        format: 'xml',
      };

      const req = Request.builder()
      .withPath(path)
      .withQueryParams(options)
      .build();

      RequestManager.get(req)
      .then(res => resolve(res))
      .catch(err => reject(err));
    });
  };


  /**
  * getInfo
  *
  * @access public
  * @param {string} id user ID
  * @returns {promise} returns user info if successful
  */
  function getUserInfo(id) {
    const fn_name = 'getUserInfo()';
    return new Promise((resolve, reject) => {
      if (!id) reject(wrongParamsError(fn_name, 'userID'));

      const path = `${URL}/user/show/${id}.xml`;
      const options = { key: KEY };

      const req = Request.builder()
        .withPath(path)
        .withQueryParams(options)
        .build();

      RequestManager.get(req)
      .then(res => resolve(res))
      .catch(err => reject(err));
    });
  };

  /**
   * addBookToShelf
   *
   * @access public
   * @param {string} book_id bookID
   * @param {string} shelf name of users shelf
   * @returns {promise}
   */
  function addBookToShelf(book_id, shelf) {
    const fn_name = 'addBookToShelf()';
    return new Promise((resolve, reject) => {
      if (!book_id) reject(wrongParamsError(fn_name, 'bookID'));
      if (!shelf) reject(wrongParamsError(fn_name, 'shelfName'));
      if (!OAUTHENTICATED) reject(noOAuthError(fn_name));

      const path = `${URL}/shelf/add_to_shelf.xml`;
      const authOptions = _getAuthOptions();
      const options = { book_id, name: shelf };

      const req = Request.builder()
      .withPath(path)
      .withQueryParams(options)
      .withOAuth(authOptions)
      .build();

      RequestManager.oAuthPost(req)
      .then(res => resolve(res))
      .catch(err => reject(err));
    });
  }

  // TODO
  function addBooksToShelves(bookids, shelves) {
    const path = `${URL}/shelves/ad_book_to_shelves.xml`;
    const options = { bookids, shelves };
    const authOptions = _getAuthOptions();

    const req = Request.builder()
      .withPath(path)
      .withQueryParams(options)
      .withOAuth(authOptions)
      .build();

    return RequestManager.oAuthPost(req);
  };

  /**
  * getShelves
  *
  * @access public
  * @param {string} id user ID
  * @returns {promise} returns users shelves if successful
  */
  function getUsersShelves(id) {
    const fn_name = 'getUsersShelves()';
    return new Promise((resolve, reject) => {
      if (!id) reject(wrongParamsError(fn_name, 'userID'));

      const path = `${URL}/shelf/list.xml`;
      const options = { user_id: id, key: KEY };

      const req = Request.builder()
      .withPath(path)
      .withQueryParams(options)
      .build();

      RequestManager.get(req)
      .then(res => resolve(res))
      .catch(err => reject(err));
    });
  };

  /**
  * followUser
  *
  * @access public
  * @param {string} id user ID
  * @returns {promise}
  */
  function followUser(id) {
    const fn_name = 'followUser()';
    return new Promise((resolve, reject) => {
      if (!id) reject(wrongParamsError(fn_name, 'userID'));
      if (!OAUTHENTICATED) reject(noOAuthError(fn_name));

      const path = `${URL}/user/${id}/followers`
      const options = { format: 'xml' };
      const authOptions = _getAuthOptions();

      const req = Request.builder()
      .withPath(path)
      .withQueryParams(options)
      .withOAuth(authOptions)
      .build();

      RequestManager.oAuthGet(req)
      .then(res => resolve(res))
      .catch(err => reject(err));
    });
  };

  /**
  * getFriendRequests
  *
  * @access public
  * @param {number} page optional page
  * @returns {promise} returns users friend requests if successful
  */
  function getFriendRequests(page) {
    const fn_name = 'getFriendRequests()';
    return Promise((resolve, reject) => {
      if (!OAUTHENTICATED) reject(noOAuthError(fn_name));

      const path = `${URL}/friend/requests.xml`;
      const authOptions = _getAuthOptions();
      const options = page ? { page } : {};

      const req = Request.builder()
      .withPath(path)
      .withQueryParams(options)
      .withOAuth(authOptions)
      .build();

      RequestManager.oAuthGet(req)
      .then(res => resolve(res))
      .catch(err => resolve(err));
    });
  };

  /**
  * createComment
  * TODO
  *
  * @access public
  * @param {string} type
  * @param {string} id
  * @param {string} comment comment to create
  * @returns {promise}
  */
  function createComment(type, id, comment) {

    const path = `${URL}/comment.xml`;
    const options = { type, id, comment };
    const authOptions = _getAuthOptions();

    const req = Request.builder()
    .withPath(path)
    .withQueryParams(options)
    .withOAuth(authOptions)
    .build();

    return RequestManager.oAuthPost(req);
  };

  /**
  * answerFriendRecommendation
  *
  * @access public
  * @param {string} id recommendation ID
  * @param {string} response response to recommendation ('y' or 'n')
  * @returns {promise}
  */
  function answerFriendRecommendation(id, response) {
    const fn_name = 'answerFriendRecommendation()';
    return new Promise((resolve, reject) => {
      if (!id) reject(wrongParamsError(fn_name, 'recommendationID'));
      if (!response) reject(wrongParamsError(fn_name, 'response'));
      if (!OAUTHENTICATED) reject(noOAuthError(fn_name));

      const path = `${URL}/friend/confirm_recommendation.xml`;
      const options = { id, response };
      const authOptions = _getAuthOptions();

      const req = Request.builder()
      .withPath(path)
      .withQueryParams(options)
      .withOAuth(authOptions)
      .build();

      RequestManager.oAuthPost(req)
      .then(res => resolve(res))
      .catch(err => reject(err));
    });
  };

  /**
  * answerFriendRequest
  *
  * @access public
  * @param {string} id request ID
  * @param {string} response response to request ('y' or 'n')
  * @returns {promise}
  */
  function answerFriendRequest(id, response) {
    const fn_name = 'answerFriendRequest()';
    return new Promise((resolve, reject) => {
      if (!id) reject(wrongParamsError(fn_name, 'requestID'));
      if (!response) reject(wrongParamsError(fn_name, 'response'));
      if (!OAUTHENTICATED) reject(noOAuthError(fn_name));

      const path = `${URL}/friend/confirm_request.xml`;
      const options = { id, response };
      const authOptions = _getAuthOptions();

      const req = Request.builder()
      .withPath(path)
      .withQueryParams(options)
      .withOAuth(authOptions)
      .build();

      RequestManager.oAuthPost(req)
      .then(res => resolve(res))
      .catch(err => reject(err));
    });
  };

  /**
  * addFriend
  *
  * @access public
  * @param {string} id user ID
  * @returns {promise}
  */
  function addFriend(id) {
    const fn_name = 'addFriend()';
    return new Promise((resolve, reject) => {
      if (!id) reject(wrongParamsError(fn_name, 'userID'));
      if (!OAUTHENTICATED) reject(noOAuthError(fn_name));

      const path = `${URL}/friend/add_as_friend.xml`;
      const options = { id };
      const authOptions = _getAuthOptions();

      var req = Request.builder()
      .withPath(path)
      .withQueryParams(options)
      .withOAuth(authOptions)
      .build();

      RequestManager.oAuthPost(req)
      .then(res => resolve(res))
      .catch(err => reject(err));
    });
  };

  /**
  * joinGroup
  *
  * @access public
  * @param {string} id group ID
  * @returns {promise}
  */
  function joinGroup(id) {
    const fn_Name = 'joinGroup()';
    return new Promise((resolve, reject) => {
      if (!id) reject(wrongParamsError(fn_name, 'groupID'));
      if (!OAUTHENTICATED) reject(noOAuthError(fn_name));

      const path = `${URL}/group/join`;
      const options = { id };
      const authOptions = _getAuthOptions();

      var req = Request.builder()
      .withPath(path)
      .withQueryParams(options)
      .withOAuth(authOptions)
      .build();

      RequestManager.oAuthPost(req)
      .then(res => resolve(res))
      .catch(err => reject(err));
    });
  };

  /**
  * getUsersGroups
  *
  * @access public
  * @param {string} id userID
  * @param {string} sort sort groups by
  * @returns {promise} returns groups if successful
  */
  function getUsersGroups(id, sort) {
    return new Promise((resolve, reject) => {
      if (!id) reject(wrongParamsError('getUsersGroups()', 'groupID'));

      const path = `${URL}/group/list/${id}.xml`;
      const options = { key: KEY };
      if (sort) options.sort = sort;
      const authOptions = _getAuthOptions();

      const req = Request.builder()
      .withPath(path)
      .withQueryParams(options)
      .build();

      RequestManager.get(req)
      .then(res => resolve(res))
      .catch(err => reject(err));
    });
  };

  /**
  * getGroupMembers
  *
  * @access public
  * @param {string} id group ID
  * @param {string} sort sort members by
  * @param {number} page optional page
  * @param {string} query search members by
  * @returns {promise} returns group members if successful
  */
  function getGroupMembers(id, params) {
    return new Promise((resolve, reject) => {
      if (!id) reject(wrongParamsError('getGroupMembers()', 'groupID'));
      const path = `${URL}/group/members/${id}.xml`;
      const options = { key: KEY, ...params };

      const req = Request.builder()
      .withPath(path)
      .withQueryParams(options)
      .build();

      RequestManager.get(req)
      .then(res => resolve(res))
      .catch(err => reject(err));
    });
  };

  /**
  * searchGroups
  *
  * @access public
  * @param {string} query search query
  * @param {number} page optional page
  * @returns {promise} returns groups matching the query
  */
  function searchGroups(query, page) {
    return new Promise((resolve, reject) => {
      if (!query) reject(wrongParamsError('searchGroups()', 'search query'));
      const path = `${URL}/group/search.xml`;
      const options = { page, key: KEY, q: query };

      const req = Request.builder()
      .withPath(path)
      .withQueryParams(options)
      .build();

      RequestManager.get(req)
      .then(res => resolve(res))
      .catch(err => reject(err));
    });
  };

  /**
  * getGroupInfo
  *
  * @access public
  * @param {string} id group ID
  * @param {object} params {string} sort, {order} 'a' or 'd'
  * @returns {promise} returns group info if successful
  */
  function getGroupInfo(id, params) {
    return new Promise((resolve, reject) => {
      if (!id) reject(wrongParamsError('getGroupInfo()', 'groupID'));
      const path = `${URL}/group/show/${id}.xml`;
      const options = { key: KEY, ...params };

      const req = Request.builder()
      .withPath(path)
      .withQueryParams(options)
      .build();

      RequestManager.get(req)
      .then(res => resolve(res))
      .catch(err => reject(err));
    });
  };

  /**
  * getNotifications
  *
  * @access public
  * @param {string} page optional page
  * @returns {promise} returns users notifications if successful
  */
  function getNotifications(page) {
    const fn_name = 'getNotifications()';
    return new Promise((resolve, reject) => {
      if (!OAUTHENTICATED) reject(noOAuthError(fn_name));

      const path = `${URL}/notifications.xml`;
      const authOptions = _getAuthOptions();
      const options = page ? { page } : {};

      const req = Request.builder()
      .withPath(path)
      .withQueryParams(options)
      .withOAuth(authOptions)
      .build();

      RequestManager.oAuthGet(req)
      .then(res => resolve(res))
      .catch(err => reject(err));
    });
  };

  /**
  * getOwnedBooks
  *
  * @access public
  * @param {string} id user ID
  * @param {number} page optional page of results
  * @returns {promise} returns list of books owned by the given user
  */
  function getOwnedBooks(id, page) {
    const fn_name = 'getOwnedBooks()';
    return new Promise((resolve, reject) => {
      if (!id) reject(wrongParamsError(fn_name, 'userID'));
      if (!OAUTHENTICATED) reject(noOAuthError(fn_name));

      const path = `${URL}/owned_books/user`;
      const options = { format: 'xml', id };
      if (page) options.page = page;
      const authOptions = _getAuthOptions();

      const req = Request.builder()
      .withPath(path)
      .withQueryParams(options)
      .withOAuth(authOptions)
      .build();

      RequestManager.oAuthGet(req)
      .then(res => resolve(res))
      .catch(err => reject(err));
    });
  };

  /**
  * deleteOwnedBook
  *
  * @access public
  * @param {string} id book ID
  * @returns {promise}
  */
  function deleteOwnedBook(id) {
    const fn_name = 'deleteOwnedBook()';
    return new Promise((resolve, reject) => {
      if (!id) reject(wrongParamsError(fn_name, 'bookID'));
      if (!OAUTHENTICATED) reject(noOAuthError(fn_name));

      const path = `${URL}/owned_books/destroy/ID`;
      const options = { id, format: 'xml' };
      const authOptions = _getAuthOptions();

      const req = Request.builder()
      .withPath(path)
      .withQueryParams(options)
      .withOAuth(authOptions)
      .build();

      RequestManager.oAuthPost(req)
      .then(res => resolve(res))
      .catch(err => reject(err));
    });
  };

  /**
  * unlikeResource
  *
  * @access public
  * @param {string} id ressource ID
  * @returns {promise}
  */
  function unlikeResource(id) {
    const fn_name = 'unlikeResource()';
    return new Promise((resolve, reject) => {
      if (!id) reject(wrongParamsError(fn_name, 'resourceID'));
      if (!OAUTHENTICATED) reject(noOAuthError(fn_name));

      const path = `${URL}/rating`;
      const options = { id, format: 'xml' };
      const authOptions = _getAuthOptions();

      const req = Request.builder()
      .withPath(path)
      .withQueryParams(options)
      .withOAuth(authOptions)
      .build();

      RequestManager.oAuthPost(req)
      .then(res => resolve(res))
      .catch(err => reject(err));
    });
  };

  /**
  * getReadStatus
  *
  * @access public
  * @param {string} id status ID
  * @returns {promise} returns read status if successful
  */
  function getReadStatus(id) {
    const path = `${URL}/read_statuses/${id}`;
    const options = { key: KEY, format: 'xml' };

    const req = Request.builder()
    .withPath(path)
    .withQueryParams(options)
    .build();

    return RequestManager.get(req);
  };

  /**
  * getRecommendation
  *
  * @access public
  * @param {string} id recommendation ID
  * @returns {promise} returns recommendation to given ID
  */
  function getRecommendation(id) {
    const fn_name = 'getRecommendation()';
    return new Promise((resolve, reject) => {
      if (!OAUTHENTICATED) reject(noOAuthError(fn_name));
      if (!id) reject(wrongParamsError(fn_name, 'recommendationID'));

      const path = `${URL}/recommendations/ID`;
      const options = { id, format: 'xml' };
      const authOptions = _getAuthOptions();

      const req = Request.builder()
      .withPath(path)
      .withQueryParams(options)
      .withOAuth(authOptions)
      .build();

      RequestManager.oAuthGet(req)
      .then(res => resolve(res))
      .catch(err => reject(err));
    });
  };

  /**
  * deleteReview
  *
  * @access public
  * @param {string} id review ID
  * @returns {promise}
  */
  function deleteReview(id) {
    const path = `${URL}/review/destroy`;
    const options = { id, format: 'xml' };
    const authOptions = _getAuthOptions();

    const req = Request.builder()
    .withPath(path)
    .withQueryParams(options)
    .withOAuth(authOptions)
    .build();

    return RequestManager.oAuthDelete(req);
  };

  /**
  * getBooksOnUserShelf
  *
  * @access public
  * @param {string} id user ID
  * @param {string} shelf name of users shelf
  * @param {object} queryOptions object with properties: sort {string}, query {string}, oder {'a' or 'd'}, page {number}, per_page {number, 1-200}
  * @returns {promise} returns books on the given shelf
  */
  function getBooksOnUserShelf(id, shelf, queryOptions) {
    const fn_name = 'getBooksOnUserShelf()';
    return new Promise((resolve, reject) => {
      if (!OAUTHENTICATED) reject(noOAuthError(fn_name));
      if (!id) reject(wrongParamsError(fn_name, 'userID'));
      if (!shelf) reject(wrongParamsError(fn_name, 'shelf'));

      const path = `${URL}/review/list`;
      const options = {
        id,
        shelf,
        key: KEY,
        format: 'xml',
        ...queryOptions,
      };
      const authOptions = _getAuthOptions();

      const req = Request.builder()
      .withPath(path)
      .withQueryParams(options)
      .withOAuth(authOptions)
      .build();

      RequestManager.oAuthGet(req)
      .then(res => resolve(res))
      .catch(err => reject(err));
    });
  };

  /**
   * getRecentReviews
   *
   * @access public
   * @returns {promise} return recent reviews if successful
   */
  function getRecentReviews() {
    return new Promise((resolve, reject) => {
      const path = `${URL}/review/recent_reviews.xml`;
      const options = { key: KEY };

      const req = Request.builder()
      .withPath(path)
      .withQueryParams(options)
      .build();

      RequestManager.get(req)
      .then(res => resolve(res.reviews.review))
      .catch(err => reject(err));
    });
  };

  /**
  * getReview
  *
  * @access public
  * @param {string} id review ID
  * @param {number} page optional page of results
  * @returns {promise} returns review if successful
  */
  function getReview(id, page) {
    const path = `${URL}/review/show.xml`;
    const options = { id, page, key: KEY };

    const req = Request.builder()
    .withPath(path)
    .withQueryParams(options)
    .build();

    return RequestManager.get(req);
  };

  /**
  * getUsersReviewForBook
  *
  * @access public
  * @param {string} user_id user ID
  * @param {string} book_id book ID
  * @returns {promise} returns given users review for the given book
  */
  function getUsersReviewForBook(user_id, book_id) {
    const path = `${URL}/review/show_by_user_and_book.xml`;
    const options = { user_id, book_id, key: KEY };

    const req = Request.builder()
    .withPath(path)
    .withQueryParams(options)
    .build();

    return RequestManager.get(req);
  };

  /**
  * getById
  *
  * @access public
  * @param {string} id user status ID
  * @returns {promise} returns status if successful
  */
  function getUserStatus(id) {
    const path = `${URL}/user_status/show/${id}`;
    const options = { key: KEY, format: 'xml' };

    const req = Request.builder()
    .withPath(path)
    .withQueryParams(options)
    .build();

    return RequestManager.get(req);
  };

  /**
  * getRecentStatuses
  *
  * @access public
  * @returns {promise} returns recents statuses if successful
  */
  function getRecentStatuses() {
    const path = `${URL}/user_status/index.xml`;

    const req = Request.builder()
    .withPath(path)
    .withResponseKey('updates')
    .build();

    return RequestManager.get(req);
  };


  function getEvents(params) {
    const path = `${URL}/event/index.xml`;
    const options = { key: KEY, ...params }

    const req = Request.builder()
    .withPath(path)
    .withQueryParams(options)
    .withResponseKey('events')
    .build();

    return RequestManager.get(req);
  };

  /**
   * search
   *
   * @access public
   * @param {object} params q: query, page: page of results, field: one of 'title', 'author' or 'all' (default)
   * @returns {promise} returns search results if successful
   */
  function searchBooks(params) {
    const path = `${URL}/search/index.xml`;
    const options = { key: KEY, ...params };

    const req = Request.builder()
    .withPath(path)
    .withQueryParams(options)
    .build();

    return RequestManager.get(req);
  };

  /**
   * searchAuthors
   *
   * @access public
   * @param {string} authorName author name to search for
   * @returns {promise} returns author object if successful
   */
  function searchAuthors(authorName) {
    const path = `${URL}/api/author_url/${authorName}`;
    const options = { key: KEY };

    const req = Request.builder()
    .withPath(path)
    .withQueryParams(options)
    .build();

    return RequestManager.get(req);
  };

  return {
    initOAuth,
    getRequestToken,
    getAccessToken,
    getBooksByAuthor,
    getAuthorInfo,
    getAllSeriesByAuthor,
    getRecentStatuses,
    getBooksOnUserShelf,
    getUsersReviewForBook,
    getUserStatus,
    getUserInfo,
    getUsersShelves,
    getRecentReviews,
    getUsersGroups,
    getGroupInfo,
    getReview,
    addBookToShelf,
    getOwnedBooks,
    searchBooks,
    searchAuthors,
    followAuthor,
    unfollowAuthor,
    showFollowing,
    getUserFollowings,
  };
};

exports = module.exports = Goodreads;
