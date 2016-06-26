/**
 * @author Bertrand Chevrier <chevrier.bertrand@gmail.com>
 * @license GPLv3
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

/**
 * Creates a provider
 * @param {String} dbLocation - the location of the SQLITE database file
 * @param {Object} providerApi - the API of the provider to create. It will be augmented of getDb and close methods.
 * @returns {Promise} that resolves with the provider
 */
const providerFactory = function providerFactory(dbLocation, providerApi){

    /**
     * Creates the provider
     * @param {sqlite3.Database} db - the database connection
     * @returns {provider} the provider
     */
    const provider = function provider(db){
        if(!db || !(db instanceof sqlite3.Database) ){
            throw new TypeError('Please provide us with a database connection');
        }

        /**
         * @typedef provider
         */
        return Object.assign({

            /**
             * Get the current database connection
             * @returns {sqlite3.Database}
             */
            getDb(){
                return db;
            },

            /**
             * Transform a query with simple regex pattern (^$.*)
             * to a pattern that SQLITE will use to search inside LIKE clauses.
             * @param {String} query
             * @returns {String} the normalized query
             */
            normalizeLikeQuery(query) {
                var normalized;
                if(/^\^\$$/.test(query)){
                   normalized = query.replace(/^\^\$$/, '');
                } else if(/^\^/.test(query)){
                    normalized = query.replace(/^\^/, '') + '%';
                } else if(/\$$/.test(query)){
                    normalized = '%' + query.replace(/\$$/, '');
                } else {
                    normalized = `%${query}%`;
                }
                return normalized.replace(/\./g, '_')
                                .replace(/\*/g, '%')
                                .replace(/%{2,}/g, '%');
            },

            /**
              * Closes current database connection
              */
            close(){
                if(db && db.open){
                    return db.close();
                }
            }
        }, providerApi);
    };

    //check for the database location and create the factory promise that resolves with the provider
    return new Promise( (resolve, reject) => {
        fs.stat(dbLocation, err => {
            if(err){
                return reject(err);
            }
            //create the provider here
            resolve(provider(new sqlite3.Database(dbLocation, sqlite3.OPEN_READONLY)));
        });
    });

};

module.exports = providerFactory;
