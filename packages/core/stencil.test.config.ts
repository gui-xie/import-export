import { Config } from '@stencil/core';
import imexportWasm from './rollup-plugin-imexport-wasm';
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
      dir: 'tests/dist/'
    }
  ] as OutputTarget[],
  rollupPlugins: {
    before: [imexportWasm(), terser()]
  }
};
