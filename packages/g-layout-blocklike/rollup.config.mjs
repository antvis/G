import { readFileSync } from 'fs';
import { createConfig } from '../../rollup.config.mjs';

export default createConfig({
  pkg: JSON.parse(
    readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
  ),
  umdName: 'G.Layout.Blocklike',
  external: ['@antv/g-lite', '@antv/g-css-layout-api'],
  globals: {
    '@antv/g-lite': 'window.G',
    '@antv/g-css-layout-api': 'window.G.CSSLayoutAPI',
  },
});
