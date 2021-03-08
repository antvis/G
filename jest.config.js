module.exports = {
  collectCoverageFrom: ['packages/**/*.{ts,tsx}', '!**/node_modules/**', '!**/__tests__/**', '!**/*.d.ts'],
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
  roots: ['<rootDir>packages'],
};
