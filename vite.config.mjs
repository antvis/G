import path from 'path';
import process from 'process';
import { fileURLToPath, URL } from 'url';
import { exec } from 'child_process';
import { defineConfig } from 'vite';
import glslify from 'rollup-plugin-glslify';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const __CI__ = process.env.CI;

const resolve = (packageName) => {
  return path.resolve(
    __dirname,
    path.join('./packages/', packageName, __CI__ ? 'dist/index.esm.js' : 'src'),
  );
};

export default defineConfig({
  root: './__tests__/',
  server: {
    port: 8080,
    open: '/',
  },
  publicDir: 'static',
  plugins: __CI__
    ? []
    : [
        // ! keep same to rollup config
        glslify({
          // disable compressing shader
          // @see https://github.com/antvis/g/issues/832
          compress: false,
        }),
        nodeResolve({
          mainFields: ['module', 'browser', 'main'],
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.es6', '.es', '.mjs'],
        }),
        commonjs({ sourceMap: true }),
        typescript({ sourceMap: true, noCheck: true }),
        buildTypesPlugin(),
      ],
  resolve: {
    alias: {
      '@antv/g': resolve('g'),
      '@antv/g-mobile-webgl': resolve('g-mobile-webgl'),
      '@antv/g-plugin-matterjs': resolve('g-plugin-matterjs'),
      '@antv/g-camera-api': resolve('g-camera-api'),
      '@antv/g-pattern': resolve('g-pattern'),
      '@antv/g-plugin-mobile-interaction': resolve(
        'g-plugin-mobile-interaction',
      ),
      '@antv/g-canvas': resolve('g-canvas'),
      '@antv/g-plugin-3d': resolve('g-plugin-3d'),
      '@antv/g-plugin-physx': resolve('g-plugin-physx'),
      '@antv/g-canvaskit': resolve('g-canvaskit'),
      '@antv/g-plugin-a11y': resolve('g-plugin-a11y'),
      '@antv/g-plugin-rough-canvas-renderer': resolve(
        'g-plugin-rough-canvas-renderer',
      ),
      '@antv/g-components': resolve('g-components'),
      '@antv/g-plugin-annotation': resolve('g-plugin-annotation'),
      '@antv/g-plugin-rough-svg-renderer': resolve(
        'g-plugin-rough-svg-renderer',
      ),
      '@antv/g-css-layout-api': resolve('g-css-layout-api'),
      '@antv/g-plugin-box2d': resolve('g-plugin-box2d'),
      '@antv/g-plugin-svg-picker': resolve('g-plugin-svg-picker'),
      '@antv/g-css-typed-om-api': resolve('g-css-typed-om-api'),
      '@antv/g-plugin-canvas-path-generator': resolve(
        'g-plugin-canvas-path-generator',
      ),
      '@antv/g-plugin-svg-renderer': resolve('g-plugin-svg-renderer'),
      '@antv/g-devtool': resolve('g-devtool'),
      '@antv/g-plugin-canvas-picker': resolve('g-plugin-canvas-picker'),
      '@antv/g-plugin-yoga': resolve('g-plugin-yoga'),
      '@antv/g-dom-mutation-observer-api': resolve(
        'g-dom-mutation-observer-api',
      ),
      '@antv/g-plugin-canvas-renderer': resolve('g-plugin-canvas-renderer'),
      '@antv/g-plugin-zdog-canvas-renderer': resolve(
        'g-plugin-zdog-canvas-renderer',
      ),
      '@antv/g-gesture': resolve('g-gesture'),
      '@antv/g-plugin-canvaskit-renderer': resolve(
        'g-plugin-canvaskit-renderer',
      ),
      '@antv/g-plugin-zdog-svg-renderer': resolve('g-plugin-zdog-svg-renderer'),
      '@antv/g-image-exporter': resolve('g-image-exporter'),
      '@antv/g-plugin-control': resolve('g-plugin-control'),
      '@antv/g-shader-components': resolve('g-shader-components'),
      '@antv/g-layout-blocklike': resolve('g-layout-blocklike'),
      '@antv/g-plugin-css-select': resolve('g-plugin-css-select'),
      '@antv/g-svg': resolve('g-svg'),
      '@antv/g-lite': resolve('g-lite'),
      '@antv/g-plugin-device-renderer': resolve('g-plugin-device-renderer'),
      '@antv/g-web-animations-api': resolve('g-web-animations-api'),
      '@antv/g-lottie-player': resolve('g-lottie-player'),
      '@antv/g-plugin-dom-interaction': resolve('g-plugin-dom-interaction'),
      '@antv/g-web-components': resolve('g-web-components'),
      '@antv/g-math': resolve('g-math'),
      '@antv/g-plugin-dragndrop': resolve('g-plugin-dragndrop'),
      '@antv/g-webgl': resolve('g-webgl'),
      '@antv/g-mobile-canvas': resolve('g-mobile-canvas'),
      '@antv/g-plugin-gesture': resolve('g-plugin-gesture'),
      '@antv/g-webgpu': resolve('g-webgpu'),
      '@antv/g-mobile-canvas-element': resolve('g-mobile-canvas-element'),
      '@antv/g-plugin-html-renderer': resolve('g-plugin-html-renderer'),
      '@antv/react-g': resolve('react-g'),
      '@antv/g-mobile-svg': resolve('g-mobile-svg'),
      '@antv/g-plugin-image-loader': resolve('g-plugin-image-loader'),
    },
  },
});

function buildTypesPlugin() {
  return {
    name: 'build-types-plugin',
    /**
     * @see https://vite.dev/guide/api-plugin.html#handlehotupdate
     */
    handleHotUpdate({ file }) {
      const relativePath = path.relative(__dirname, file);
      const packagePath = relativePath.startsWith('packages/')
        ? relativePath.split('/').slice(0, 2).join('/')
        : null;

      if (!packagePath) {
        return;
      }

      exec(
        `cd ${packagePath} && npm run build:types`,
        (error, stdout, stderr) => {
          const date = new Date();
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          const seconds = date.getSeconds().toString().padStart(2, '0');

          if (error) {
            console.error(
              `\x1b[90m${hours}:${minutes}:${seconds} [build:types]: ${error}`,
              '\x1b[0m',
            );
            return;
          }

          console.log(
            `\x1b[90m${hours}:${minutes}:${seconds} [build:types] success`,
            '\x1b[0m',
          );
        },
      );
    },
  };
}
