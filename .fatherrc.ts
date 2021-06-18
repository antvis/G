export default {
  cjs: 'rollup',
  esm: 'rollup',
  // umd: {
  //   minFile: true,
  // },
  disableTypeCheck: true,
  // yarn build order
  pkgs: [
    'g-math',
    'g-ecs',
    'g',
    'g-plugin-dom-interaction',
    'g-plugin-css-select',
    'g-plugin-canvas-picker',
    'g-plugin-canvas-renderer',
    'g-canvas',
    'g-plugin-svg-renderer',
    'g-plugin-svg-picker',
    'g-svg',
    'g-plugin-webgl-renderer',
    'g-webgl',
    'g-components',
    'g-plugin-3d',
  ],
};
