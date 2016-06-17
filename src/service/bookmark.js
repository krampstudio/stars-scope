const defaults = require('lodash.defaults');
const iconCrawler = require('../lib/iconCrawler.js');
const bookmarkProvider = require('../providers/bookmark.js');

const serviceOptions = {
    dbLocation : 'src/bookmarks.sqlite'
};

const boomarkService = function boomarkService (options) {

    options = defaults(options || {}, serviceOptions);

    return {

        getBookmarks( search ) {

            //open the provider
            return bookmarkProvider(options.dbLocation).then(provider => {

                //query the bookmarks
                return provider.getBookmarks(search).then(bookmarks => {
console.log('Bookmarks', bookmarks.length)
                    //try to retrieve an icon for each of them
                    return Promise.all(bookmarks.map( bookmark => {
                        return iconCrawler(bookmark.url, { defaultIcon : bookmark.icon } ).then(icon => {
                            bookmark.icon = icon;
                            return bookmark;
                        });
                    }));

                //close the provider and resolve with the bookmarks
                }).then( bookmarks => {
                    provider.close();
                    console.log('Bookmarks', bookmarks.length)
                    return bookmarks;
                });
            });
        }

    };

};

module.exports = boomarkService;
