// https://jestjs.io/docs/configuration

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
      [`@antv/${name}$`]: `<rootDir>/packages/${name}/src/`,
    }),
    {},
  ),
};

/** @type {import('jest').Config} */
module.exports = {
  testTimeout: 100000,
  moduleNameMapper: moduleNameMapper,
  collectCoverageFrom: [
    '<rootDir>/packages/g/src/**/*.{ts,tsx}',
    '<rootDir>/packages/g-lite/src/**/*.{ts,tsx}',
    '<rootDir>/packages/g-plugin-canvas-path-generator/src/**/*.{ts,tsx}',
    '<rootDir>/packages/g-plugin-image-loader/src/**/*.{ts,tsx}',
    '<rootDir>/packages/g-plugin-dom-interaction/src/**/*.{ts,tsx}',
    '<rootDir>/packages/g-web-animations-api/src/**/*.{ts,tsx}',
    '<rootDir>/packages/g-camera-api/src/**/*.{ts,tsx}',
    '<rootDir>/packages/g-plugin-html-renderer/src/**/*.{ts,tsx}',
    //
    '<rootDir>/packages/g-canvas/src/**/*.{ts,tsx}',
    '<rootDir>/packages/g-plugin-canvas-renderer/src/**/*.{ts,tsx}',
    '<rootDir>/packages/g-plugin-canvas-picker/src/**/*.{ts,tsx}',
    //
    '<rootDir>/packages/g-svg/src/**/*.{ts,tsx}',
    '<rootDir>/packages/g-plugin-svg-renderer/src/**/*.{ts,tsx}',
    '<rootDir>/packages/g-plugin-svg-picker/src/**/*.{ts,tsx}',
  ],
  coveragePathIgnorePatterns: ['/node_modules/', '/__tests__/'],
  coverageDirectory: 'coverage',
  coverageReporters: ['clover', 'json', 'lcov', 'text'],
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
