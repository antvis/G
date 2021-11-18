const path = require('path');
// const CopyPlugin = require('copy-webpack-plugin');
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
    // new CopyPlugin({
    //   // All .wasm files are currently expected to be at the root
    //   patterns: [
    //     { from: 'src/**/*.wasm', to: '[name].[ext]' },
    //     // { from: 'node_modules/librw/lib/librw.wasm', to: '[name].[ext]' },
    //   ],
    // }),
    new WasmPackPlugin({
      crateDirectory: path.join(__dirname, '../../rust'),
      // extraArgs: "--no-typescript",
      // outDir: "pkg",
      forceMode: 'development',
      // forceMode: "production",
    }),
  );
  config.target = 'web';

  // config.experiments = {
  //   syncWebAssembly: true,
  // };
};
