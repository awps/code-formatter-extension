const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');

module.exports = (env, argv) => ({
    mode: argv.mode || 'development',
    devtool: false,

    entry: {
        'background.min': './src/background/index.ts',
        'content.min': './src/content/index.ts',
        'popup/popup.min': './src/popup/index.ts',
        'css/content.min': './src/css/content.css',
        'css/popup.min': './src/popup/popup.css',
    },

    output: {
        path: path.resolve(__dirname, 'src'),
        filename: '[name].js',
        clean: false,
    },

    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    { loader: 'css-loader', options: { url: false } },
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [
                                    'postcss-nested',
                                    ['postcss-preset-env', { stage: 2 }],
                                    'cssnano',
                                ],
                            },
                        },
                    },
                ],
            },
        ],
    },

    plugins: [
        new RemoveEmptyScriptsPlugin(),
        new MiniCssExtractPlugin({ filename: '[name].css' }),
    ],

    optimization: {
        minimize: false,
        splitChunks: false,
        runtimeChunk: false,
    },

    performance: { hints: false },
    watchOptions: { ignored: /node_modules/ },
});
