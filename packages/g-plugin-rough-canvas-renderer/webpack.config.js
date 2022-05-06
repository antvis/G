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
    '@antv/g-plugin-canvas-renderer': {
      commonjs: '@antv/g-plugin-canvas-renderer',
      commonjs2: '@antv/g-plugin-canvas-renderer',
      amd: '@antv/g-plugin-canvas-renderer',
      root: ['G', 'CanvasRenderer'],
    },
  },
  output: {
    library: ['G', 'RoughCanvasRenderer'],
    libraryTarget: 'umd',
    filename: 'index.umd.min.js',
  },
};
