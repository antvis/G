import { readFileSync } from 'fs';
import { createConfig } from '../../rollup.config.mjs';

export default createConfig({
  pkg: JSON.parse(
    readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
  ),
  umdName: 'G.CanvaskitRenderer',
  external: ['@antv/g-lite', '@antv/g-plugin-image-loader'],
  globals: {
    '@antv/g-lite': 'window.G',
    '@antv/g-plugin-image-loader': 'window.G.ImageLoader',
  },
});
