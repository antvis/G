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
  collectCoverageFrom: [
    'packages/g/src/**/*.{ts,tsx}',
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

  // @see https://jestjs.io/docs/configuration#projects-arraystring--projectconfig
  projects: [
    {
      displayName: 'node-canvas',
      testMatch: ['**/*/__node__tests__/*.spec.+(ts|tsx|js)'],
    },
    {
      displayName: 'browser',
      runner: 'jest-electron/runner',
      testEnvironment: 'jest-electron/environment',
      testMatch: ['**/*/__tests__/*.spec.+(ts|tsx|js)'],
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
    },
  ],
  roots: ['<rootDir>packages'],
};
