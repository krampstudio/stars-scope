const test = require('tape');
const iconCrawler = require('../../lib/iconCrawler.js');


test('iconCrawler module', t => {
    t.plan(2);

    t.equal(typeof iconCrawler, 'function', 'The iconCrawler module exports a function');

    t.test('call without arg', st => {
        st.plan(2);
        let promise = iconCrawler();
        st.ok(promise instanceof Promise, 'The iconCrawler function returns a promise');
        promise
            .then( () =>  st.fail('The iconCrawler should not resolve without a page'))
            .catch(err => st.ok(err, 'The provider fails without a page'));
    });
});

test('crawl html first found', t => {
    t.plan(2);

    const page = `<html lang="en">
    <head>
    <meta charset="utf-8">
    <title>foo</title>
    <link rel="apple-touch-icon" sizes="57x57" href="/static/images/touch-icons/apple-touch-icon-57x57.png">
    <link rel="apple-touch-icon" sizes="60x60" href="/static/images/touch-icons/apple-touch-icon-60x60.png">
    <link rel="apple-touch-icon" sizes="72x72" href="/static/images/touch-icons/apple-touch-icon-72x72.png">
    <link rel="apple-touch-icon" sizes="76x76" href="/static/images/touch-icons/apple-touch-icon-76x76.png">
    <link rel="apple-touch-icon" sizes="114x114" href="/static/images/touch-icons/apple-touch-icon-114x114.png">
    <link rel="apple-touch-icon" sizes="120x120" href="/static/images/touch-icons/apple-touch-icon-120x120.png">
    <link rel="apple-touch-icon" sizes="144x144" href="/static/images/touch-icons/apple-touch-icon-144x144.png">
    <link rel="apple-touch-icon" sizes="152x152" href="/static/images/touch-icons/apple-touch-icon-152x152.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/static/images/touch-icons/apple-touch-icon-180x180.png">
    <link rel="icon" type="image/png" href="/static/images/touch-icons/favicon-32x32.png" sizes="32x32">
    <link rel="icon" type="image/png" href="/static/images/touch-icons/favicon-230x230.png" sizes="230x230">
    <link rel="icon" type="image/png" href="/static/images/touch-icons/favicon-96x96.png" sizes="96x96">
    <link rel="icon" type="image/png" href="/static/images/touch-icons/android-chrome-192x192.png" sizes="192x192">
    <link rel="icon" type="image/png" href="/static/images/touch-icons/coast-228x228.png" sizes="228x228">
    <link rel="icon" type="image/png" href="/static/images/touch-icons/favicon-16x16.png" sizes="16x16">
    <link rel="shortcut icon" href="/static/images/touch-icons/favicon.ico">
    <meta property="og:image" content="https://www.npmjs.com/static/images/touch-icons/open-graph.png">
    <meta name="msapplication-TileColor" content="#cb3837">
    <meta name="msapplication-TileImage" content="/static/images/touch-icons/mstile-144x144.png">
    <meta name="theme-color" content="#cb3837">
    </head>
    <body>
        <header><img class="logo" src="logo.png" /></header>
    </body>
    </html>`;

    let promise = iconCrawler(page);
    t.ok(promise instanceof Promise, 'The iconCrawler function returns a promise');
    promise
        .then( icon =>  t.equal(icon, '/static/images/touch-icons/apple-touch-icon-57x57.png', 'The icon is correct'))
        .catch( err => t.fail('The crawler should not fail ' + err.message));

});


test('crawl html favicon', t => {
    t.plan(2);

    const page = `<html lang="en">
    <head>
    <meta charset="utf-8">
    <title>foo</title>
    <link rel="icon" type="image/png" href="/static/images/touch-icons/favicon-32x32.png" sizes="32x32">
    </head>
    </html>`;

    let promise = iconCrawler(page);
    t.ok(promise instanceof Promise, 'The iconCrawler function returns a promise');
    promise
        .then( icon =>  t.equal(icon, '/static/images/touch-icons/favicon-32x32.png', 'The icon is correct'))
        .catch( err => t.fail('The crawler should not fail ' + err.message));

});

test('crawl html tile', t => {
    t.plan(2);

    const page = `<html lang="en">
    <head>
    <meta charset="utf-8">
    <title>foo</title>
    <meta property="og:image" content="https://www.npmjs.com/static/images/touch-icons/open-graph.png">
    <meta name="msapplication-TileColor" content="#cb3837">
    <meta name="msapplication-TileImage" content="/static/images/touch-icons/mstile-144x144.png">
    <meta name="theme-color" content="#cb3837">
    </head>
    </html>`;

    let promise = iconCrawler(page);
    t.ok(promise instanceof Promise, 'The iconCrawler function returns a promise');
    promise
        .then( icon =>  t.equal(icon, '/static/images/touch-icons/mstile-144x144.png', 'The icon is correct'))
        .catch( err => t.fail('The crawler should not fail ' + err.message));

});

test('crawl html logo', t => {
    t.plan(2);

    const page = `<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>foo</title>
    </head>
    <body>
        <header><img class="logo" src="logo.png" /></header>
    </body>
    </html>`;

    let promise = iconCrawler(page);
    t.ok(promise instanceof Promise, 'The iconCrawler function returns a promise');
    promise
        .then( icon =>  t.equal(icon, 'logo.png', 'The icon is correct'))
        .catch( err => t.fail('The crawler should not fail ' + err.message));

});
