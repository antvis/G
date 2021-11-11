export default {
  // disableTypeCheck: true,
  umd: {
    name: 'GPluginCSSSelect',
    globals: {
      '@antv/g': 'window.G',
      'mana-syringe': 'window.G.ManaSyringe',
    },
  },
};
