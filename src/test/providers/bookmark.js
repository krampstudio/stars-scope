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

test('get bookmarks', t => {
    t.plan(3);

    bookmarkProvider(testDb)
        .then( provider => {
            t.equal(typeof provider, 'object', 'We\'ve got the provider');

            let promise = provider.getBookmarks();
            t.ok(promise instanceof Promise, 'The getBookmarks function returns a promise');
            promise.then( result => {
                t.ok(result.length > 0, 'There are bookmarks');
            });
            return promise;
        })
        .catch( err => t.fail('Something wrong occurs : ' + err.message));
});
