const webpack = require('webpack');
const SizePlugin = require('size-plugin');
const resolve = require('path').resolve;

module.exports = {
  entry: {
    g: './src/index.js'
  },
  mode: process.env.NODE_ENV || 'development',
  output: {
    filename: '[name].js',
    library: 'G',
    libraryTarget: 'umd',
    path: resolve(__dirname, 'build/')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        // exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: true
          }
        }
      }
    ]
  },
  plugins: [
    new SizePlugin({ publish: true }),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.optimize.AggressiveMergingPlugin()
  ]
};
