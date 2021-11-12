// import { wasm } from '@rollup/plugin-wasm';
import rust from '@wasm-tool/rollup-plugin-rust';

export default {
  // cjs: 'rollup',
  // esm: 'rollup',
  cjs: 'babel',
  esm: 'babel',
  umd: false,
  // runtimeHelpers: true,
  nodeResolveOpts: {
    mainFields: ['module', 'browser', 'main'],
  },
  extraRollupPlugins: [
    // wasm()
    rust({
      inlineWasm: true,
    }),
  ],
  // extraBabelPlugins: [
  //   [
  //     'babel-plugin-inline-import',
  //     {
  //       extensions: ['.glsl'],
  //     },
  //   ],
  // ],
  // yarn build order
  pkgs: [
    'g-math',
    'g-ecs',
    'g',
    'g-plugin-dom-interaction',
    'g-plugin-css-select',
    'g-plugin-canvas-renderer',
    'g-plugin-canvas-picker',
    'g-plugin-html-renderer',
    'g-canvas',
    'g-plugin-svg-renderer',
    'g-plugin-svg-picker',
    'g-svg',
    'g-plugin-webgl-renderer',
    'g-webgl',
    'g-components',
    'g-plugin-3d',
    'g-plugin-control',
  ],
};
