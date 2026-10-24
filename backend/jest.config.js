/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  verbose: true,
  testTimeout: 15000,
  // Run tests sequentially — they share a single SQLite DB
  maxWorkers: 1,
  // Test files live in __tests__/
  testMatch: ['**/__tests__/**/*.test.js'],
  // Set NODE_ENV before any modules load
  setupFiles: ['./__tests__/envSetup.js'],
  // Clear module cache between test files
  clearMocks: true,
  // Coverage (optional — run with --coverage)
  collectCoverageFrom: [
    'routes/**/*.js',
    'controllers/**/*.js',
    'middleware/**/*.js',
    'config/database.js'
  ]
};
