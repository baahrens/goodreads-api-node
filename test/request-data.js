const credentials = require('../.credentials');

module.exports = {
  getBooksByAuthor: {
    path: '/author/list/175417',
    response: "<GoodreadsResponse><Request></Request><author><books></books><id></id><link></link><name></name></author></GoodreadsResponse>",
    query: { key: credentials.key, format: 'xml' },
  },
  followAuthor: {
    path: '/author_followings',
    response: 'TODO',
    query: { id: '175417', format: 'xml' },
  },
  unfollowAuthor: {
    path: '/author_followings/175417',
    response: 'TODO',
    query: { format: 'xml' },
  },
  showFollowing: {
    path: '/author_followings/175417',
    response: 'TODO',
    query: { format: 'xml' },
  },
  getUserFollowings: {
    path: '/user/175417/following.xml',
    response: 'TODO',
    query: { key: credentials.key },
  },
  getAuthorInfo: {
    path: '/author/show/175417',
    response: "<GoodreadsResponse><Request></Request><author><books></books><id></id><link></link><fans_count></fans_count><name></name></author></GoodreadsResponse>",
    query: { key: credentials.key, format: 'xml' },
  },
  getAllSeriesByAuthor: {
    path: '/series/list',
    response: `<GoodreadsResponse><Request><authentication>true</authentication><key><![CDATA[ Md4G9irkERWl7a6PUZmiFA ]]></key><method><![CDATA[ series_list ]]></method></Request><series_works><series_work><id>331195</id><user_position>1</user_position><series><id>72147</id><title><![CDATA[ The Ballet Family ]]></title><description><![CDATA[ ]]></description><note><![CDATA[ ]]></note><series_works_count>2</series_works_count><primary_work_count>2</primary_work_count><numbered>true</numbered></series><work><id>2073855</id><best_book><id>2068620</id><title>The Ballet Family (The Ballet Family, #1)</title><author><id>4114801</id><name>Mabel Esther Allan</name></author><image_url><![CDATA[https://s.gr-assets.com/assets/nophoto/book/111x148-bcc042a9c91a29c1d680899eff700a03.png]]></image_url></best_book><books_count>4</books_count><original_publication_day/><original_publication_month/><original_publication_year>1963</original_publication_year><original_title>The Ballet Family</original_title><ratings_count>63</ratings_count><ratings_sum>249</ratings_sum><reviews_count>122</reviews_count><text_reviews_count>10</text_reviews_count><average_rating/></work></series_work><series_work><id>144541</id><user_position>1</user_position><series><id>40321</id><title><![CDATA[ Drina ]]></title><description><![CDATA[ ]]></description><note><![CDATA[ ]]></note><series_works_count>11</series_works_count><primary_work_count>11</primary_work_count><numbered>true</numbered></series><work><id>6990</id><best_book><id>1151568</id><title>Ballet for Drina (Drina, #1)</title><author><id>227840</id><name>Jean Estoril</name></author><image_url><![CDATA[https://images.gr-assets.com/books/1326125793m/1151568.jpg]]></image_url></best_book><books_count>9</books_count><original_publication_day/><original_publication_month/><original_publication_year>1957</original_publication_year><original_title>Ballet for Drina</original_title><ratings_count>676</ratings_count><ratings_sum>2712</ratings_sum><reviews_count>1265</reviews_count><text_reviews_count>32</text_reviews_count><average_rating/></work></series_work></series_works></GoodreadsResponse>`,
    query: { id: '175417', key: credentials.key, format: 'xml' },
  },
  getUserInfo: {
    path: '/user/show/175417.xml',
    response: '<GoodreadsResponse><Request></Request><user><id></id></user></GoodreadsResponse>',
    query: { key: credentials.key },
  },
  getUsersShelves: {
    path: '/shelf/list.xml',
    response: '<GoodreadsResponse><Request></Request><shelves><user_shelf><id></id></user_shelf><user_shelf><id></id></user_shelf></shelves></GoodreadsResponse>',
    query: { user_id: '175417', key: credentials.key },
  },
  getUsersGroups: {
    path: '/group/list/175417.xml',
    response: '<GoodreadsResponse><Request></Request><groups><user></user><list></list></groups></GoodreadsResponse>',
    query: { key: credentials.key },
  },
  getGroupMembers: {
    path: '/group/members/12345.xml',
    response: '<GoodreadsResponse><Request></Request><group_users><group_user></group_user><group_user></group_user></group_users></GoodreadsResponse>',
    query: { key: credentials.key },
  },
};
