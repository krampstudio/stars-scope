var scopes = require('unity-js-scopes');

var scopeOptions = {};

var bookmarks = 'src/bookmarks.sqlite';

const bookmarkProvider = require('./providers/bookmark.js');
const iconCrawler = require('./lib/iconCrawler.js');

const categoryTpl = JSON.stringify({
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
});

scopes.self.initialize(scopeOptions, {
    run: function run() {
        console.log('Run', arguments);
        console.log('cwd : ' + process.cwd());
        console.log('cwd : ' + process.version);
    },
    start: function(scope_id) {
        console.log('Start', arguments);
        console.log('Starting scope id: ' + scope_id + ', ' + scopes.self.scope_config);
    },
    stop: function(scope_id) {
        console.log('Stop', arguments);
        console.log('Stoping scope id: ' + scope_id + ', ' + scopes.self.scope_config);
    },
    search: function(canned_query, metadata) {
        console.log('Search', arguments);
        return new scopes.lib.SearchQuery(canned_query, metadata, searchReply => {
            var qs = canned_query.query_string();

            bookmarkProvider(bookmarks)
                .then(provider => {
                    return provider.getBookmarks(qs).then(result => {
                        return Promise.all(result.map(bookmark => {
                            return iconCrawler(bookmark.url, { defaultIcon : bookmark.icon } )
                                    .then(icon => {
                                        console.log(icon);
                                        bookmark.icon = icon;
                                        return bookmark;
                                    });
                        }));
                    });
                })
                .then(result => {
                    var categoryRenderer = new scopes.lib.CategoryRenderer(categoryTpl);
                    var category = searchReply.register_category('bookmarks', 'Bookmarks', 'icon.png', categoryRenderer);

                    result.forEach(bookmark => {
                        var categorised_result = new scopes.lib.CategorisedResult(category);
                        categorised_result.set_uri(bookmark.url);
                        categorised_result.set_dnd_uri(bookmark.url);
                        categorised_result.set_title(bookmark.title);
                        categorised_result.set_art(bookmark.icon);
                        categorised_result.set_intercept_activation();
                        searchReply.push(categorised_result);
                    });
                })
                .catch(err => {
                    console.error(err);
                    console.log(err.stack);
                });
        },
        function() {});
    },

    activate: function(result, metadata) {
        return new scopes.lib.ActivationQuery(result, metadata, 'open browser', 'open', () => null, () => {});
    }
});

