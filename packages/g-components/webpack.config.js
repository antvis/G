const common = require('../../webpack.config');

module.exports = {
  ...common,
  externals: {
    '@antv/g': {
      commonjs: '@antv/g',
      commonjs2: '@antv/g',
      amd: '@antv/g',
      root: 'G',
    },
  },
  output: {
    library: ['G', 'Components'],
    libraryTarget: 'umd',
    filename: 'index.umd.js',
  },
};
