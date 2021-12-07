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
    '@antv/g-plugin-svg-renderer': {
      commonjs: '@antv/g-plugin-svg-renderer',
      commonjs2: '@antv/g-plugin-svg-renderer',
      amd: '@antv/g-plugin-svg-renderer',
      root: ['G', 'SVGRenderer'],
    },
  },
  output: {
    library: ['G', 'SVGPicker'],
    libraryTarget: 'umd',
    filename: 'index.umd.js',
  },
};
