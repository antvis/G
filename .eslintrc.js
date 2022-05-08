module.exports = {
  extends: [require.resolve('@umijs/fabric/dist/eslint')],

  globals: {
    G: true,
  },

  ignorePatterns: ['packages/g-devtool', 'packages/g-webgpu-compiler', 'packages/site'],

  rules: {
    '@typescript-eslint/no-shadow': 0,
    '@typescript-eslint/no-parameter-properties': 0,
    'no-param-reassign': 0,
    'no-redeclare': 'off',
    '@typescript-eslint/no-invalid-this': 0,
    '@typescript-eslint/no-use-before-define': ['error', { functions: false, classes: false }],
    '@typescript-eslint/no-redeclare': ['error'],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        args: 'none',
      },
    ],
  },
};
