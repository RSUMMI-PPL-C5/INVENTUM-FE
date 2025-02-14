// eslint-disable-next-line @typescript-eslint/no-require-imports
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  preset: 'ts-jest',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // Ensure this is pointing to the correct directory
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest', // Transform TypeScript files using ts-jest
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverage: true,  // Enable test coverage collection
  coverageReporters: [ 'lcov', 'text', 'html', 'json'],  // Coverage formats you want (text for terminal, html for a webpage, json for data)
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],  // Files to collect coverage from
  coveragePathIgnorePatterns: ['/node_modules/', '/.next/', '/coverage/'],  // Paths to ignore for coverage
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: './coverage', outputName: 'jest-test-results.xml' }] // JUnit report for SonarQube
  ],
};

module.exports = createJestConfig(customJestConfig);