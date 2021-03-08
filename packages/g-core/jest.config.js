const esModules = ['lodash-es'].join('|');

module.exports = {
  preset: 'ts-jest',
  clearMocks: true,
  collectCoverageFrom: ['**/*.{ts,tsx}', '!**/node_modules/**', '!**/__tests__/**', '!**/*.d.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'clover'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  modulePathIgnorePatterns: ['dist'],
  moduleNameMapper: {
    '@antv/(.+)$': '<rootDir>../$1/src',
  },
  notify: true,
  notifyMode: 'always',
  testMatch: ['**/__tests__/*.spec.+(ts|tsx|js)', '**/*.test.+(ts|tsx|js)', '**/__tests__/*/*.spec.+(ts|tsx|js)'],
  transform: {
    // '^.+\\.(ts|tsx)$': 'ts-jest',
    // @see https://github.com/kulshekhar/ts-jest/issues/1130
    ['^.+\\.(ts|tsx|js)$']: 'babel-jest',
  },
  transformIgnorePatterns: [`<rootDir>../../node_modules/(?!${esModules})`],
  // setupFilesAfterEnv: ['<rootDir>../../jest/setupTests.ts'],
  snapshotSerializers: ['enzyme-to-json/serializer'],
};
