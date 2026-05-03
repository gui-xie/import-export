export default {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/unit/**/*.test.mjs'],
  moduleNameMapper: {
    '^@senlinz/import-export-wasm/pkg/imexport_wasm_bg\\.wasm': '<rootDir>/tests/unit/__mocks__/import-export-wasm-url.js',
    '^@senlinz/import-export-wasm$': '<rootDir>/tests/unit/__mocks__/import-export-wasm.js',
  },
};
