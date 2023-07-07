import { readFileSync } from 'fs';
import { createConfig } from '../../rollup.config.mjs';

export default createConfig({
  pkg: JSON.parse(
    readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
  ),
  umdName: 'G.CanvasRenderer',
  external: [
    '@antv/g-lite',
    '@antv/g-plugin-image-loader',
    '@antv/g-plugin-canvas-path-generator',
  ],
  globals: {
    '@antv/g-lite': 'window.G',
    '@antv/g-plugin-image-loader': 'window.G.ImageLoader',
    '@antv/g-plugin-canvas-path-generator': 'window.G.CanvasPathGenerator',
  },
});
