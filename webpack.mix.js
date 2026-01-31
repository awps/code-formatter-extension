const mix = require('laravel-mix');
const cssNano = require('cssnano');
const postCssCustomProperties = require('postcss-custom-properties');

mix.ts(`./src/background/index.ts`, `./src/background.min.js`)
   .ts(`./src/content/index.ts`, `./src/content.min.js`);
mix.sass(`./src/css/content.scss`, `./src/css/content.min.css`);

/*
-------------------------------------------------------------------------------
Config
-------------------------------------------------------------------------------
*/

mix.sourceMaps(false, 'source-map');

mix.options({
    processCssUrls: false,
    postCss: [cssNano(), postCssCustomProperties()],
    includePaths: ['./node_modules'],
    minify: false,
});

mix.webpackConfig({
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.*', '.js', '.jsx', '.ts', '.tsx'],
    },
    optimization: {
        minimize: false,
    }
});

