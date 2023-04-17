const { uglify } = require('rollup-plugin-uglify');
const resolve = require('rollup-plugin-node-resolve');
const typescript = require('rollup-plugin-typescript');
const commonjs = require('@rollup/plugin-commonjs');
const nodePolyfills = require('rollup-plugin-polyfill-node');
const { visualizer } = require('rollup-plugin-visualizer');
const glslify = require('rollup-plugin-glslify');

const isBundleVis = !!process.env.BUNDLE_VIS;

module.exports = [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.umd.min.js',
        name: 'G.DeviceRenderer',
        format: 'umd',
        sourcemap: true,
        globals: {
          '@antv/g-lite': 'window.G',
          '@antv/g-plugin-image-loader': 'window.G.ImageLoader',
        },
      },
      {
        file: 'lib/index.js',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: 'esm/index.js',
        format: 'esm',
        sourcemap: true,
      },
    ],
    external: ['@antv/g-lite', '@antv/g-plugin-image-loader'],
    plugins: [
      glslify({
        // disable compressing shader
        // @see https://github.com/antvis/g/issues/832
        compress: false,
      }),
      nodePolyfills(),
      resolve(),
      commonjs(),
      typescript(),
      uglify(),
      ...(isBundleVis ? [visualizer()] : []),
    ],
  },
];
