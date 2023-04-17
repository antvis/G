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
      file: 'dist/index.umd.min.js',
      name: 'G.SVGPicker',
      format: 'umd',
      sourcemap: true,
      globals: {
        '@antv/g-lite': 'window.G',
        '@antv/g-plugin-svg-renderer': 'G.SVGRenderer',
      },
    },
    external: ['@antv/g-lite', '@antv/g-plugin-svg-renderer'],
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
