const x = require('x-ray')();
const url = require('url');
const defaults = require('lodash.defaults');

const absoluteIconUrl = (iconUrl, baseUrl) => {
    if( ! /^http/.test(iconUrl) && /^http/.test(baseUrl)){
        return url.resolve(baseUrl, iconUrl);
    }
    return iconUrl;
};

const crawlerOptions = {
    timeout : 1500,
    crawlingRules : {
        fluid: 'head link[rel=fluid-icon]@href',
        touch: 'head link[rel=apple-touch-icon]@href',
        favicon: 'head link[rel=icon][type="image/png"]@href',
        tileImg: 'head meta[name=msapplication-TileImage]@content',
        logo: 'img.logo@src'
    }
};

/**
 * Crawl the page to look for icons
 *
 * @param {URL|String} page - the page to crawl, either by giving an URL or the HTML string
 * @param {Object} [options]
 * @param {String} [options.defaultIcon] - the icon to return in case of crawling error
 * @param {Number} [options.timeout = 1500] - the page load timeout in ms
 * @param {Object} [options.crawlingRules] - the rules used to extract the icons, see https://www.npmjs.com/package/x-ray
 * @returns {Promise} that resolves with the found icon, usually the first that matches one rule
 */
const iconCrawler = function iconCrawler(page, options) {

    options = defaults(options || {}, crawlerOptions);

    x.timeout(options.timeout);

    return new Promise( (resolve, reject) => {
        if(!page){
            return reject(new TypeError('The page is required'));
        }

        x(page, options.crawlingRules)((err, icons) => {
            if(err){
                if(options.defaultIcon){
                    return resolve(options.defaultIcon);
                }
                return reject(err);
            }

            Object.keys(options.crawlingRules).forEach( key => {
                if (icons[key]){
                    resolve(absoluteIconUrl(icons[key], page));
                    return false;
                }
            });
            if(options.defaultIcon){
               return resolve(options.defaultIcon);
            }
            return resolve(null);
        });
    });
};

module.exports = iconCrawler;

