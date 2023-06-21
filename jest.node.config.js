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
  testMatch: [
    '<rootDir>/__tests__/integration/__node__tests__/**/*/*.spec.+(ts|tsx|js)',
  ],
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      isolatedModules: true,
      tsconfig: {
        allowJs: true,
        target: 'esnext',
        esModuleInterop: true,
      },
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  modulePathIgnorePatterns: ['dist'],
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  transformIgnorePatterns: [
    // @see https://stackoverflow.com/a/69179139
    '/node_modules/(?!d3|d3-array|internmap|delaunator|robust-predicates)',
  ],
};
