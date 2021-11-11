export default {
  // disableTypeCheck: true,
  umd: {
    name: 'GPluginCanvasRenderer',
    globals: {
      '@antv/g': 'window.G',
      'mana-syringe': 'window.G.ManaSyringe',
    },
  },
};
