const webpack = require('webpack');
const resolve = require('path').resolve;
const pkg = require('./package.json');

module.exports = {
  entry: {
    g: './src/index.js'
  },
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
      },
      {
        test: /index\.js$/,
        use: {
          loader: 'string-replace-loader',
          options: {
            search: '____G_VERSION____',
            replace: pkg.version
          }
        }
      }
    ]
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.optimize.AggressiveMergingPlugin()
  ]
};
