export default {
  // disableTypeCheck: true,
  umd: {
    name: 'GPlugin3D',
    globals: {
      '@antv/g': 'window.G',
      '@antv/g-plugin-webgl-renderer': 'window.GPluginWebGLRenderer',
      'mana-syringe': 'window.G.ManaSyringe',
    },
  },
};
