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
      name: 'G.WebComponent',
      format: 'umd',
      sourcemap: true,
      globals: {
        '@antv/g-lite': 'window.G',
        '@antv/g-canvas': 'G.Canvas2D',
        '@antv/g-svg': 'G.SVG',
        '@antv/g-webgl': 'G.WebGL',
      },
    },
    external: [
      '@antv/g-lite',
      '@antv/g-canvas',
      '@antv/g-svg',
      '@antv/g-webgl',
    ],
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
