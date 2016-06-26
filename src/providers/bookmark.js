/**
 * @author Bertrand Chevrier <chevrier.bertrand@gmail.com>
 * @license GPLv3
 */

const provider = require('./provider.js');
const defaults = require('lodash.defaults');

//default paging options
const pagingOptions = {
    limit : 25
};

/**
 * Creates the bookmark provider
 * @param {String} dbLocation - the location of the SQLITE database file
 * @returns {Promise} that resolves with the bookmarkProvider
 */
const bookmarkProvider = function bookmarkProvider(dbLocation) {

    /**
     * @typedef bookmarkProvider
     */
    return provider(dbLocation, {

        /**
         * Get bookmarks
         * @param {String} [search = ''] - the search pattern for bookmarks,
         *                                 supports wildcard (*), dot (.), carret (^) and dollar ($)
         * @param {Object} [paging] - how to paginate the results
         * @param {Number} [paging.limit = 25] - the limit of results to get
         * @return {Promise} that resolves with the list of bookmarks
         */
        getBookmarks(search, paging){
            paging = defaults(paging || {}, pagingOptions);

            return new Promise( (resolve, reject) => {
                var statement;
                if(!search || search.trim().length === 0){
                    statement = this.getDb().prepare(`select url, title, icon from bookmarks order by created limit ${paging.limit}`);
                } else {
                    statement = this.getDb().prepare(`select url, title, icon from bookmarks where title like $search order by created limit ${paging.limit}`);
                    var nsearch =  this.normalizeLikeQuery(search);
                    console.log('normalize ', search, nsearch);
                    statement.bind({ $search :  nsearch });
                }
                statement.all( (err, result) => {
                    if(err){
                        return reject(err);
                    }
                    return resolve(result);
                }).finalize();
            });
        }
    });
};
module.exports = bookmarkProvider;
