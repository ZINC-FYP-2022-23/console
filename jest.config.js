const { pathsToModuleNameMapper } = require("ts-jest")
const { compilerOptions } = require("./tsconfig")

/**
 * We encountered an issue with Next.js 12.0.7 where `jest.mock()` is not mocking properly (the
 * mock implementation is entirely ignored). This is caused by `next/jest`, which uses the Rust compiler.
 * After trying multiple solutions in {@link https://github.com/vercel/next.js/issues/32539}, the best
 * solution is to opt-out the Rust compiler and opt-in the Babel compiler.
 * 
 * If we are upgrading Next.js in the future, please try using `next/jest` with Rust compiler again
 * to see if the issue persists.
 * 
 * https://nextjs.org/docs/testing#setting-up-jest-with-babel 
 */
module.exports = {
  setupFilesAfterEnv: ["jest-extended/all"],

  // Calls `jest.clearAllMocks()` before each test
  clearMocks: true,

  // on node 14.x coverage provider v8 offers good speed and more or less good report
  coverageProvider: 'v8',
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/.*/__tests__/utils/',
  ],
  testEnvironment: 'jsdom',
  transform: {
    // Use babel-jest to transpile tests with the next/babel preset
    // https://jestjs.io/docs/configuration#transform-objectstring-pathtotransformer--pathtotransformer-object
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(uuid)/)',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
}
