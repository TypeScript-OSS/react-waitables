export default {
  preset: 'ts-jest',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  testEnvironment: 'jsdom',
  coverageReporters: ['text', 'html'],
  globals: {
    'ts-jest': {
      isolatedModules: true,
      useESM: true
    }
  },
  moduleNameMapper: {
    '(.+)\\.js': '$1'
  },
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 90,
      lines: 90,
      statements: 90
    }
  }
};
