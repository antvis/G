// const path = require('path');
// const WasmPackPlugin = require('@wasm-tool/wasm-pack-plugin');

exports.onCreateWebpackConfig = ({ getConfig }) => {
  const config = getConfig();

  config.node = {
    fs: 'empty',
  };

  // config.resolve.fallback.fs = false;

  // config.module.rules.push({
  //   test: /\.glsl$/,
  //   use: [
  //     {
  //       loader: 'raw-loader',
  //       options: {},
  //     },
  //   ],
  // });

  // config.module.rules.push({
  //   test: /\.(glsl|vs|fs|vert|frag)$/,
  //   exclude: /node_modules/,
  //   use: [
  //     'raw-loader',
  //     'glslify-loader'
  //   ],
  // });
  // config.resolve.extensions.push('.glsl');

  // config.plugins.push(
  //   new WasmPackPlugin({
  //     crateDirectory: path.join(__dirname, '../../rust'),
  //     // extraArgs: "--no-typescript",
  //     // outDir: "pkg",
  //     // forceMode: 'development',
  //     forceMode: 'production',
  //   }),
  // );

  // Webpack 5
  // config.target = 'web';
  // config.experiments = {
  //   syncWebAssembly: true,
  // };
};
