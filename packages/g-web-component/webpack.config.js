const path = require('path');

module.exports = {
  entry: {
    gcanvas: './src/register/canvas.ts',
    gwebgl: './src/register/webgl.ts'
  },
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: '[name].min.js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  optimization: {
    usedExports: true,
  },
};