/*
var http = require('http');

var query_host = 'api.openweathermap.org'
var current_weather_path = '/data/2.5/weather?units=metric&APPID=2b12bf09b4e0ab0c1aa5e32a9a3f0cdc&q='
var forecast_weather_path = '/data/2.5/forecast/daily/?units=metric&cnt=7&APPID=2b12bf09b4e0ab0c1aa5e32a9a3f0cdc&q='

var CURRENT_TEMPLATE =
        {
    'schema-version': 1,
    'template': {
        'category-layout': 'grid',
        'card-size': 'medium'
    },
    'components': {
        'title': 'title',
        'art': {
            'field': 'art'
        },
        'subtitle': 'subtitle'
    }
}

var FORECAST_TEMPLATE =
        {
    'schema-version': 1,
    'template': {
        'category-layout': 'grid',
        'card-layout': 'horizontal',
        'card-size': 'small'
    },
    'components': {
        'title': 'title',
        'art' : {
            'field': 'art'
        },
        'subtitle': 'subtitle'
    }
}

scopes.self.initialize(
            {}
            ,
            {
                run: function() {
                    console.log('Running...')
                },
                start: function(scope_id) {
                    console.log('Starting scope id: '
                                + scope_id
                                + ', '
                                + scopes.self.scope_directory)
                },
                search: function(canned_query, metadata) {
                    return new scopes.lib.SearchQuery(
                                canned_query,
                                metadata,
                                // run
                                function(search_reply) {
                                    var qs = canned_query.query_string();
                                    if (!qs) {
                                        qs = 'London,uk'
                                    }

                                    var current_weather_cb = function(response) {
                                        var res = '';

                                        // Another chunk of data has been recieved, so append it to res
                                        response.on('data', function(chunk) {
                                            res += chunk;
                                        });

                                        // The whole response has been recieved
                                        response.on('end', function() {
                                            r = JSON.parse(res);

                                            var category_renderer = new scopes.lib.CategoryRenderer(JSON.stringify(CURRENT_TEMPLATE));
                                            var category = search_reply.register_category('current', r.name + ', ' + r.sys.country, '', category_renderer);

                                            var categorised_result = new scopes.lib.CategorisedResult(category);
                                            categorised_result.set_uri(r.id.toString());
                                            categorised_result.set_title(r.main.temp.toString() + '°C');
                                            categorised_result.set_art('http://openweathermap.org/img/w/' + r.weather[0].icon + '.png');
                                            categorised_result.set('subtitle', r.weather[0].description);
                                            categorised_result.set('description', 'A description of the result');

                                            search_reply.push(categorised_result);

                                            // Now call back into the API for a 7 day forecast
                                            http.request({host: query_host, path: forecast_weather_path + qs}, forecase_weather_cb).end();
                                        });
                                    }

                                    var forecase_weather_cb = function(response) {
                                        var res = '';

                                        // Another chunk of data has been recieved, so append it to res
                                        response.on('data', function(chunk) {
                                            res += chunk;
                                        });

                                        // The whole response has been recieved
                                        response.on('end', function() {
                                            try {
                                                r = JSON.parse(res);

                                                var category_renderer = new scopes.lib.CategoryRenderer(JSON.stringify(FORECAST_TEMPLATE));
                                                var category = search_reply.register_category('forecast', '7 day forecast', '', category_renderer);

                                                for (i = 0; i < r.list.length; i++) {
                                                    var categorised_result = new scopes.lib.CategorisedResult(category);
                                                    categorised_result.set_uri(r.list[i].weather[0].id.toString());
                                                    categorised_result.set_title(r.list[i].temp.min.toString() + '°C to '
                                                                                 + r.list[i].temp.max.toString() + '°C');
                                                    categorised_result.set_art('http://openweathermap.org/img/w/' + r.list[i].weather[0].icon + '.png');
                                                    categorised_result.set('subtitle', r.list[i].weather[0].description);
                                                    categorised_result.set('description', 'A description of the result');

                                                    search_reply.push(categorised_result);
                                                }

                                                // We are done, call finished() on our search_reply
                                                search_reply.finished();
                                            }
                                            catch(e) {
                                                // Forecast not available
                                                console.log('Forecast for '' + qs + '' is unavailable: ' + e)
                                            }
                                        });
                                    }

                                    http.request({host: query_host, path: current_weather_path + qs}, current_weather_cb).end();
                                },
                                // cancelled
                                function() {
                                });
                },
                preview: function(result, action_metadata) {
                    return new scopes.lib.PreviewQuery(
                                result,
                                action_metadata,
                                // run
                                function(preview_reply) {
                                    var layout1col = new scopes.lib.ColumnLayout(1);
                                    var layout2col = new scopes.lib.ColumnLayout(2);
                                    var layout3col = new scopes.lib.ColumnLayout(3);
                                    layout1col.add_column(['image', 'header', 'summary']);

                                    layout2col.add_column(['image']);
                                    layout2col.add_column(['header', 'summary']);

                                    layout3col.add_column(['image']);
                                    layout3col.add_column(['header', 'summary']);
                                    layout3col.add_column([]);

                                    preview_reply.register_layout([layout1col, layout2col, layout3col]);

                                    var header = new scopes.lib.PreviewWidget('header', 'header');
                                    header.add_attribute_mapping('title', 'title');
                                    header.add_attribute_mapping('subtitle', 'subtitle');

                                    var image = new scopes.lib.PreviewWidget('image', 'image');
                                    image.add_attribute_mapping('source', 'art');

                                    var description = new scopes.lib.PreviewWidget('summary', 'text');
                                    description.add_attribute_mapping('text', 'description');

                                    preview_reply.push([image, header, description ]);
                                    preview_reply.finished();
                                },
                                // cancelled
                                function() {
                                });
                }
            }
            );
*/

