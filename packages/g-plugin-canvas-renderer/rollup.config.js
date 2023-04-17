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
      name: 'G.CanvasRenderer',
      format: 'umd',
      sourcemap: true,
      globals: {
        '@antv/g-lite': 'window.G',
        '@antv/g-plugin-image-loader': 'window.G.ImageLoader',
        '@antv/g-plugin-canvas-path-generator': 'window.G.CanvasPathGenerator',
      },
    },
    external: [
      '@antv/g-lite',
      '@antv/g-plugin-image-loader',
      '@antv/g-plugin-canvas-path-generator',
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
