import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let cachedWasmBytes;

export function readBuiltWasmArrayBuffer() {
  if (!cachedWasmBytes) {
    const assetsDir = path.resolve(__dirname, '../../dist/assets');
    const wasmFile = fs.readdirSync(assetsDir).find(file => file.endsWith('.wasm'));
    if (!wasmFile) {
      throw new Error(`No built WASM asset found in '${assetsDir}'. Run the core build before unit tests.`);
    }
    cachedWasmBytes = fs.readFileSync(path.join(assetsDir, wasmFile));
  }

  return cachedWasmBytes.buffer.slice(cachedWasmBytes.byteOffset, cachedWasmBytes.byteOffset + cachedWasmBytes.byteLength);
}
