A Goodreads API wrapper for node.js

![Goodreads](https://s.gr-assets.com/assets/press/thumbnail_logo-a0e66b2e27d2b52773b0ddab4e10ea4a.jpg)




## Installation

```bash
npm install --save goodreads-api-node
```
```js
const goodreads = require('goodreads-api-node');
```

## Usage

You need to register your app to get a [goodreads developer key](https://www.goodreads.com/api/keys)
With the developer key and secret you can now call `goodreads()`. This will return an object which exposes the API methods.

```js
const myCredentials = {
  key: 'MY_GOODREADS_KEY',
  secret: 'MY_GOODREADS_SECRET'
};

const gr = goodreads(myCredentials);
```
## API

Some of those API methods just need your key/secret. To make API calls on behalf of your user, you need to get their permission using oAuth. All methods on the goodreads object return an promise. The following methods all work without oAuth:

### getBooksByAuthor(authorID, [page])

```js
// returns all books by an author given the authorID
gr.getBooksByAuthor('175417')
.then(console.log);
```
This prints the following result:
```js
 { id: '175417',
   name: 'Bruce Schneier',
   link: 'https://www.goodreads.com/author/show/175417.Bruce_Schneier',
   books: { start: '1', end: '25', total: '25', book: [Object] }
 }
```
You can pass an optional `page` parameter specifying the result page you want to get.

##### getAuthorInfo(authorID)

##### getAllSeriesByAuthor(authorID)

##### getUserInfo(userID)

##### getUsersShelves(userID)

##### getUsersGroups(userID, [sort])

##### getGroupMembers(groupID, [params])

##### searchGroups(query, [page])

##### getGroupInfo(groupID, [params])

##### getRecentReviews()

##### getReview(reviewID, [page])

##### getUsersReviewForBook(userID, bookID)

##### getRecentStatuses()

##### showBook(bookID)

##### bookIDtoWorkID(bookId)

##### getSeries(seriesID)

##### getSeriesByWork(workID)

#### searchBooks([params]);
  #### @param {object} params q: query, page: page of results, field: one of 'title', 'author' or 'all' (default)
  #### Example Usage:
  ```js
    const res = await goodreads.searchBooks( { q: 'A song of ice and fire', page: 2, field: 'title' } );
  ```

## OAuth authentication and methods

  If you want to make requests on behalf of your user (e.g. them marking a book as 'read') you need to get their permission.
  The Goodreads API uses OAuth for this.

  There are two ways to initialize the oauth process.
  You can either pass a callbackURL to  the `goodreads()` function (which then calls `initOAuth()` for you) or you just call `gr.initOAuth()` after setting up your credentials. The callbackURL is not required for oauth to work, it's just used for goodreads to be able to redirect your user after granting/denying access.


  ```js
  // set callbackURL together with your key/secret
  const gr = goodreads(myCredentials, callbackURL);

  // or call initOAuth(callbackURL) after setting up your key/secret
  const gr = goodreads(myCredentials)
  gr.initOAuth(callbackURL);
  ```

  After this you should be able to call `getRequestToken()` to obtain a requestToken.
  You need the requestToken to inform your user about your app wanting to make requests with his account.

  ```js
  gr.getRequestToken()
  .then(url => { /* redirect your user to this url to ask for permission */ });
  ```
  `getRequestToken()` returns (a promise which resolves) a URL. You can now redirect your user to this URL to ask him for access to his account.
  The callbackURL provided in `initOAuth()` is then used to inform you about whether the user granted access.
  Goodreads will redirect to this url with the query params `oauth_token` and `authorize`.

  `http://yourapp.com/goodreads_oauth_callback?oauth_token=ezBHZc7C1SwvLGc646PEQ&authorize=1`

  For further information about the goodreads OAuth process: [Goodreads API Documentation](https://www.goodreads.com/api/documentation#oauth)


  If the user granted access you can now request an accessToken from the goodreadsAPI.

  ```js
  gr.getAccessToken()
  .then(() => { /* you can now make authenticated requests */ });
  ```

  That's it! You can now use the following methods:

##### getCurrentUserInfo()

##### followAuthor(authorID)

##### unfollowAuthor(authorID)

##### showFollowing(followingID)

##### getUserFollowings(userID)

##### addBooksToShelf(bookID, shelfName)

##### followUser(userID)

##### getRecommendation(recommendationID)

##### getFriendRequests([page])

##### answerFriendRecommendation(recommendationID, response)

##### answerFriendRequest(requestID, response)

##### addFriend(userID)

##### joinGroup(groupID)

##### getNotifications([page])

##### getOwnedBooks(userID, [page])

##### deleteOwnedBook(bookID)

##### unlikeResource(resourceID)

##### deleteReview(reviewID)

##### getBooksOnUserShelf(userID, shelfName, [queryOptions])

##### getCurrentUserInfo()

## Contribute

 - coming soon
