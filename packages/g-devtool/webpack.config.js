const path = require('path');

module.exports = {
  entry: {
    index: './ui/index.js',
  },
  mode: 'development',
  output: {
    path: path.resolve(__dirname, 'devtools/ui'),
    filename: 'ui.js',
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.js$|jsx/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [],
};
