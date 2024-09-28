import { Config } from '@stencil/core';
import imexportWasm from './rollup-plugin-imexport-wasm';
import { vueOutputTarget } from '@stencil/vue-output-target';
import terser from '@rollup/plugin-terser';
import { OutputTarget } from '@stencil/core/internal';

export const config: Config = {
  namespace: 'import-export',
  outputTargets: [
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: false,
      minify: true,
      sourcedMap: false
    },
    vueOutputTarget({
      componentCorePackage: '@senlinz/import-export',
      proxiesFile: '../vue/lib/proxies.ts',
      includeImportCustomElements: true
    }),
  ] as OutputTarget[],
  testing: {
    browserHeadless: "new",
  },
  rollupPlugins: {
    before: [imexportWasm(), terser()]
  }
};
