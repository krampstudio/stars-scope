const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const providerFactory = function providerFactory(dbLocation, providerApi){

    const provider = function provider(db){
        if(!db){
            throw new TypeError('Please provide us with a database connection');
        }
        return Object.assign({
            getDb(){
                return db;
            },
            close(){
                return db.close();
            }
        }, providerApi);
    };

    return new Promise( (resolve, reject) => {
        fs.stat(dbLocation, err => {
            if(err){
                return reject(err);
            }
            resolve(provider(new sqlite3.Database(dbLocation, sqlite3.OPEN_READONLY)));
        });
    });

};
module.exports = providerFactory;
