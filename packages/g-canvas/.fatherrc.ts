export default {
  // disableTypeCheck: true,
  umd: {
    name: 'GCanvas',
    globals: {
      '@antv/g': 'window.G',
      'mana-syringe': 'window.G.ManaSyringe',
    },
  },
};
