export default {
  umd: {
    name: 'G.CanvasRenderer',
    globals: {
      '@antv/g': 'window.G',
      '@antv/g-plugin-image-loader': 'window.G.ImageLoader',
      '@antv/g-plugin-canvas-path-generator': 'window.G.CanvasPathGenerator',
    },
  },
};
