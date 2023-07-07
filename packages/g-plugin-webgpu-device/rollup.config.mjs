import { readFileSync } from 'fs';
import { createConfig } from '../../rollup.config.mjs';

export default createConfig({
  pkg: JSON.parse(
    readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
  ),
  umdName: 'G.WebGPUDevice',
  external: ['@antv/g-lite', '@antv/g-plugin-device-renderer'],
  globals: {
    '@antv/g-lite': 'window.G',
    '@antv/g-plugin-device-renderer': 'window.G.DeviceRenderer',
  },
});
