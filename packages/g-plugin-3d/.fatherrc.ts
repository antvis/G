import glslify from 'rollup-plugin-glslify';

export default {
  cjs: 'rollup',
  esm: 'rollup',
  extraRollupPlugins: [
    glslify({
      // disable compressing shader
      // @see https://github.com/antvis/g/issues/832
      compress: false,
    }),
  ],
  umd: {
    name: 'G.3D',
    globals: {
      '@antv/g': 'window.G',
      'mana-syringe': 'window.G.ManaSyringe',
      '@antv/g-plugin-webgl-renderer': 'window.G.WebGL.WebGLRenderer',
    },
  },
};
