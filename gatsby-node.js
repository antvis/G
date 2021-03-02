const path = require('path');
exports.onCreateWebpackConfig = ({ getConfig }) => {
  const config = getConfig();

  config.module.rules.push({
    test: /\.glsl$/,
    use: [
      {
        loader: 'raw-loader',
        options: {},
      },
    ],
  });

  config.resolve.extensions.push('.glsl');
  // config.resolve.alias = {
  //   ...config.resolve.alias,
  //   '@antv/g-webgpu': path.resolve(__dirname, 'packages/g-webgpu/src'),
  //   '@antv/g-webgpu-core': path.resolve(__dirname, 'packages/core/src'),
  //   '@antv/g-webgpu-engine': path.resolve(__dirname, 'packages/engine/src'),
  //   '@antv/g-webgpu-compiler': path.resolve(__dirname, 'packages/compiler/src'),
  //   '@antv/g-webgpu-interactor': path.resolve(__dirname, 'packages/interactor/src'),
  //   '@antv/g-webgpu-unitchart': path.resolve(__dirname, 'packages/unitchart/src'),
  //   '@antv/g-webgpu-raytracer': path.resolve(__dirname, 'packages/raytracer/src'),
  // };
};
