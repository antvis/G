import glslify from 'rollup-plugin-glslify';
// import { wasm } from '@rollup/plugin-wasm';

export default {
  cjs: 'rollup',
  esm: 'rollup',
  extraRollupPlugins: [
    glslify({
      // disable compressing shader
      // @see https://github.com/antvis/g/issues/832
      compress: false,
    }),
    // wasm({
    //   publicPath: '/',
    // }),
  ],
  umd: {
    name: 'G.DeviceRenderer',
    globals: {
      '@antv/g-lite': 'window.G',
      '@antv/g-plugin-image-loader': 'window.G.ImageLoader',
    },
  },
};
