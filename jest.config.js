const path = require('path');
const { lstatSync, readdirSync } = require('fs');
// get listing of packages in the mono repo
const basePath = path.resolve(__dirname, 'packages');
const packages = readdirSync(basePath).filter((name) => {
  return lstatSync(path.join(basePath, name)).isDirectory();
});

// @see https://blog.ah.technology/a-guide-through-the-wild-wild-west-of-setting-up-a-mono-repo-part-2-adding-jest-with-a-breeze-16e08596f0de
const moduleNameMapper = {
  ...packages.reduce(
    (acc, name) => ({
      ...acc,
      [`@antv/${name}$`]: `<rootDir>/packages/./${name}/src/`,
    }),
    {},
  ),
};

module.exports = {
  moduleNameMapper: moduleNameMapper,
  collectCoverageFrom: ['<rootDir>/packages/g-lite/src/**/*.{ts,tsx}'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/',
    '/__node__tests__/',
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

  runner: 'jest-electron/runner',
  testEnvironment: 'jest-electron/environment',
  testMatch: [
    '<rootDir>/__tests__/unit/**/*/*.spec.+(ts|tsx|js)',
    '<rootDir>/__tests__/unit/*.spec.+(ts|tsx|js)',
    // '<rootDir>/packages/**/*/*.spec.+(ts|tsx|js)'
  ],
  testPathIgnorePatterns: process.env.CI
    ? ['<rootDir>/__tests__/unit/g-gesture']
    : [],
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
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  modulePathIgnorePatterns: ['dist', '.fatherrc.ts'],
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!@mapbox)'],
};
