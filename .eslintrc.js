module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],

  globals: {
    G: true,
    window: true,
    document: true,
    module: true,
  },

  ignorePatterns: [
    'packages/g-devtool',
    'packages/g-webgpu-compiler',
    'packages/site',
  ],

  rules: {
    'no-fallthrough': 0,
    'no-empty': 0,
    'no-param-reassign': 0,
    'no-redeclare': 'off',
    'no-useless-escape': 'off',
    'no-case-declarations': 'off',
    'no-constant-condition': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-shadow': 0,
    '@typescript-eslint/no-parameter-properties': 0,
    '@typescript-eslint/ban-ts-comment': 0,
    '@typescript-eslint/no-empty-function': 0,
    '@typescript-eslint/no-invalid-this': 0,
    '@typescript-eslint/no-use-before-define': [
      'error',
      { functions: false, classes: false },
    ],
    '@typescript-eslint/no-redeclare': ['error'],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        args: 'none',
        ignoreRestSiblings: true,
      },
    ],
  },
};
