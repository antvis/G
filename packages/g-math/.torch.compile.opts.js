module.exports = {
  babelrc: {
    presets: ['@babel/env'],
    sourceMaps: 'inline',
  },
  extensions: ['.es6', '.es', '.jsx', '.js', '.ts'],
  include: ['src/**', 'lib/**', 'tests/**'],
  exclude: ['bower_components/**', 'node_modules/**'],
};
