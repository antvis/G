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

  testMatch: ['<rootDir>/integration/__node__tests__/**/*/*.spec.+(ts|tsx|js)'],
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      isolatedModules: true,
      tsconfig: {
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
  transformIgnorePatterns: [
    // '<rootDir>/node_modules/(?!@mapbox)',
    // @see https://stackoverflow.com/a/69179139
    '/node_modules/(?!d3|d3-array|internmap|delaunator|robust-predicates|lodash-es)',
  ],
};
