/**
 * @author Bertrand Chevrier <chevrier.bertrand@gmail.com>
 * @license GPLv3
 */

const scopes = require('unity-js-scopes');
const boomarkService = require('./service/bookmark.js');
const noop = () => {};

const categoryRenderer = new scopes.lib.CategoryRenderer(JSON.stringify({
    'schema-version': 1,
    'template': {
        'category-layout': 'grid',
        'card-size': 'medium'
    },
    'components': {
        'title': 'title',
        'art': {
            'field': 'art',
            'aspect-ratio': 1,
            'fallback': 'icon.png'
        },
        'subtitle': 'subtitle'
    }
}));

const scopeOptions = {};

scopes.self.initialize(scopeOptions, {
    search: function(cannedQuery, metadata) {
        return new scopes.lib.SearchQuery(cannedQuery, metadata, searchReply => {
            const serviceOptions = {
                connectivity : metadata.internet_connectivity() === 'Connected',
                limit : metadata.cardinality() > 0 ? metadata.cardinality() : -1
            };

            boomarkService(serviceOptions)
                .getBookmarks(cannedQuery.query_string()).then(bookmarks => {
                    var category = searchReply.register_category('bookmarks', 'Bookmarks', 'icon.png', categoryRenderer);


                    bookmarks.forEach(bookmark => {
                        var result = new scopes.lib.CategorisedResult(category);
                        result.set_uri(bookmark.url);
                        result.set_dnd_uri(bookmark.url);
                        result.set_title(bookmark.title);
                        result.set_art(bookmark.icon);
                        result.set_intercept_activation();
                        searchReply.push(result);
                    });

                    searchReply.finished();
                })
                .catch(err => {
                    console.error(err);
                    console.log(err.stack);
                });
        }, noop);
    },

    activate: function(result, metadata) {
        return new scopes.lib.ActivationQuery(result, metadata, 'open browser', 'open', noop, noop);
    }

});
