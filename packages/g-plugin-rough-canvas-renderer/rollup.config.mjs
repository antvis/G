import { readFileSync } from 'fs';
import { createConfig } from '../../rollup.config.mjs';

export default createConfig({
  pkg: JSON.parse(
    readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
  ),
  umdName: 'G.RoughCanvasRenderer',
  external: ['@antv/g-lite', '@antv/g-canvas'],
  globals: {
    '@antv/g-lite': 'window.G',
    '@antv/g-canvas': 'window.G.Canvas2D',
  },
});
