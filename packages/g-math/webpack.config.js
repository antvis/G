const common = require('../../webpack.config');

module.exports = {
  ...common,
  output: {
    library: ['G', 'Math'],
    libraryTarget: 'umd',
    filename: 'index.umd.js',
  },
};
