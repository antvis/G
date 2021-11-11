export default {
  // disableTypeCheck: true,
  umd: {
    name: 'GPluginSVGRenderer',
    globals: {
      '@antv/g': 'window.G',
      'mana-syringe': 'window.G.ManaSyringe',
    },
  },
};
