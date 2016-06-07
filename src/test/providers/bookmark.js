const test = require('tape');
const bookmarkProvider = require('../../providers/bookmark.js');
const testDb = 'data/bookmarks.sqlite';

test('bookmarkProvider module', t => {
    t.plan(4);
    t.equal(typeof bookmarkProvider, 'function', 'The bookmarkProvider module exports a function');

    t.test('call without arg', st => {
        st.plan(2);
        let promise = bookmarkProvider();
        st.ok(promise instanceof Promise, 'The bookmarkProvider function returns a promise');
        promise
            .then( () =>  st.fail('The bookmarkProvider should not resolve without a db location'))
            .catch(err => st.ok(err, 'The provider fails without db location'));
    });

    t.test('call with wrong path', st => {
        st.plan(2);
        let promise = bookmarkProvider('foo');
        st.ok(promise instanceof Promise, 'The bookmarkProvider function returns a promise');
        promise
            .then( () =>  st.fail('The bookmarkProvider should not resolve without a wrong db location'))
            .catch(err => st.ok(err, 'The provider fails with a wrong db location'));
    });

    t.test('call with a valid db', st => {
        st.plan(4);
        let promise = bookmarkProvider(testDb);
        st.ok(promise instanceof Promise, 'The bookmarkProvider function returns a promise');
        promise
            .then( provider => {
                st.equal(typeof provider, 'object', 'It resolves with a valid object');
                st.equal(typeof provider.getDb, 'function', 'The provider has a getDb function');
                st.equal(typeof provider.getBookmarks, 'function', 'The provider has a getBookmarks function');
            })
            .catch( err => st.fail('The provider should not fail : ' + err.message));
    });
});

test('get all bookmarks', t => {
    t.plan(9);

    bookmarkProvider(testDb)
        .then( provider => {
            t.equal(typeof provider, 'object', 'We\'ve got the provider');

            let promise = provider.getBookmarks();
            t.ok(promise instanceof Promise, 'The getBookmarks function returns a promise');
            promise.then( result => {
                t.ok(result.length > 0, 'There are bookmarks');

                let bookmark = result[0];

                t.equal(typeof bookmark.title, 'string', 'the bookmark has a title');
                t.equal(typeof bookmark.url, 'string', 'the bookmark has an url');
                t.equal(typeof bookmark.icon, 'string', 'the bookmark has an icon');

                t.equal(bookmark.title, 'GitHub · Where software is built', 'The title is the one expect');
                t.equal(bookmark.url, 'https://github.com/', 'The url is the one expected');
                t.equal(bookmark.icon, 'https://github.com/favicon.ico', 'The icon is the one expected');
            });
            return promise;
        })
        .catch( err => t.fail('Something wrong occurs : ' + err.message));
});

test('search uapp bookmarks', t => {
    t.plan(9);

    bookmarkProvider(testDb)
        .then( provider => {
            t.equal(typeof provider, 'object', 'We\'ve got the provider');

            let promise = provider.getBookmarks('uapp');
            t.ok(promise instanceof Promise, 'The getBookmarks function returns a promise');
            promise.then( result => {
                t.equal(result.length, 1, 'There is a bookmark');

                let bookmark = result[0];

                t.equal(typeof bookmark.title, 'string', 'the bookmark has a title');
                t.equal(typeof bookmark.url, 'string', 'the bookmark has an url');
                t.equal(typeof bookmark.icon, 'string', 'the bookmark has an icon');

                t.equal(bookmark.title, 'uApp Explorer', 'The title is the one expect');
                t.equal(bookmark.url, 'https://uappexplorer.com/', 'The url is the one expected');
                t.equal(bookmark.icon, 'https://uappexplorer.com/img/logo.png', 'The icon is the one expected');
            });
            return promise;
        })
        .catch( err => t.fail('Something wrong occurs : ' + err.message));
});
