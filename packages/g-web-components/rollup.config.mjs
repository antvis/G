import { readFileSync } from 'fs';
import { createConfig } from '../../rollup.config.mjs';

export default createConfig({
  pkg: JSON.parse(
    readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
  ),
  umdName: 'G.WebComponent',
  external: ['@antv/g-lite', '@antv/g-canvas', '@antv/g-svg', '@antv/g-webgl'],
  globals: {
    '@antv/g-lite': 'window.G',
    '@antv/g-canvas': 'G.Canvas2D',
    '@antv/g-svg': 'G.SVG',
    '@antv/g-webgl': 'G.WebGL',
  },
});
