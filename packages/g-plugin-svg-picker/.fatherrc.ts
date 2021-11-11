export default {
  // disableTypeCheck: true,
  umd: {
    name: 'GPluginSVGPicker',
    globals: {
      '@antv/g': 'window.G',
      '@antv/g-plugin-svg-renderer': 'window.GPluginSVGRenderer',
      'mana-syringe': 'window.G.ManaSyringe',
    },
  },
};
