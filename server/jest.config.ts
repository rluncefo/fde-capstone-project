import type { Config } from 'jest';

// Force NODE_ENV=test so the Express app.listen() guard fires correctly
// even when the container starts with NODE_ENV=development.
process.env.NODE_ENV = 'test';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
  // Runs after the test framework is installed — jest globals are available here
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  globals: {
    'ts-jest': {
      tsconfig: { strict: false },
    },
  },
};

export default config;
