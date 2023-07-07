import json from '@rollup/plugin-json';
import { readFileSync } from 'fs';
import { createConfig } from '../../rollup.config.mjs';

export default createConfig({
  pkg: JSON.parse(
    readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
  ),
  umdName: 'G.CSSSelect',
  external: ['@antv/g-lite'],
  globals: {
    '@antv/g-lite': 'window.G',
  },
  plugins: [json()],
});
