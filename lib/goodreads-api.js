'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var OAuth = require('oauth').OAuth;
var Request = require('./base-request');

var _require = require('./goodreads-error'),
    GoodreadsApiError = _require.GoodreadsApiError,
    noOAuthError = _require.noOAuthError,
    wrongParamsError = _require.wrongParamsError,
    logWarning = _require.logWarning;

var RequestManager = require('./goodreads-request');

/**
 * Goodreads
 *
 * @access public
 * @param {object} credentials Object with API key and secret
 * @param {string} callbackURL callbackURL to get user access
 * @returns {object} Goodreads API object
 */
var Goodreads = function Goodreads(credentials, callbackURL) {
  if (!credentials || !credentials.key || !credentials.secret) throw new GoodreadsApiError('Please pass your API key and secret.', 'Goodreads()');
  if (callbackURL) initOAuth(callbackURL);

  var URL = 'https://goodreads.com';
  var KEY = credentials.key;
  var SECRET = credentials.secret;

  var OAUTH = void 0;
  var ACCESS_TOKEN = void 0;
  var ACCESS_TOKEN_SECRET = void 0;
  var OAUTH_TOKEN = void 0;
  var OAUTH_TOKEN_SECRET = void 0;
  var OAUTHENTICATED = false;

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
    return { ACCESS_TOKEN: ACCESS_TOKEN, ACCESS_TOKEN_SECRET: ACCESS_TOKEN_SECRET };
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
    return { OAUTH_TOKEN: OAUTH_TOKEN, OAUTH_TOKEN_SECRET: OAUTH_TOKEN_SECRET };
  };

  /**
   * _getAuthOptions
   *
   * @access private
   */
  function _getAuthOptions() {
    return _extends({}, _getAccessToken(), { OAUTH: OAUTH });
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

    var requestURL = URL + '/oauth/request_token';
    var accessURL = URL + '/oauth/access_token';
    var version = '1.0';
    var encryption = 'HMAC-SHA1';

    OAUTH = new OAuth(requestURL, accessURL, KEY, SECRET, version, callbackURL, encryption);
  };

  /**
   * getRequestToken
   *
   * @access public
   */
  function getRequestToken() {
    return new Promise(function (resolve, reject) {

      if (!OAUTH) reject(noOAuthError('getRequestToken()'));

      OAUTH.getOAuthRequestToken(function (error, oAuthToken, oAuthTokenSecret, results) {
        if (error) reject(new GoodreadsApiError(error.message, 'getRequestToken()'));

        var url = URL + '/oauth/authorize?oauth_token=' + oAuthToken + '&oauth_callback=' + OAUTH._authorize_callback;
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
    return new Promise(function (resolve, reject) {
      var _getOAuthToken2 = _getOAuthToken(),
          OAUTH_TOKEN = _getOAuthToken2.OAUTH_TOKEN,
          OAUTH_TOKEN_SECRET = _getOAuthToken2.OAUTH_TOKEN_SECRET;

      if (OAUTH_TOKEN && OAUTH_TOKEN_SECRET && OAUTH) {

        OAUTH.getOAuthAccessToken(OAUTH_TOKEN, OAUTH_TOKEN_SECRET, 1, function (error, accessToken, accessTokenSecret, results) {
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
    var fn_name = 'followAuthor()';
    return new Promise(function (resolve, reject) {
      if (!id) reject(wrongParamsError(fn_name, 'authorID'));
      if (!OAUTHENTICATED) reject(noOAuthError(fn_name));

      var path = URL + '/author_followings';
      var options = { id: id, format: 'xml' };
      var authOptions = _getAuthOptions();

      var req = Request.builder().withPath(path).withQueryParams(options).withOAuth(authOptions).build();

      RequestManager.oAuthPost(req).then(function (res) {
        return resolve(res);
      }).catch(function (err) {
        return reject(err);
      });
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
    var fn_name = 'unfollowAuthor()';
    return new Promise(function (resolve, reject) {
      if (!id) reject(wrongParamsError(fn_name, 'authorID'));
      if (!OAUTHENTICATED) reject(noOAuthError(fn_name));

      var path = URL + '/author_followings/' + id;
      var options = { format: 'xml' };
      var authOptions = _getAuthOptions();

      var req = Request.builder().withPath(path).withQueryParams(options).withOAuth(authOptions).build();

      RequestManager.oAuthDelete(req).then(function (res) {
        return resolve(res);
      }).catch(function (err) {
        return reject(err);
      });
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
    var fn_name = 'showFollowings()';
    return new Promise(function (resolve, reject) {
      if (!id) reject(wrongParamsError(fn_name, 'authorFollowingID'));
      if (!OAUTHENTICATED) reject(noOAuthError(fn_name));

      var path = URL + '/author_followings/' + id;
      var options = { format: 'xml' };
      var authOptions = _getAuthOptions();

      var req = Request.builder().withPath(path).withQueryParams(options).withOAuth(authOptions).build();

      RequestManager.oAuthGet(req).then(function (res) {
        return resolve(res);
      }).catch(function (err) {
        return reject(err);
      });
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
    var fn_name = 'getUserFollowings()';
    return new Promise(function (resolve, reject) {
      if (!id) reject(wrongParamsError(fn_name, 'userID'));
      if (!OAUTHENTICATED) reject(noOAuthError(fn_name));

      var path = URL + '/user/' + id + '/following.xml';
      var options = { key: KEY };
      var authOptions = _getAuthOptions();

      var req = Request.builder().withPath(path).withQueryParams(options).withOAuth(authOptions).build();

      RequestManager.oAuthGet(req).then(function (res) {
        return resolve(res);
      }).catch(function (err) {
        return reject(err);
      });
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
    var fn_name = 'getBooksByAuthor()';
    return new Promise(function (resolve, reject) {
      if (!id) reject(wrongParamsError(fn_name, 'authorID'));

      var path = URL + '/author/list/' + id;
      var options = { format: 'xml', key: KEY };
      if (page) options.page = page;

      var req = Request.builder().withPath(path).withQueryParams(options).build();

      RequestManager.get(req).then(function (res) {
        return resolve(res);
      }).catch(function (err) {
        return reject(err);
      });
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
    var fn_name = 'getAuthorInfo()';
    return new Promise(function (resolve, reject) {
      if (!id) reject(wrongParamsError(fn_name, 'authorID'));

      var path = URL + '/author/show/' + id;
      var options = { key: KEY, format: 'xml' };

      var req = Request.builder().withPath(path).withQueryParams(options).build();

      RequestManager.get(req).then(function (res) {
        return resolve(res);
      }).catch(function (err) {
        return reject(err);
      });
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
    var fn_name = 'getAllSeriesByAuthor()';
    return new Promise(function (resolve, reject) {
      if (!id) reject(wrongParamsError(fn_name, 'authorID'));

      var path = URL + '/series/list';
      var options = {
        id: id,
        key: KEY,
        format: 'xml'
      };

      var req = Request.builder().withPath(path).withQueryParams(options).build();

      RequestManager.get(req).then(function (res) {
        return resolve(res);
      }).catch(function (err) {
        return reject(err);
      });
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
    var fn_name = 'getUserInfo()';
    return new Promise(function (resolve, reject) {
      if (!id) reject(wrongParamsError(fn_name, 'userID'));

      var path = URL + '/user/show/' + id + '.xml';
      var options = { key: KEY };

      var req = Request.builder().withPath(path).withQueryParams(options).build();

      RequestManager.get(req).then(function (res) {
        return resolve(res);
      }).catch(function (err) {
        return reject(err);
      });
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
    var fn_name = 'addBookToShelf()';
    return new Promise(function (resolve, reject) {
      if (!book_id) reject(wrongParamsError(fn_name, 'bookID'));
      if (!shelf) reject(wrongParamsError(fn_name, 'shelfName'));
      if (!OAUTHENTICATED) reject(noOAuthError(fn_name));

      var path = URL + '/shelf/add_to_shelf.xml';
      var authOptions = _getAuthOptions();
      var options = { book_id: book_id, name: shelf };

      var req = Request.builder().withPath(path).withQueryParams(options).withOAuth(authOptions).build();

      RequestManager.oAuthPost(req).then(function (res) {
        return resolve(res);
      }).catch(function (err) {
        return reject(err);
      });
    });
  }

  // TODO
  function addBooksToShelves(bookids, shelves) {
    var path = URL + '/shelves/ad_book_to_shelves.xml';
    var options = { bookids: bookids, shelves: shelves };
    var authOptions = _getAuthOptions();

    var req = Request.builder().withPath(path).withQueryParams(options).withOAuth(authOptions).build();

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
    var fn_name = 'getUsersShelves()';
    return new Promise(function (resolve, reject) {
      if (!id) reject(wrongParamsError(fn_name, 'userID'));

      var path = URL + '/shelf/list.xml';
      var options = { user_id: id, key: KEY };

      var req = Request.builder().withPath(path).withQueryParams(options).build();

      RequestManager.get(req).then(function (res) {
        return resolve(res);
      }).catch(function (err) {
        return reject(err);
      });
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
    var fn_name = 'followUser()';
    return new Promise(function (resolve, reject) {
      if (!id) reject(wrongParamsError(fn_name, 'userID'));
      if (!OAUTHENTICATED) reject(noOAuthError(fn_name));

      var path = URL + '/user/' + id + '/followers';
      var options = { format: 'xml' };
      var authOptions = _getAuthOptions();

      var req = Request.builder().withPath(path).withQueryParams(options).withOAuth(authOptions).build();

      RequestManager.oAuthGet(req).then(function (res) {
        return resolve(res);
      }).catch(function (err) {
        return reject(err);
      });
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
    var fn_name = 'getFriendRequests()';
    return Promise(function (resolve, reject) {
      if (!OAUTHENTICATED) reject(noOAuthError(fn_name));

      var path = URL + '/friend/requests.xml';
      var authOptions = _getAuthOptions();
      var options = page ? { page: page } : {};

      var req = Request.builder().withPath(path).withQueryParams(options).withOAuth(authOptions).build();

      RequestManager.oAuthGet(req).then(function (res) {
        return resolve(res);
      }).catch(function (err) {
        return resolve(err);
      });
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

    var path = URL + '/comment.xml';
    var options = { type: type, id: id, comment: comment };
    var authOptions = _getAuthOptions();

    var req = Request.builder().withPath(path).withQueryParams(options).withOAuth(authOptions).build();

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
    var fn_name = 'answerFriendRecommendation()';
    return new Promise(function (resolve, reject) {
      if (!id) reject(wrongParamsError(fn_name, 'recommendationID'));
      if (!response) reject(wrongParamsError(fn_name, 'response'));
      if (!OAUTHENTICATED) reject(noOAuthError(fn_name));

      var path = URL + '/friend/confirm_recommendation.xml';
      var options = { id: id, response: response };
      var authOptions = _getAuthOptions();

      var req = Request.builder().withPath(path).withQueryParams(options).withOAuth(authOptions).build();

      RequestManager.oAuthPost(req).then(function (res) {
        return resolve(res);
      }).catch(function (err) {
        return reject(err);
      });
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
    var fn_name = 'answerFriendRequest()';
    return new Promise(function (resolve, reject) {
      if (!id) reject(wrongParamsError(fn_name, 'requestID'));
      if (!response) reject(wrongParamsError(fn_name, 'response'));
      if (!OAUTHENTICATED) reject(noOAuthError(fn_name));

      var path = URL + '/friend/confirm_request.xml';
      var options = { id: id, response: response };
      var authOptions = _getAuthOptions();

      var req = Request.builder().withPath(path).withQueryParams(options).withOAuth(authOptions).build();

      RequestManager.oAuthPost(req).then(function (res) {
        return resolve(res);
      }).catch(function (err) {
        return reject(err);
      });
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
    var fn_name = 'addFriend()';
    return new Promise(function (resolve, reject) {
      if (!id) reject(wrongParamsError(fn_name, 'userID'));
      if (!OAUTHENTICATED) reject(noOAuthError(fn_name));

      var path = URL + '/friend/add_as_friend.xml';
      var options = { id: id };
      var authOptions = _getAuthOptions();

      var req = Request.builder().withPath(path).withQueryParams(options).withOAuth(authOptions).build();

      RequestManager.oAuthPost(req).then(function (res) {
        return resolve(res);
      }).catch(function (err) {
        return reject(err);
      });
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
    var fn_Name = 'joinGroup()';
    return new Promise(function (resolve, reject) {
      if (!id) reject(wrongParamsError(fn_name, 'groupID'));
      if (!OAUTHENTICATED) reject(noOAuthError(fn_name));

      var path = URL + '/group/join';
      var options = { id: id };
      var authOptions = _getAuthOptions();

      var req = Request.builder().withPath(path).withQueryParams(options).withOAuth(authOptions).build();

      RequestManager.oAuthPost(req).then(function (res) {
        return resolve(res);
      }).catch(function (err) {
        return reject(err);
      });
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
    return new Promise(function (resolve, reject) {
      if (!id) reject(wrongParamsError('getUsersGroups()', 'groupID'));

      var path = URL + '/group/list/' + id + '.xml';
      var options = { key: KEY };
      if (sort) options.sort = sort;
      var authOptions = _getAuthOptions();

      var req = Request.builder().withPath(path).withQueryParams(options).build();

      RequestManager.get(req).then(function (res) {
        return resolve(res);
      }).catch(function (err) {
        return reject(err);
      });
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
    return new Promise(function (resolve, reject) {
      if (!id) reject(wrongParamsError('getGroupMembers()', 'groupID'));
      var path = URL + '/group/members/' + id + '.xml';
      var options = _extends({ key: KEY }, params);

      var req = Request.builder().withPath(path).withQueryParams(options).build();

      RequestManager.get(req).then(function (res) {
        return resolve(res);
      }).catch(function (err) {
        return reject(err);
      });
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
    return new Promise(function (resolve, reject) {
      if (!query) reject(wrongParamsError('searchGroups()', 'search query'));
      var path = URL + '/group/search.xml';
      var options = { page: page, key: KEY, q: query };

      var req = Request.builder().withPath(path).withQueryParams(options).build();

      RequestManager.get(req).then(function (res) {
        return resolve(res);
      }).catch(function (err) {
        return reject(err);
      });
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
    return new Promise(function (resolve, reject) {
      if (!id) reject(wrongParamsError('getGroupInfo()', 'groupID'));
      var path = URL + '/group/show/' + id + '.xml';
      var options = _extends({ key: KEY }, params);

      var req = Request.builder().withPath(path).withQueryParams(options).build();

      RequestManager.get(req).then(function (res) {
        return resolve(res);
      }).catch(function (err) {
        return reject(err);
      });
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
    var fn_name = 'getNotifications()';
    return new Promise(function (resolve, reject) {
      if (!OAUTHENTICATED) reject(noOAuthError(fn_name));

      var path = URL + '/notifications.xml';
      var authOptions = _getAuthOptions();
      var options = page ? { page: page } : {};

      var req = Request.builder().withPath(path).withQueryParams(options).withOAuth(authOptions).build();

      RequestManager.oAuthGet(req).then(function (res) {
        return resolve(res);
      }).catch(function (err) {
        return reject(err);
      });
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
    var fn_name = 'getOwnedBooks()';
    return new Promise(function (resolve, reject) {
      if (!id) reject(wrongParamsError(fn_name, 'userID'));
      if (!OAUTHENTICATED) reject(noOAuthError(fn_name));

      var path = URL + '/owned_books/user';
      var options = { format: 'xml', id: id };
      if (page) options.page = page;
      var authOptions = _getAuthOptions();

      var req = Request.builder().withPath(path).withQueryParams(options).withOAuth(authOptions).build();

      RequestManager.oAuthGet(req).then(function (res) {
        return resolve(res);
      }).catch(function (err) {
        return reject(err);
      });
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
    var fn_name = 'deleteOwnedBook()';
    return new Promise(function (resolve, reject) {
      if (!id) reject(wrongParamsError(fn_name, 'bookID'));
      if (!OAUTHENTICATED) reject(noOAuthError(fn_name));

      var path = URL + '/owned_books/destroy/ID';
      var options = { id: id, format: 'xml' };
      var authOptions = _getAuthOptions();

      var req = Request.builder().withPath(path).withQueryParams(options).withOAuth(authOptions).build();

      RequestManager.oAuthPost(req).then(function (res) {
        return resolve(res);
      }).catch(function (err) {
        return reject(err);
      });
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
    var fn_name = 'unlikeResource()';
    return new Promise(function (resolve, reject) {
      if (!id) reject(wrongParamsError(fn_name, 'resourceID'));
      if (!OAUTHENTICATED) reject(noOAuthError(fn_name));

      var path = URL + '/rating';
      var options = { id: id, format: 'xml' };
      var authOptions = _getAuthOptions();

      var req = Request.builder().withPath(path).withQueryParams(options).withOAuth(authOptions).build();

      RequestManager.oAuthPost(req).then(function (res) {
        return resolve(res);
      }).catch(function (err) {
        return reject(err);
      });
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
    var path = URL + '/read_statuses/' + id;
    var options = { key: KEY, format: 'xml' };

    var req = Request.builder().withPath(path).withQueryParams(options).build();

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
    var fn_name = 'getRecommendation()';
    return new Promise(function (resolve, reject) {
      if (!OAUTHENTICATED) reject(noOAuthError(fn_name));
      if (!id) reject(wrongParamsError(fn_name, 'recommendationID'));

      var path = URL + '/recommendations/ID';
      var options = { id: id, format: 'xml' };
      var authOptions = _getAuthOptions();

      var req = Request.builder().withPath(path).withQueryParams(options).withOAuth(authOptions).build();

      RequestManager.oAuthGet(req).then(function (res) {
        return resolve(res);
      }).catch(function (err) {
        return reject(err);
      });
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
    var path = URL + '/review/destroy';
    var options = { id: id, format: 'xml' };
    var authOptions = _getAuthOptions();

    var req = Request.builder().withPath(path).withQueryParams(options).withOAuth(authOptions).build();

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
    var fn_name = 'getBooksOnUserShelf()';
    return new Promise(function (resolve, reject) {
      if (!OAUTHENTICATED) reject(noOAuthError(fn_name));
      if (!id) reject(wrongParamsError(fn_name, 'userID'));
      if (!shelf) reject(wrongParamsError(fn_name, 'shelf'));

      var path = URL + '/review/list';
      var options = _extends({
        id: id,
        shelf: shelf,
        key: KEY,
        format: 'xml'
      }, queryOptions);
      var authOptions = _getAuthOptions();

      var req = Request.builder().withPath(path).withQueryParams(options).withOAuth(authOptions).build();

      RequestManager.oAuthGet(req).then(function (res) {
        return resolve(res);
      }).catch(function (err) {
        return reject(err);
      });
    });
  };

  /**
   * getRecentReviews
   *
   * @access public
   * @returns {promise} return recent reviews if successful
   */
  function getRecentReviews() {
    return new Promise(function (resolve, reject) {
      var path = URL + '/review/recent_reviews.xml';
      var options = { key: KEY };

      var req = Request.builder().withPath(path).withQueryParams(options).build();

      RequestManager.get(req).then(function (res) {
        return resolve(res.reviews.review);
      }).catch(function (err) {
        return reject(err);
      });
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
    var path = URL + '/review/show.xml';
    var options = { id: id, page: page, key: KEY };

    var req = Request.builder().withPath(path).withQueryParams(options).build();

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
    var path = URL + '/review/show_by_user_and_book.xml';
    var options = { user_id: user_id, book_id: book_id, key: KEY };

    var req = Request.builder().withPath(path).withQueryParams(options).build();

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
    var path = URL + '/user_status/show/' + id;
    var options = { key: KEY, format: 'xml' };

    var req = Request.builder().withPath(path).withQueryParams(options).build();

    return RequestManager.get(req);
  };

  /**
  * getRecentStatuses
  *
  * @access public
  * @returns {promise} returns recents statuses if successful
  */
  function getRecentStatuses() {
    var path = URL + '/user_status/index.xml';

    var req = Request.builder().withPath(path).withResponseKey('updates').build();

    return RequestManager.get(req);
  };

  function getEvents(params) {
    var path = URL + '/event/index.xml';
    var options = _extends({ key: KEY }, params);

    var req = Request.builder().withPath(path).withQueryParams(options).withResponseKey('events').build();

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
    var path = URL + '/search/index.xml';
    var options = _extends({ key: KEY }, params);

    var req = Request.builder().withPath(path).withQueryParams(options).build();

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
    var path = URL + '/api/author_url/' + authorName;
    var options = { key: KEY };

    var req = Request.builder().withPath(path).withQueryParams(options).build();

    return RequestManager.get(req);
  };

  return {
    initOAuth: initOAuth,
    getRequestToken: getRequestToken,
    getAccessToken: getAccessToken,
    getBooksByAuthor: getBooksByAuthor,
    getAuthorInfo: getAuthorInfo,
    getAllSeriesByAuthor: getAllSeriesByAuthor,
    getRecentStatuses: getRecentStatuses,
    getBooksOnUserShelf: getBooksOnUserShelf,
    getUsersReviewForBook: getUsersReviewForBook,
    getUserStatus: getUserStatus,
    getUserInfo: getUserInfo,
    getUsersShelves: getUsersShelves,
    getRecentReviews: getRecentReviews,
    getUsersGroups: getUsersGroups,
    getGroupInfo: getGroupInfo,
    getReview: getReview,
    addBookToShelf: addBookToShelf,
    getOwnedBooks: getOwnedBooks,
    searchBooks: searchBooks,
    searchAuthors: searchAuthors,
    followAuthor: followAuthor,
    unfollowAuthor: unfollowAuthor,
    showFollowing: showFollowing,
    getUserFollowings: getUserFollowings
  };
};

exports = module.exports = Goodreads;