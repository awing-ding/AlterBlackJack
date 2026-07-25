/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/.test-dist'],
  testMatch: ['**/*.spec.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/.test-dist/$1.js',
    '^@database/(.*)$': '<rootDir>/.test-dist/database/$1.js',
    '^@routes/(.*)$': '<rootDir>/.test-dist/routes/$1.js',
  },
  clearMocks: true,
};
