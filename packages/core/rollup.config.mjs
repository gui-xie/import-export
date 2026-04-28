import { terser } from 'rollup-plugin-terser';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import imexportWasm from './rollup-plugin-imexport-wasm.js';

export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'esm',
    sourcemap: true,
    entryFileNames: '[name].js',
    chunkFileNames: '[name]-[hash].js',
    assetFileNames: 'assets/[name]-[hash][extname]'
  },
  plugins: [
    imexportWasm(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist/types'
    }),
    resolve(),
    commonjs(),
    terser()
  ]
};
