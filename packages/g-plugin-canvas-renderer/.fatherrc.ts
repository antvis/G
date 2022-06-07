export default {
  umd: {
    name: 'G.CanvasRenderer',
    globals: {
      '@antv/g': 'window.G',
      'mana-syringe': 'window.G.ManaSyringe',
      '@antv/g-plugin-image-loader': 'window.G.ImageLoader',
      '@antv/g-plugin-canvas-path-generator': 'window.G.CanvasPathGenerator',
    },
  },
};
