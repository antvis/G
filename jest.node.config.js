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
      // FIXME: use `src` so that we can collect coverage?
      [`@antv/${name}$`]: `<rootDir>/packages/./${name}/`,
    }),
    {},
  ),
  // @see https://stackoverflow.com/a/75928101
  d3: '<rootDir>/node_modules/d3/dist/d3.min.js',
  '^d3-(.*)$': '<rootDir>/node_modules/d3-$1/dist/d3-$1.min.js',
};

module.exports = {
  testTimeout: 100000,
  moduleNameMapper: moduleNameMapper,
  testMatch: ['<rootDir>/__tests__/integration/*.spec.+(ts|tsx|js)'],
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
  globalSetup: './scripts/jest/setup.js',
  globalTeardown: './scripts/jest/teardown.js',
  testEnvironment: './scripts/jest/environment.js',
  transformIgnorePatterns: [`<rootDir>/node_modules/(?!(?:.pnpm/)?(${esm}))`],
};
