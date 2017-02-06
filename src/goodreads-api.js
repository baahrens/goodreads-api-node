const OAuth = require('oauth').OAuth;
const Request = require('./base-request');
const { GoodreadsApiError, noOAuthError, wrongParamsError, logWarning } = require('./goodreads-error');
const RequestManager = require('./goodreads-request');
const parseXML = require('./xml-parser');
const { get, oAuthGet, oAuthPost, oAuthDelete } = require('./goodreads-request');


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


  function _execute(fn, req, responseKey) {
    return new Promise((resolve, reject) => {
      fn(req)
      .then(res => parseXML(res))
      .then(res => {
        if (responseKey) resolve(res.GoodreadsResponse[responseKey]);
        else resolve(res.GoodreadsResponse);
      })
      .catch(err => reject(err));
    });
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
    if (!id) Promise.reject(wrongParamsError(fn_name, 'authorID'));
    if (!OAUTHENTICATED) Promise.reject(noOAuthError(fn_name));

    const path = `${URL}/author_followings`;
    const options = { id, format: 'xml' };
    const authOptions = _getAuthOptions();

    const req = Request.builder()
    .withPath(path)
    .withQueryParams(options)
    .withOAuth(authOptions)
    .build();

    return _execute(oAuthPost, req);
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
    if (!id) return Promise.reject(wrongParamsError(fn_name, 'authorID'));
    if (!OAUTHENTICATED) return Promise.reject(noOAuthError(fn_name));

    const path = `${URL}/author_followings/${id}`;
    const options = { format: 'xml' };
    const authOptions = _getAuthOptions();

    const req = Request.builder()
    .withPath(path)
    .withQueryParams(options)
    .withOAuth(authOptions)
    .build();

    return _execute(oAuthDelete, req);
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
    if (!id) return Promise.reject(wrongParamsError(fn_name, 'authorFollowingID'));
    if (!OAUTHENTICATED) return Promise.reject(noOAuthError(fn_name));

    const path = `${URL}/author_followings/${id}`;
    const options = { format: 'xml' };
    const authOptions = _getAuthOptions();

    const req = Request.builder()
    .withPath(path)
    .withQueryParams(options)
    .withOAuth(authOptions)
    .build();

    return _execute(oAuthGet, req);
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
    if (!id) return Promise.reject(wrongParamsError(fn_name, 'userID'));
    if (!OAUTHENTICATED) return Promise.reject(noOAuthError(fn_name));

    const path = `${URL}/user/${id}/following.xml`;
    const options = { key: KEY };
    const authOptions = _getAuthOptions();

    const req = Request.builder()
    .withPath(path)
    .withQueryParams(options)
    .withOAuth(authOptions)
    .build();

    return _execute(oAuthGet, req);
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
    if (!id) return Promise.reject(wrongParamsError(fn_name, 'authorID'));

    const path = `${URL}/author/list/${id}`;
    const options = { format: 'xml', key: KEY };
    if (page) options.page = page;

    const req = Request.builder()
    .withPath(path)
    .withQueryParams(options)
    .build()

    return _execute(get, req, 'author');
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
    if (!id) return Promise.reject(wrongParamsError(fn_name, 'authorID'));

    const path = `${URL}/author/show/${id}`;
    const options = { key: KEY, format: 'xml' };

    const req = Request.builder()
    .withPath(path)
    .withQueryParams(options)
    .build();

    return _execute(get, req);
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
    if (!id) return Promise.reject(wrongParamsError(fn_name, 'authorID'));

    const path = `${URL}/series/list`;
    const options = { id, key: KEY, format: 'xml' };

    const req = Request.builder()
    .withPath(path)
    .withQueryParams(options)
    .build();

    return _execute(get, req);
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
    if (!id) return Promise.reject(wrongParamsError(fn_name, 'userID'));

    const path = `${URL}/user/show/${id}.xml`;
    const options = { key: KEY };

    const req = Request.builder()
      .withPath(path)
      .withQueryParams(options)
      .build();

    return _execute(get, req);
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
    if (!book_id) return Promise.reject(wrongParamsError(fn_name, 'bookID'));
    if (!shelf) return Promise.reject(wrongParamsError(fn_name, 'shelfName'));
    if (!OAUTHENTICATED) return Promise.reject(noOAuthError(fn_name));

    const path = `${URL}/shelf/add_to_shelf.xml`;
    const authOptions = _getAuthOptions();
    const options = { book_id, name: shelf };

    const req = Request.builder()
    .withPath(path)
    .withQueryParams(options)
    .withOAuth(authOptions)
    .build();

    _execute(oAuthPost, req);
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

    return _excute(oAuthPost, req);
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
    if (!id) return Promise.reject(wrongParamsError(fn_name, 'userID'));

    const path = `${URL}/shelf/list.xml`;
    const options = { user_id: id, key: KEY };

    const req = Request.builder()
    .withPath(path)
    .withQueryParams(options)
    .build();

    return _execute(get, req);
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
    if (!id) return Promise.reject(wrongParamsError(fn_name, 'userID'));
    if (!OAUTHENTICATED) return Promise.reject(noOAuthError(fn_name));

    const path = `${URL}/user/${id}/followers`
    const options = { format: 'xml' };
    const authOptions = _getAuthOptions();

    const req = Request.builder()
    .withPath(path)
    .withQueryParams(options)
    .withOAuth(authOptions)
    .build();

    return _execute(oAuthGet, req);
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
    if (!OAUTHENTICATED) return Promise.reject(noOAuthError(fn_name));

    const path = `${URL}/friend/requests.xml`;
    const authOptions = _getAuthOptions();
    const options = page ? { page } : {};

    const req = Request.builder()
    .withPath(path)
    .withQueryParams(options)
    .withOAuth(authOptions)
    .build();

    return _execute(oAuthGet, req);
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

    return _execute(oAuthPost, req);
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
    if (!id) return Promise.reject(wrongParamsError(fn_name, 'recommendationID'));
    if (!response) return Promise.reject(wrongParamsError(fn_name, 'response'));
    if (!OAUTHENTICATED) return Promise.reject(noOAuthError(fn_name));

    const path = `${URL}/friend/confirm_recommendation.xml`;
    const options = { id, response };
    const authOptions = _getAuthOptions();

    const req = Request.builder()
    .withPath(path)
    .withQueryParams(options)
    .withOAuth(authOptions)
    .build();

    return _execute(oAuthPost, req);
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
    if (!id) return Promise.reject(wrongParamsError(fn_name, 'requestID'));
    if (!response) return Promise.reject(wrongParamsError(fn_name, 'response'));
    if (!OAUTHENTICATED) return Promise.reject(noOAuthError(fn_name));

    const path = `${URL}/friend/confirm_request.xml`;
    const options = { id, response };
    const authOptions = _getAuthOptions();

    const req = Request.builder()
    .withPath(path)
    .withQueryParams(options)
    .withOAuth(authOptions)
    .build();

    return _execute(oAuthPost, req);
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
    if (!id) return Promise.reject(wrongParamsError(fn_name, 'userID'));
    if (!OAUTHENTICATED) return Promise.reject(noOAuthError(fn_name));

    const path = `${URL}/friend/add_as_friend.xml`;
    const options = { id };
    const authOptions = _getAuthOptions();

    var req = Request.builder()
    .withPath(path)
    .withQueryParams(options)
    .withOAuth(authOptions)
    .build();

    return _execute(oAuthPost, req);
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
    if (!id) return Promise.reject(wrongParamsError(fn_name, 'groupID'));
    if (!OAUTHENTICATED) return Promise.reject(noOAuthError(fn_name));

    const path = `${URL}/group/join`;
    const options = { id };
    const authOptions = _getAuthOptions();

    var req = Request.builder()
    .withPath(path)
    .withQueryParams(options)
    .withOAuth(authOptions)
    .build();

    return _execute(oAuthPost, req);
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
    if (!id) return Promise.reject(wrongParamsError('getUsersGroups()', 'groupID'));

    const path = `${URL}/group/list/${id}.xml`;
    const options = { key: KEY };
    if (sort) options.sort = sort;
    const authOptions = _getAuthOptions();

    const req = Request.builder()
    .withPath(path)
    .withQueryParams(options)
    .build();

    return _execute(get, req);
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
    if (!id) return Promise.reject(wrongParamsError('getGroupMembers()', 'groupID'));

    const path = `${URL}/group/members/${id}.xml`;
    const options = { key: KEY, ...params };

    const req = Request.builder()
    .withPath(path)
    .withQueryParams(options)
    .build();

    return _execute(get, req);
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
    if (!query) return Promise.reject(wrongParamsError('searchGroups()', 'search query'));
    const path = `${URL}/group/search.xml`;
    const options = { page, key: KEY, q: query };

    const req = Request.builder()
    .withPath(path)
    .withQueryParams(options)
    .build();

    return _execute(get, req);
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
    if (!id) return Promise.reject(wrongParamsError('getGroupInfo()', 'groupID'));
    const path = `${URL}/group/show/${id}.xml`;
    const options = { key: KEY, ...params };

    const req = Request.builder()
    .withPath(path)
    .withQueryParams(options)
    .build();

    return _execute(get, req);
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
    if (!OAUTHENTICATED) return Promise.reject(noOAuthError(fn_name));

    const path = `${URL}/notifications.xml`;
    const authOptions = _getAuthOptions();
    const options = page ? { page } : {};

    const req = Request.builder()
    .withPath(path)
    .withQueryParams(options)
    .withOAuth(authOptions)
    .build();

    return _execute(oAuthGet, req);
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
    if (!id) return Promise.reject(wrongParamsError(fn_name, 'userID'));
    if (!OAUTHENTICATED) return Promise.reject(noOAuthError(fn_name));

    const path = `${URL}/owned_books/user`;
    const options = { format: 'xml', id };
    if (page) options.page = page;
    const authOptions = _getAuthOptions();

    const req = Request.builder()
    .withPath(path)
    .withQueryParams(options)
    .withOAuth(authOptions)
    .build();

    return _execute(oAuthGet, req);
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
    if (!id) return Promise.reject(wrongParamsError(fn_name, 'bookID'));
    if (!OAUTHENTICATED) return Promise.reject(noOAuthError(fn_name));

    const path = `${URL}/owned_books/destroy/ID`;
    const options = { id, format: 'xml' };
    const authOptions = _getAuthOptions();

    const req = Request.builder()
    .withPath(path)
    .withQueryParams(options)
    .withOAuth(authOptions)
    .build();

    return _execute(oAuthPost, req);
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
    if (!id) return Promise.reject(wrongParamsError(fn_name, 'resourceID'));
    if (!OAUTHENTICATED) return Promise.reject(noOAuthError(fn_name));

    const path = `${URL}/rating`;
    const options = { id, format: 'xml' };
    const authOptions = _getAuthOptions();

    const req = Request.builder()
    .withPath(path)
    .withQueryParams(options)
    .withOAuth(authOptions)
    .build();

    return _execute(oAuthPost, req);
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

    return _execute(get, req);
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
    if (!OAUTHENTICATED) return Promise.reject(noOAuthError(fn_name));
    if (!id) return Promise.reject(wrongParamsError(fn_name, 'recommendationID'));

    const path = `${URL}/recommendations/ID`;
    const options = { id, format: 'xml' };
    const authOptions = _getAuthOptions();

    const req = Request.builder()
    .withPath(path)
    .withQueryParams(options)
    .withOAuth(authOptions)
    .build();

    return _execute(oAuthGet, req);
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

    return _execute(oAuthDelete, req);
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
    if (!OAUTHENTICATED) return Promise.reject(noOAuthError(fn_name));
    if (!id) return Promise.reject(wrongParamsError(fn_name, 'userID'));
    if (!shelf) return Promise.reject(wrongParamsError(fn_name, 'shelf'));

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

    return _execute(oAuthGet, req);
  };

  /**
   * getRecentReviews
   *
   * @access public
   * @returns {promise} return recent reviews if successful
   */
  function getRecentReviews() {
    const path = `${URL}/review/recent_reviews.xml`;
    const options = { key: KEY };

    const req = Request.builder()
    .withPath(path)
    .withQueryParams(options)
    .build();

    return _execute(get, req);
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

    return _execute(get, req);
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

    return _execute(get, req);
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

    return _execute(get, req);
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

    return _execute(get, req);
  };


  function getEvents(params) {
    const path = `${URL}/event/index.xml`;
    const options = { key: KEY, ...params }

    const req = Request.builder()
    .withPath(path)
    .withQueryParams(options)
    .withResponseKey('events')
    .build();

    return _execute(get, req);
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

    return _execute(get, req);
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

    return _execute(get, req);
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
