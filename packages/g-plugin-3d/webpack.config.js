const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
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
    '@antv/g-plugin-webgl-renderer': {
      commonjs: '@antv/g-plugin-webgl-renderer',
      commonjs2: '@antv/g-plugin-webgl-renderer',
      amd: '@antv/g-plugin-webgl-renderer',
      root: ['G', 'WebGL', 'WebGLRenderer'],
    },
  },
  output: {
    library: ['G', '3D'],
    libraryTarget: 'umd',
    filename: 'index.umd.js',
  },
  // plugins: [
  //   new BundleAnalyzerPlugin(),
  // ]
};
