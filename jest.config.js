const path = require('path');
const { lstatSync, readdirSync } = require('fs');
// get listing of packages in the mono repo
const basePath = path.resolve(__dirname, 'packages');
const packages = readdirSync(basePath).filter((name) => {
  return lstatSync(path.join(basePath, name)).isDirectory();
});

// Installing third-party modules by tnpm or cnpm will name modules with underscore as prefix.
// In this case _{module} is also necessary.
const esm = ['internmap', 'd3-*', 'lodash-es']
  .map((d) => `_${d}|${d}`)
  .join('|');

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
  testTimeout: 100000,
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
  testEnvironment: 'jsdom',
  testMatch: [
    '<rootDir>/__tests__/unit/**/*/*.spec.+(ts|tsx|js)',
    '<rootDir>/__tests__/unit/*.spec.+(ts|tsx|js)',
  ],
  testPathIgnorePatterns: process.env.CI
    ? ['<rootDir>/__tests__/unit/g-gesture', '<rootDir>/__tests__/main.ts']
    : ['<rootDir>/__tests__/unit/g-gesture'],
  preset: 'ts-jest',
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        isolatedModules: true,
        tsconfig: {
          allowJs: true,
          target: 'esnext',
          esModuleInterop: true,
        },
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  modulePathIgnorePatterns: ['dist'],
  transformIgnorePatterns: [`<rootDir>/node_modules/(?!(?:.pnpm/)?(${esm}))`],
};
