// See https://babeljs.io/docs/en/configuration

export default {
  /**
   * @see https://babeljs.io/docs/options#targets
   * default is es5
   */
  // targets: '',
  assumptions: {
    privateFieldsAsProperties: true,
    setPublicClassFields: true,
  },
  presets: [
    [
      '@babel/preset-env',
      {
        // Exclude transforms that make all code slower
        exclude: ['transform-typeof-symbol'],
      },
    ],
    '@babel/preset-typescript',
    '@babel/preset-react',
  ],
  plugins: [
    [
      '@babel/plugin-transform-typescript',
      {
        allowDeclareFields: true,
      },
    ],
    // https://babeljs.io/docs/en/babel-plugin-transform-runtime
    [
      '@babel/plugin-transform-runtime',
      {
        // By default, babel assumes babel/runtime version 7.0.0-beta.0,
        // explicitly resolving to match the provided helper functions.
        // https://github.com/babel/babel/issues/10261
        version: '7.25.6',
      },
    ],
  ],
};
