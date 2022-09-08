export default {
  umd: {
    name: 'G.GPGPU',
    globals: {
      '@antv/g-lite': 'window.G',
      '@antv/g-webgpu': 'window.G.WebGPU',
    },
  },
};
