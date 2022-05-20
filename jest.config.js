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
    // '<rootDir>/packages/g/src/**/*.{ts,tsx}',
    '<rootDir>/packages/g/lib/**/*.{js,jsx}',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/__node__tests__/**',
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

  // runner: 'jest-electron/runner',
  // testEnvironment: 'jest-electron/environment',
  // testMatch: ['<rootDir>/packages/**/*/__tests__/*.spec.+(ts|tsx|js)'],
  // preset: 'ts-jest',
  // globals: {
  //   'ts-jest': {
  //     isolatedModules: true,
  //     tsConfig: {
  //       allowJs: true,
  //       target: 'ES2019',
  //     },
  //   },
  // },
  // moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  // modulePathIgnorePatterns: ['dist', '.fatherrc.ts'],
  // transform: {
  //   '^.+\\.[tj]s$': 'ts-jest',
  // },
  // transformIgnorePatterns: ['<rootDir>/node_modules/(?!@mapbox)'],

  // @see https://jestjs.io/docs/configuration#projects-arraystring--projectconfig
  projects: [
    {
      // use node-canvas & headless-gl
      displayName: 'server-side',
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
      transformIgnorePatterns: ['<rootDir>/node_modules/(?!@mapbox)'],
    },
    {
      displayName: 'browser',
      runner: 'jest-electron/runner',
      testEnvironment: 'jest-electron/environment',
      testMatch: ['<rootDir>/packages/**/*/__tests__/*.spec.+(ts|tsx|js)'],
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
      transformIgnorePatterns: ['<rootDir>/node_modules/(?!@mapbox)'],
    },
  ],
};
