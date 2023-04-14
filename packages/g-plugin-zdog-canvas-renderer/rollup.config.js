const { uglify } = require('rollup-plugin-uglify');
const resolve = require('rollup-plugin-node-resolve');
const typescript = require('rollup-plugin-typescript');
const commonjs = require('@rollup/plugin-commonjs');
const nodePolyfills = require('rollup-plugin-polyfill-node');
const { visualizer } = require('rollup-plugin-visualizer');

const isBundleVis = !!process.env.BUNDLE_VIS;

module.exports = [
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.min.js',
      name: 'G.ZdogCanvasRenderer',
      format: 'umd',
      sourcemap: false,
      globals: {
        '@antv/g-lite': 'window.G',
        '@antv/g-canvas': 'window.G.Canvas2D',
      },
    },
    external: ['@antv/g-lite', '@antv/g-canvas'],
    plugins: [
      nodePolyfills(),
      resolve(),
      commonjs(),
      typescript(),
      uglify(),
      ...(isBundleVis ? [visualizer()] : []),
    ],
  },
];
