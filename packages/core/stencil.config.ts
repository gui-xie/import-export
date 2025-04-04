import { Config } from '@stencil/core';
import imexportWasm from './rollup-plugin-imexport-wasm';
import terser from '@rollup/plugin-terser';

export const config: Config = {
  namespace: 'import-export',
  outputTargets: [
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: false,
      minify: true,
      generateTypeDeclarations: true
    }
  ],
  testing: {
    browserHeadless: false,
    testRegex: ['src/.*\\.spec\\.(ts|tsx)$'],
    
  },
  rollupPlugins: {
    before: [imexportWasm(), terser()]
  }
};
