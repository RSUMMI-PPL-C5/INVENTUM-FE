const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  preset: 'ts-jest',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverage: true, 
  coverageReporters: [ 'lcov', 'text', 'html', 'json'], 
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'], 
  coveragePathIgnorePatterns: ['/node_modules/', '/.next/', '/coverage/'], 
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: './coverage', outputName: 'jest-test-results.xml' }]
  ],
};

module.exports = createJestConfig(customJestConfig);