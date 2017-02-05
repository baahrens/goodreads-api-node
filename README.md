# goodreads-api-node
A Goodreads API wrapper for node.js

## Installation

```bash
npm install --save goodreads-api-node
```
```js
const goodreads = require('goodreads-api-node');
```

## Usage

You need to register your app to get a goodreads developer key: https://www.goodreads.com/api/keys
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
.then(response => console.log(response));
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

### getAuthorInfo(authorID) 

```js
// returns infos about an author
gr.getAuthorInfo(authorID)
.then(response => { /* do something with the response */ });
```

### getAllSeriesByAuthor(authorID)

```js
// returns series the given author has worked on
goodreads.getAllSeriesByAuthor(authorID)
.then(response => { /* do something with the response */ });
```
### getUserInfo(userID)


```js
// returns info about the given user
gr.getUserInfo(userID)
.then(response => { /* do something with the response */ });
```

### getUsersShelves(userID)

```js
// returns the given users shelfs
gr.getUsersShelves(userID)
.then(response => { /* do something with the response */ });
```

### getUsersGroups(userID, [sort])

```js
// returns groups of the given user
gr.getUsersGroups(userID)
.then(response => { /* do something with the response */ });
```

### getGroupMembers(groupID, [params])

```js
// returns the members of a group
gr.getGroupMembers(groupID)
.then(response => { /* do something with the response */ });
```

### searchGroups(query, [page])

```js
// returns page 3 of the search results given the query 'programming'
gr.searchGroups('programming', 3)
.then(response => { /* do something with the response */ });
```

### getGroupInfo(groupID, [params])

```js
// returns infos about a group
gr.getGroupInfo('8095')
.then(response => { /* do something with the response */ });
```

### getRecentReviews()

```js
// returns recent reviews on goodreads
gr.getRecentReviews()
.then(response => { /* do something with the response */ });
```
### getReview(reviewID, [page])

```js
// returns a review by ID
gr.getReview(reviewID)
.then(response => { /* do something with the response */ });
```

### getUsersReviewForBook(userID, bookID)

```js
// returns the review from a user of a given book
gr.getUsersReviewForBook(userID, bookID)
.then(response => { /* do something with the response */ });
```

### getRecentStatuses()

```js
// returns recent statuses on goodreads
gr.getRecentStatuses()
.then(response => { /* do something with the response */ });
```

## OAuth authentication and methods

 - coming soon
 

## Tests

 - coming soon
 
 
## contribution

 - coming soon
