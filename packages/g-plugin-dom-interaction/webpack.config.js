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
    'mana-syringe': {
      commonjs: 'mana-syringe',
      commonjs2: 'mana-syringe',
      amd: 'mana-syringe',
      root: ['G', 'ManaSyringe'],
    },
  },
  output: {
    library: ['G', 'DOMInteraction'],
    libraryTarget: 'umd',
    filename: 'index.umd.js',
  },
};
