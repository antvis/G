import { readFileSync } from 'fs';
import glslify from 'rollup-plugin-glslify';
import { createConfig } from '../../rollup.config.mjs';

export default createConfig({
  pkg: JSON.parse(
    readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
  ),
  umdName: 'G.DeviceRenderer',
  external: ['@antv/g-lite', '@antv/g-plugin-image-loader'],
  globals: {
    '@antv/g-lite': 'window.G',
    '@antv/g-plugin-image-loader': 'window.G.ImageLoader',
  },
  plugins: [
    glslify({
      // disable compressing shader
      // @see https://github.com/antvis/g/issues/832
      compress: false,
    }),
  ],
});
