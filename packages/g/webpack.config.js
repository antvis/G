const common = require('../../webpack.config');

module.exports = {
  ...common,
  output: {
    library: 'G',
    libraryTarget: 'umd',
    filename: 'index.umd.js',
  },
};
