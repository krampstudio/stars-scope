const provider = require('./provider.js');
const defaults = require('lodash.defaults');

const pagingOptions = {
    limit : 25
};

const bookmarkProvider = function bookmarkProvider(dbLocation) {

    return provider(dbLocation, {

        getBookmarks(search, paging){
            paging = defaults(paging || {}, pagingOptions);

            return new Promise( (resolve, reject) => {
                var statement;
                if(!search || search.trim().length === 0){
                    statement = this.getDb().prepare(`select url, title, icon from bookmarks order by created limit ${paging.limit}`);
                } else {
                    statement = this.getDb().prepare(`select url, title, icon from bookmarks where title like $search order by created limit ${paging.limit}`);
                    statement.bind({ $search :  `%${search}%` });
                }
                statement.all( (err, result) => {
                    if(err){
                        return reject(err);
                    }
                    return resolve(result);
                });
            });
        }
    });
};
module.exports = bookmarkProvider;
