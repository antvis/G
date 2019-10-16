module.exports = {
  extends: ['@commitlint/config-angular'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['build', 'ci', 'docs', 'site', 'feat', 'fix', 'perf', 'refactor', 'revert', 'style', 'test', 'chore'],
    ],
  },
};
