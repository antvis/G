import { readFileSync } from 'fs';
import { createConfig } from '../../rollup.config.mjs';

export default createConfig({
  pkg: JSON.parse(
    readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
  ),
  umdName: 'G.ZdogSvgRenderer',
  external: ['@antv/g-lite', '@antv/g-svg'],
  globals: {
    '@antv/g-lite': 'window.G',
    '@antv/g-svg': 'window.G.SVG',
  },
});
