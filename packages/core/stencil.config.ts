import { Config } from '@stencil/core';
import imexportWasm from './rollup-plugin-imexport-wasm';
import { vueOutputTarget } from '@stencil/vue-output-target';
import terser from '@rollup/plugin-terser';

export const config: Config = {
  namespace: 'imexport-table',
  outputTargets: [
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: false,
    },
    vueOutputTarget({
      componentCorePackage: '@senlinz/import-export',
      proxiesFile: '../vue/lib/proxies.ts',
      includeImportCustomElements: true
    })
  ],
  testing: {
    browserHeadless: "new",
  },
  rollupPlugins: {
    before: [imexportWasm(), terser()]
  }
};
