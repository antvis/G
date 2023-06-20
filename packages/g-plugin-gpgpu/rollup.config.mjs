import { readFileSync } from 'fs';
import { createConfig } from '../../rollup.config.mjs';

export default createConfig({
  pkg: JSON.parse(
    readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
  ),
  umdName: 'G.GPGPU',
  external: ['@antv/g-lite', '@antv/g-webgpu'],
  globals: {
    '@antv/g-lite': 'window.G',
    '@antv/g-webgpu': 'window.G.WebGPU',
  },
});
