const defaults = require('lodash.defaults');
const iconCrawler = require('../lib/iconCrawler.js');
const bookmarkProvider = require('../providers/bookmark.js');

const serviceOptions = {
    dbLocation : 'src/bookmarks.sqlite',
    limit : -1,
    connectivity : true
};

const boomarkService = function boomarkService (options) {

    var running;

    options = defaults(options || {}, serviceOptions);



    return {

        getBookmarks( search ) {
            console.log('Search bookmarks')
            //open the provider
            return bookmarkProvider(options.dbLocation).then(provider => {
                const searchOptions = {};
                if(options.limit > 0){
                    searchOptions.limit = options.limit;
                }

                //query the bookmarks
                return provider.getBookmarks(search, searchOptions).then(bookmarks => {

                    if(!options.connectivity){
                        return bookmarks;
                    }

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
