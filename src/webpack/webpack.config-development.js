const path = require('path');
const webpack = require('webpack');

const ChunkManifestPlugin = require('chunk-manifest-webpack-plugin');
const WebpackChunkHash = require('webpack-chunk-hash');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyAssets = require('./CopyAssets');


const PROJECT_ROOT_PATH = path.resolve(__dirname, '../../');
const ASSET_PATH = 'assets';

const PACKAGE_NAMES='deskpro+apps react';
const artifactName = (baseName) => PACKAGE_NAMES.replace(/\+/, '').split(' ').concat([baseName]).join('-');

const copyWebpackPlugin = CopyAssets.copyWebpackPlugin(null);
const extractCssPlugin = new ExtractTextPlugin({ filename: '[name].css', publicPath: `/${ASSET_PATH}/`, allChunks: true });

const configParts = [];
configParts.push({
    devServer: {
        contentBase: path.resolve(PROJECT_ROOT_PATH, 'target'),
        clientLogLevel: 'warning',
        hot: true,
        historyApiFallback: true,
        port: 31080,
        publicPath: `/${ASSET_PATH}/`,
        watchContentBase: true
    },
    devtool: 'inline-source-map',
    entry: {
        main: [
            `webpack-dev-server/client?http://localhost:3100`,
            path.resolve(PROJECT_ROOT_PATH, 'src/webpack/entrypoint.js')
        ],
        vendor: ['react', 'react-dom', 'semantic-ui-react', 'deskproapps-sdk-react']
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                include: [
                    path.resolve(PROJECT_ROOT_PATH, 'src/main/javascript'),
                ]
            },
            {
                test: /\.css$/,
                use: extractCssPlugin.extract({ use: ['style-loader', 'css-loader'] })
            },
            {
                include: [ path.resolve(PROJECT_ROOT_PATH, 'src/main/sass') ],
                loader: extractCssPlugin.extract({ use: ['css-loader', 'sass-loader'] }),
                test: /\.scss$/
            }
        ],
    },
    output: {
        chunkFilename: `${ASSET_PATH}/[name].js`,
        filename: '[name].js',
        path: path.resolve(PROJECT_ROOT_PATH, 'target'),
        publicPath: `/${ASSET_PATH}/`
    },
    plugins: [
        extractCssPlugin,

        new webpack.optimize.CommonsChunkPlugin({ name: ['vendor'], minChunks: Infinity }),
        new webpack.NamedModulesPlugin(),
        copyWebpackPlugin,

        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
    ],
    resolve: {
        extensions: ['*', '.js', '.jsx', '.scss', '.css']
    },
    // stats: 'minimal',
    node: { fs: 'empty' },
    bail: true
});

module.exports = Object.assign.apply(Object, configParts);