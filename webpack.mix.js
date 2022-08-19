const mix = require('laravel-mix');
const cssNano = require('cssnano');
const postCssCustomProperties = require('postcss-custom-properties');

mix.js('./src/background.js', './src/background.min.js');
mix.js('./src/content.js', './src/content.min.js');
mix.sass('./src/css/content.scss', './src/css/content.min.css');

/*
-------------------------------------------------------------------------------
Config
-------------------------------------------------------------------------------
*/

mix.sourceMaps(false, 'source-map');

mix.options({
    processCssUrls: false,
    postCss: [cssNano(), postCssCustomProperties()],
    includePaths: ['./node_modules']
});

