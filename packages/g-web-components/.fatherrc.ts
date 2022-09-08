export default {
  umd: {
    name: 'G.WebComponent',
    globals: {
      '@antv/g-lite': 'window.G',
      '@antv/g-canvas': 'G.Canvas2D',
      '@antv/g-svg': 'G.SVG',
      '@antv/g-webgl': 'G.WebGL',
    },
  },
};
