const path = require('path');
const WasmPackPlugin = require('@wasm-tool/wasm-pack-plugin');

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

  config.plugins.push(
    new WasmPackPlugin({
      crateDirectory: path.join(__dirname, '../../rust'),
      // extraArgs: "--no-typescript",
      // outDir: "pkg",
      // forceMode: 'development',
      forceMode: 'production',
    }),
  );

  // Webpack 5
  // config.target = 'web';
  // config.experiments = {
  //   syncWebAssembly: true,
  // };
};
