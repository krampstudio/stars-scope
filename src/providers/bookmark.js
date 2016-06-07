const provider = require('./provider.js');

const bookmarkProvider = function bookmarkProvider(dbLocation) {

    return provider(dbLocation, {
        getBookmarks(search){
            return new Promise( (resolve, reject) => {
                if(!search || search.trim().length === 0){
                    this.getDb().all('select url, title from bookmarks limit 25', (err, result) => {
                        if(err){
                            return reject(err);
                        }
                        return resolve(result);
                    });
                }
            });
        }
    });
};
module.exports = bookmarkProvider;
