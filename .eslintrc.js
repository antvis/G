module.exports = {
  extends: [require.resolve('@umijs/fabric/dist/eslint')],

  // in antd-design-pro
  globals: {
    G: true,
  },

  rules: {
    '@typescript-eslint/no-shadow': 0,
    'no-param-reassign': 0,
  },
};
