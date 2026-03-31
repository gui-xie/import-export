import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const pkgDir = resolve(process.cwd(), 'pkg');
const jsPath = resolve(pkgDir, 'imexport_wasm.js');
const dtsPath = resolve(pkgDir, 'imexport_wasm.d.ts');
const wasmPath = resolve(pkgDir, 'imexport_wasm_bg.wasm');

const embeddedWasmBase64 = (await readFile(wasmPath)).toString('base64');
const jsSource = await readFile(jsPath, 'utf8');
const dtsSource = await readFile(dtsPath, 'utf8');

const patchedInitBlock = `
const embeddedWasmBase64 = '${embeddedWasmBase64}';

function decodeEmbeddedWasm() {
    if (typeof atob === 'function') {
        return Uint8Array.from(atob(embeddedWasmBase64), char => char.charCodeAt(0));
    }
    if (typeof Buffer !== 'undefined') {
        return Uint8Array.from(Buffer.from(embeddedWasmBase64, 'base64'));
    }
    throw new Error('Embedded WASM decoding requires atob or Buffer support.');
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = decodeEmbeddedWasm();
    }
    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        throw new Error('Network loading is disabled. Pass raw WASM bytes, a WebAssembly.Module, or a fetched Response to init().');
    }
    const imports = __wbg_get_imports();

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };`;

const patchedJsSource = jsSource.replace(
    /async function __wbg_init\(module_or_path\) \{[\s\S]*?export \{ initSync, __wbg_init as default \};/,
    patchedInitBlock.trim()
).replace(/Function\(/g, 'Callable(')
 .replace(/Function \{/g, 'Callable {')
 .replace(/'Function'/g, "'Callable'");

if (patchedJsSource === jsSource) {
    throw new Error('Failed to patch generated imexport_wasm.js init block.');
}

const patchedDtsSource = dtsSource
    .replace(/withImageFetcher\(fetcher: Function\): ExcelInfo;/g, 'withImageFetcher(fetcher: any): ExcelInfo;')
    .replace(/withProgressCallback\(callback: Function\): ExcelInfo;/g, 'withProgressCallback(callback: any): ExcelInfo;')
    .replace(
        /export type InitInput = RequestInfo \| URL \| Response \| BufferSource \| WebAssembly\.Module;/g,
        'export type InitInput = Response | BufferSource | WebAssembly.Module;'
    );

await writeFile(jsPath, patchedJsSource);
await writeFile(dtsPath, patchedDtsSource);
