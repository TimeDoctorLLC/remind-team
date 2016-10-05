const path = require('path')
const webpack = require('webpack')

const extractTextPlugin = require('extract-text-webpack-plugin')
const optimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')

module.exports = {
  context: __dirname,
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  module: {
    loaders: [
      {
        test: /\.woff2?|\.ttf|\.eot|\.svg/,
        loader: 'file?name=/fonts/[name].[ext]'
      },
      {
        test: /\.html|\.csv/,
        loader: 'file?name=[name].[ext]'
      },
      {
        test: /\.s?css$/,
        loader: extractTextPlugin.extract('style', 'css!sass'),
      },
      {
        test: /\.js$/,
        exclude: /node_modules|service_worker/,
        // configured in .babelrc
        loader: 'babel-loader',
      }
    ],
  },
  plugins: [
    new extractTextPlugin("styles.css"),
    new optimizeCssAssetsPlugin({
      assetNameRegExp: /\.css$/g,
      cssProcessor: require('cssnano'),
      cssProcessorOptions: { discardComments: { removeAll: true } },
      canPrint: true
    })
  ],
  sassLoader: {
    includePaths: [
      path.resolve(__dirname, './stylesheets'),
      path.resolve(__dirname, './node_modules/bootstrap-sass/assets/stylesheets')
    ],
  },
};
