const webpackConfig = require('./webpack.config');
const webpackDevConfig = require('../../webpack-dev.config');

const _ = require('lodash');

module.exports = _.merge(webpackDevConfig, webpackConfig);
