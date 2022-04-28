module.exports = {
  collectCoverageFrom: [
    // 'packages/**/*.{ts,tsx}',
    'packages/g/**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'clover', 'lcov'],
  // coverageThreshold: {
  //   global: {
  //     branches: 80,
  //     functions: 80,
  //     lines: 80,
  //     statements: 80,
  //   },
  // },
  roots: ['<rootDir>packages'],
  runner: 'jest-electron/runner',
  testEnvironment: 'jest-electron/environment',
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      isolatedModules: true,
      tsConfig: {
        allowJs: true,
        target: 'ES2019',
      },
    },
  },
  testMatch: ['**/*/__tests__/*.spec.+(ts|tsx|js)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  modulePathIgnorePatterns: ['dist', '.fatherrc.ts'],
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!@mapbox)'],
};
