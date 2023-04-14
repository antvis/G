const { uglify } = require('rollup-plugin-uglify');
const resolve = require('rollup-plugin-node-resolve');
const typescript = require('rollup-plugin-typescript');
const commonjs = require('@rollup/plugin-commonjs');
const nodePolyfills = require('rollup-plugin-polyfill-node');
const { visualizer } = require('rollup-plugin-visualizer');
const json = require('@rollup/plugin-json');

const isBundleVis = !!process.env.BUNDLE_VIS;

module.exports = [
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.min.js',
      name: 'G.CSSSelect',
      format: 'umd',
      sourcemap: false,
      globals: {
        '@antv/g-lite': 'window.G',
      },
    },
    external: ['@antv/g-lite'],
    plugins: [
      json(),
      nodePolyfills(),
      resolve(),
      commonjs(),
      typescript(),
      uglify(),
      ...(isBundleVis ? [visualizer()] : []),
    ],
  },
];
