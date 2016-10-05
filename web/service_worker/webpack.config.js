const path = require('path')
const webpack = require('webpack')

module.exports = {
  context: __dirname,
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'sw.js',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        // configured in .babelrc
        loader: 'babel-loader',
      }
    ],
  }
};
