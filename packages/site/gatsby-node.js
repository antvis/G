const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

exports.onCreateWebpackConfig = ({ getConfig }) => {
  const config = getConfig();

  config.node = {
    fs: 'empty',
  };

  config.plugins.push(
    new CopyWebpackPlugin({
      patterns: [{ from: '../../node_modules/canvaskit-wasm/bin/canvaskit.wasm' }],
    }),
  );

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
};
