import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const root = path.dirname(fileURLToPath(import.meta.url));
const source = (name) => path.resolve(root, `../../packages/${name}/src`);

export default defineConfig({
  root,
  server: { host: '127.0.0.1', port: 5175 },
  resolve: {
    alias: {
      '@antv/g-lite': source('g-lite'),
      '@antv/g-canvas': source('g-canvas'),
      '@antv/g-math': source('g-math'),
    },
  },
});
