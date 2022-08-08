const config = require('dotenv').config;

config({
  path: './.env'
});

module.exports = {
  collectCoverageFrom: [
    '<rootDir>/src/**/*.{ts,tsx}',
    '!<rootDir>/node_modules/',
    '!<rootDir>/application/types/*'
  ],
  coverageThreshold: {
    './src': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },
  globals: {
    'ts-jest': {
      diagnostics: true,
      tsconfig: 'tsconfig.json'
    }
  },
  moduleFileExtensions: ['js', 'json', 'jsx', 'node', 'ts', 'tsx'],
  preset: 'ts-jest',
  roots: ['<rootDir>'],
  testMatch: null,
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(ts|tsx)?$',
  testPathIgnorePatterns: ['node_modules'],
  testEnvironment: 'node',
  verbose: false,
  testTimeout: 300000
};
