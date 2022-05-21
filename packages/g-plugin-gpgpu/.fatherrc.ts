export default {
  umd: {
    name: 'G.GPGPU',
    globals: {
      '@antv/g': 'window.G',
      'mana-syringe': 'window.G.ManaSyringe',
      '@antv/g-plugin-device-renderer': 'window.G.DeviceRenderer',
    },
  },
};
