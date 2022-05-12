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
    '@antv/g-plugin-device-renderer': {
      commonjs: '@antv/g-plugin-device-renderer',
      commonjs2: '@antv/g-plugin-device-renderer',
      amd: '@antv/g-plugin-device-renderer',
      root: ['G', 'DeviceRenderer'],
    },
  },
  output: {
    library: ['G', 'WebGLDevice'],
    libraryTarget: 'umd',
    filename: 'index.umd.min.js',
  },
};
