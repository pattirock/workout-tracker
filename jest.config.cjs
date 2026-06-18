/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  collectCoverageFrom: [
    'backend/**/*.{ts,tsx}',
    'frontend/src/**/*.{ts,tsx}',
    '!**/__tests__/**',
    '!**/*.d.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      statements: 95,
      branches: 90,
      functions: 95,
      lines: 95
    },
    './backend/': {
      statements: 95,
      branches: 95,
      functions: 95,
      lines: 95
    },
    './frontend/src/': {
      statements: 95,
      branches: 95,
      functions: 95,
      lines: 95
    }
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  moduleNameMapper: {
    '^.+\\.css$': '<rootDir>/test/styleMock.js'
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.json' }]
  }
};
