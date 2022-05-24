export default {
  umd: {
    name: 'G.WebComponent',
    globals: {
      '@antv/g': 'window.G',
      'mana-syringe': 'window.G.ManaSyringe',
      '@antv/g-canvas': 'G.Canvas2D',
      '@antv/g-svg': 'G.SVG',
      '@antv/g-webgl': 'G.WebGL',
    },
  },
};
