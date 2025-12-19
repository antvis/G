import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [preact(), tailwindcss()],
  server: {
    open: '/',
  },
  resolve: {
    alias: {
      '@antv/g-local': path.resolve(__dirname, '../packages/g/src'),
      '@antv/g-mobile-webgl-local': path.resolve(
        __dirname,
        '../packages/g-mobile-webgl/src',
      ),
      '@antv/g-plugin-matterjs-local': path.resolve(
        __dirname,
        '../packages/g-plugin-matterjs/src',
      ),
      '@antv/g-canvas-local': path.resolve(
        __dirname,
        '../packages/g-canvas/src',
      ),
      '@antv/g-plugin-3d-local': path.resolve(
        __dirname,
        '../packages/g-plugin-3d/src',
      ),
      '@antv/g-plugin-physx-local': path.resolve(
        __dirname,
        '../packages/g-plugin-physx/src',
      ),
      '@antv/g-canvaskit-local': path.resolve(
        __dirname,
        '../packages/g-canvaskit/src',
      ),
      '@antv/g-plugin-a11y-local': path.resolve(
        __dirname,
        '../packages/g-plugin-a11y/src',
      ),
      '@antv/g-plugin-rough-canvas-renderer-local': path.resolve(
        __dirname,
        '../packages/g-plugin-rough-canvas-renderer/src',
      ),
      '@antv/g-components-local': path.resolve(
        __dirname,
        '../packages/g-components/src',
      ),
      '@antv/g-plugin-annotation-local': path.resolve(
        __dirname,
        '../packages/g-plugin-annotation/src',
      ),
      '@antv/g-plugin-rough-svg-renderer-local': path.resolve(
        __dirname,
        '../packages/g-plugin-rough-svg-renderer/src',
      ),
      '@antv/g-plugin-box2d-local': path.resolve(
        __dirname,
        '../packages/g-plugin-box2d/src',
      ),
      '@antv/g-devtool-local': path.resolve(
        __dirname,
        '../packages/g-devtool/src',
      ),
      '@antv/g-plugin-yoga-local': path.resolve(
        __dirname,
        '../packages/g-plugin-yoga/src',
      ),
      '@antv/g-plugin-zdog-canvas-renderer-local': path.resolve(
        __dirname,
        '../packages/g-plugin-zdog-canvas-renderer/src',
      ),
      '@antv/g-gesture-local': path.resolve(
        __dirname,
        '../packages/g-gesture/src',
      ),
      '@antv/g-plugin-zdog-svg-renderer-local': path.resolve(
        __dirname,
        '../packages/g-plugin-zdog-svg-renderer/src',
      ),
      '@antv/g-plugin-control-local': path.resolve(
        __dirname,
        '../packages/g-plugin-control/src',
      ),
      '@antv/g-shader-components-local': path.resolve(
        __dirname,
        '../packages/g-shader-components/src',
      ),
      '@antv/g-plugin-css-select-local': path.resolve(
        __dirname,
        '../packages/g-plugin-css-select/src',
      ),
      '@antv/g-svg-local': path.resolve(__dirname, '../packages/g-svg/src'),
      '@antv/g-lite-local': path.resolve(__dirname, '../packages/g-lite/src'),
      '@antv/g-plugin-device-renderer-local': path.resolve(
        __dirname,
        '../packages/g-plugin-device-renderer/src',
      ),
      '@antv/g-lottie-player-local': path.resolve(
        __dirname,
        '../packages/g-lottie-player/src',
      ),
      '@antv/g-web-components-local': path.resolve(
        __dirname,
        '../packages/g-web-components/src',
      ),
      '@antv/g-math-local': path.resolve(__dirname, '../packages/g-math/src'),
      '@antv/g-plugin-dragndrop-local': path.resolve(
        __dirname,
        '../packages/g-plugin-dragndrop/src',
      ),
      '@antv/g-webgl-local': path.resolve(__dirname, '../packages/g-webgl/src'),
      '@antv/g-mobile-canvas-local': path.resolve(
        __dirname,
        '../packages/g-mobile-canvas/src',
      ),
      '@antv/g-plugin-gesture-local': path.resolve(
        __dirname,
        '../packages/g-plugin-gesture/src',
      ),
      '@antv/g-webgpu-local': path.resolve(
        __dirname,
        '../packages/g-webgpu/src',
      ),
      '@antv/react-g-local': path.resolve(__dirname, '../packages/react-g/src'),
      '@antv/g-mobile-svg-local': path.resolve(
        __dirname,
        '../packages/g-mobile-svg/src',
      ),
    },
  },
});
