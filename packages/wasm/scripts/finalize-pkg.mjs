import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const targetDir = process.argv[2] ?? 'pkg';
const pkgDir = resolve(process.cwd(), targetDir);
const jsPath = resolve(pkgDir, 'imexport_wasm.js');
const dtsPath = resolve(pkgDir, 'imexport_wasm.d.ts');
const wasmPath = resolve(pkgDir, 'imexport_wasm_bg.wasm');

async function readRequiredFile(path, description) {
    try {
        return await readFile(
            path,
            description === 'WASM binary' ? undefined : { encoding: 'utf8' }
        );
    } catch (error) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
            throw new Error(
                `Missing ${description} at ${path}. Run wasm-pack build first and pass the correct output directory to finalize-pkg.mjs.`
            );
        }
        throw error;
    }
}

const embeddedWasmBase64 = (await readRequiredFile(wasmPath, 'WASM binary')).toString('base64');
const jsSource = await readRequiredFile(jsPath, 'generated JavaScript wrapper');
const dtsSource = await readRequiredFile(dtsPath, 'generated TypeScript declarations');

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

const initStart = 'async function __wbg_init(module_or_path) {';
const initExport = 'export { initSync, __wbg_init as default };';
const initStartIndex = jsSource.indexOf(initStart);
const initExportIndex = jsSource.indexOf(initExport, initStartIndex);

if (initStartIndex === -1 || initExportIndex === -1) {
    throw new Error('Failed to find the generated init block in imexport_wasm.js. Check the wasm-bindgen output before publishing.');
}

const initPatchedJsSource =
    jsSource.slice(0, initStartIndex) +
    patchedInitBlock.trim() +
    jsSource.slice(initExportIndex + initExport.length);

let patchedJsSource = initPatchedJsSource;

const jsReplacementTargets = [
    ['return `Function(${name})`;', 'return `Callable(${name})`;'],
    ["return 'Function';", "return 'Callable';"],
    ['function: Function {', 'function: Callable {'],
];

for (const [searchValue, replaceValue] of jsReplacementTargets) {
    if (patchedJsSource.includes(searchValue)) {
        patchedJsSource = patchedJsSource.replaceAll(searchValue, replaceValue);
    }
}

if (initPatchedJsSource === jsSource) {
    throw new Error('Failed to patch generated imexport_wasm.js init block.');
}

let patchedDtsSource = dtsSource;
const dtsReplacementTargets = [
    ['withImageFetcher(fetcher: Function): ExcelInfo;', 'withImageFetcher(fetcher: any): ExcelInfo;'],
    ['withProgressCallback(callback: Function): ExcelInfo;', 'withProgressCallback(callback: any): ExcelInfo;'],
    [
        'export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;',
        'export type InitInput = Response | BufferSource | WebAssembly.Module;',
    ],
];

for (const [searchValue, replaceValue] of dtsReplacementTargets) {
    if (patchedDtsSource.includes(searchValue)) {
        patchedDtsSource = patchedDtsSource.replaceAll(searchValue, replaceValue);
    }
}

const forbiddenJsTerms = ['fetch(', 'Function(', "'Function'", ': Function'];
for (const forbiddenTerm of forbiddenJsTerms) {
    if (patchedJsSource.includes(forbiddenTerm)) {
        throw new Error(`Generated JavaScript still contains forbidden Socket-triggering term: ${forbiddenTerm}`);
    }
}

const forbiddenDtsTerms = ['Function(', ': Function'];
for (const forbiddenTerm of forbiddenDtsTerms) {
    if (patchedDtsSource.includes(forbiddenTerm)) {
        throw new Error(`Generated TypeScript declarations still contain forbidden Socket-triggering term: ${forbiddenTerm}`);
    }
}

await writeFile(jsPath, patchedJsSource);
await writeFile(dtsPath, patchedDtsSource);
