export type * from './ExcelDefinition';
import { ExcelDefinition } from './ExcelDefinition';
import type { DynamicExcelImportOptions, DynamicExcelImportResult } from './ExcelDefinition';
import {
  importExcel,
  importExcelDynamic,
  exportExcel,
  downloadExcelTemplate,
  fromExcel,
  fromExcelDynamic,
  toExcel,
  generateExcelTemplate,
  testUtils,
} from './utils.js';
import { initSync } from '@senlinz/import-export-wasm';
import bundledWasmSource from '@senlinz/import-export-wasm/pkg/imexport_wasm_bg.wasm';
import { gunzipSync } from 'fflate';
import defaultWasmUrl from '@senlinz/import-export-wasm/pkg/imexport_wasm_bg.wasm?url';

type WasmInitializationInputKind = 'source' | 'bytes' | 'module' | 'url';

type WasmFetchFn = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export interface InitializeWasmOptions {
  source?: string;
  bytes?: BufferSource;
  module?: WebAssembly.Module;
  url?: string;
  fetch?: WasmFetchFn;
}

type RuntimeState =
  | {
    kind: 'bundled';
  }
  | {
    kind: 'custom';
    inputKind: WasmInitializationInputKind;
    token: unknown;
  };

type NormalizedWasmInitialization =
  | {
    inputKind: 'source' | 'bytes' | 'module';
    module: BufferSource | WebAssembly.Module;
    token: unknown;
  }
  | {
    inputKind: 'url';
    url: string;
    fetch?: WasmFetchFn;
    token: string;
  };

let runtimeState: RuntimeState | null = null;
let pendingRuntimeState: RuntimeState | null = null;
let initializePromise: Promise<void> | null = null;

function decodeBase64(value: string): Uint8Array {
  if (typeof atob === 'function') {
    return Uint8Array.from(atob(value), char => char.charCodeAt(0));
  }
  if (typeof Buffer !== 'undefined') {
    return Uint8Array.from(Buffer.from(value, 'base64'));
  }
  throw new Error('WASM initialization requires a base64 decoder such as atob or Buffer.');
}

function decodeEmbeddedWasm(wasmSource: string): Uint8Array {
  const normalizedSource = wasmSource.trim();
  if (!normalizedSource) {
    throw new Error('Invalid WASM source provided to initializeWasm({ source }). Expected a non-empty gzipped base64 string.');
  }
  try {
    return gunzipSync(decodeBase64(normalizedSource));
  } catch (error) {
    throw new Error(
      `Invalid WASM source provided to initializeWasm({ source }). Expected a gzipped base64 string. ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

function isBufferSource(value: unknown): value is BufferSource {
  return value instanceof ArrayBuffer || ArrayBuffer.isView(value);
}

function getByteLength(value: BufferSource): number {
  try {
    return value.byteLength;
  } catch {
    throw new Error('Invalid WASM bytes provided to initializeWasm({ bytes }). Expected an ArrayBuffer or typed array with a valid byteLength property.');
  }
}

function resolveFetch(fetcher?: WasmFetchFn): WasmFetchFn {
  if (fetcher) {
    return fetcher;
  }
  if (typeof fetch !== 'function') {
    throw new Error('WASM initialization requires fetch in environments without a global fetch. Provide initializeWasm({ url, fetch }).');
  }
  return fetch;
}

async function bytesFromUrl(url: string, fetcher?: WasmFetchFn): Promise<Uint8Array> {
  const response = await resolveFetch(fetcher)(url);
  if (!response.ok) {
    throw new Error(`Failed to load WASM from '${url}'. HTTP ${response.status}.`);
  }
  return new Uint8Array(await response.arrayBuffer());
}

function getProvidedInputKinds(options: InitializeWasmOptions): WasmInitializationInputKind[] {
  const provided: WasmInitializationInputKind[] = [];
  if (options.source !== undefined) {
    provided.push('source');
  }
  if (options.bytes !== undefined) {
    provided.push('bytes');
  }
  if (options.module !== undefined) {
    provided.push('module');
  }
  if (options.url !== undefined) {
    provided.push('url');
  }
  return provided;
}

function normalizeCustomInitialization(options: InitializeWasmOptions): NormalizedWasmInitialization {
  const provided = getProvidedInputKinds(options);

  if (provided.length === 0) {
    throw new Error('initializeWasm(options) requires exactly one of source, bytes, module, or url.');
  }
  if (provided.length > 1) {
    throw new Error(
      `initializeWasm(options) accepts exactly one input source. Received: ${provided.join(', ')}.`
    );
  }

  if (provided[0] === 'source') {
    return {
      inputKind: 'source',
      module: decodeEmbeddedWasm(options.source!),
      token: options.source!,
    };
  }
  if (provided[0] === 'bytes') {
    if (!isBufferSource(options.bytes)) {
      throw new Error('Invalid WASM bytes provided to initializeWasm({ bytes }). Expected an ArrayBuffer or typed array.');
    }
    if (getByteLength(options.bytes) === 0) {
      throw new Error('Invalid WASM bytes provided to initializeWasm({ bytes }). Expected a non-empty ArrayBuffer or typed array.');
    }
    return {
      inputKind: 'bytes',
      module: options.bytes,
      token: options.bytes,
    };
  }
  if (provided[0] === 'module') {
    if (!(options.module instanceof WebAssembly.Module)) {
      throw new Error('Invalid WASM module provided to initializeWasm({ module }). Expected a WebAssembly.Module instance.');
    }
    return {
      inputKind: 'module',
      module: options.module,
      token: options.module,
    };
  }
  if (!options.url?.trim()) {
    throw new Error('Invalid WASM URL provided to initializeWasm({ url }). Expected a non-empty URL string.');
  }
  return {
    inputKind: 'url',
    url: options.url.trim(),
    fetch: options.fetch,
    token: options.url.trim(),
  };
}

function isSameRuntimeState(left: RuntimeState, right: RuntimeState): boolean {
  if (left.kind !== right.kind) {
    return false;
  }
  if (left.kind === 'bundled') {
    return true;
  }
  if (right.kind === 'bundled') {
    return false;
  }
  return left.inputKind === right.inputKind && left.token === right.token;
}

function getAlreadyInitializedError(nextState: RuntimeState): string {
  if (nextState.kind === 'custom' && pendingRuntimeState?.kind === 'custom') {
    return `The Excel WASM runtime is already initialized with custom ${pendingRuntimeState.inputKind} input and cannot be reinitialized with different ${nextState.inputKind} input in the same page/context. Refresh the page or create a new context to initialize with different WASM input.`;
  }
  if (nextState.kind === 'custom' && runtimeState?.kind === 'custom') {
    return `The Excel WASM runtime is already initialized with custom ${runtimeState.inputKind} input and cannot be reinitialized with different ${nextState.inputKind} input in the same page/context. Refresh the page or create a new context to initialize with different WASM input.`;
  }
  return 'The Excel WASM runtime is already using the bundled module. Call initializeWasm(...) before using other APIs to provide custom WASM.';
}

function initializeRuntimeSync(module: BufferSource | WebAssembly.Module, nextState: RuntimeState) {
  try {
    initSync({ module });
  } catch (error) {
    if (nextState.kind === 'custom') {
      throw new Error(
        `Failed to initialize the Excel WASM runtime from custom ${nextState.inputKind}. ${error instanceof Error ? error.message : String(error)}`
      );
    }
    throw new Error(`Failed to initialize the Excel WASM runtime. ${error instanceof Error ? error.message : String(error)}`);
  }
  runtimeState = nextState;
  pendingRuntimeState = null;
  initializePromise = null;
}

async function initializeRuntimeFromUrl(
  url: string,
  fetcher: WasmFetchFn | undefined,
  nextState: RuntimeState
): Promise<void> {
  try {
    const bytes = await bytesFromUrl(url, fetcher);
    initSync({ module: bytes });
    runtimeState = nextState;
  } catch (error) {
    if (nextState.kind === 'custom') {
      throw new Error(
        `Failed to initialize the Excel WASM runtime from custom ${nextState.inputKind}. ${error instanceof Error ? error.message : String(error)}`
      );
    }
    throw new Error(`Failed to initialize the Excel WASM runtime. ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    pendingRuntimeState = null;
    initializePromise = null;
  }
}

function initializeWasm(options: InitializeWasmOptions): Promise<void> | void {
  const normalized = normalizeCustomInitialization(options);
  const nextState: RuntimeState = {
    kind: 'custom',
    inputKind: normalized.inputKind,
    token: normalized.token,
  };

  if (runtimeState) {
    if (isSameRuntimeState(runtimeState, nextState)) {
      return initializePromise ?? Promise.resolve();
    }
    throw new Error(getAlreadyInitializedError(nextState));
  }

  if (pendingRuntimeState) {
    if (isSameRuntimeState(pendingRuntimeState, nextState)) {
      if (!initializePromise) {
        throw new Error('Internal WASM initialization state error: initializePromise was unexpectedly null during pending initialization. This indicates a bug in the library.');
      }
      return initializePromise;
    }
    throw new Error(getAlreadyInitializedError(nextState));
  }

  if (normalized.inputKind === 'url') {
    pendingRuntimeState = nextState;
    initializePromise = initializeRuntimeFromUrl(normalized.url, normalized.fetch, nextState);
    return initializePromise;
  }

  initializeRuntimeSync(normalized.module, nextState);
}

async function ensureWasmInitialized() {
  if (runtimeState) {
    return;
  }
  if (!initializePromise) {
    pendingRuntimeState = { kind: 'bundled' };
    initializePromise = initializeRuntimeFromUrl(defaultWasmUrl, undefined, { kind: 'bundled' });
  }
  return initializePromise;
}

async function _importExcel<T>(definition: ExcelDefinition): Promise<T[]> {
  await ensureWasmInitialized();
  return importExcel(definition);
}

async function _importExcelDynamic(options?: DynamicExcelImportOptions): Promise<DynamicExcelImportResult> {
  await ensureWasmInitialized();
  return importExcelDynamic(options);
}

async function _exportExcel<T>(definition: ExcelDefinition, data: T[]): Promise<void> {
  await ensureWasmInitialized();
  return exportExcel(definition, data);
}

async function _fromExcel<T>(definition: ExcelDefinition, buffer: Uint8Array): Promise<T[]> {
  await ensureWasmInitialized();
  return fromExcel(definition, buffer);
}

async function _fromExcelDynamic(buffer: Uint8Array, options?: DynamicExcelImportOptions): Promise<DynamicExcelImportResult> {
  await ensureWasmInitialized();
  return fromExcelDynamic(buffer, options);
}

async function _toExcel<T>(definition: ExcelDefinition, data: T[]): Promise<Uint8Array> {
  await ensureWasmInitialized();
  return toExcel(definition, data);
}

async function _downloadExcelTemplate(definition: ExcelDefinition): Promise<void> {
  await ensureWasmInitialized();
  return downloadExcelTemplate(definition);
}

async function _generateExcelTemplate(definition: ExcelDefinition): Promise<Uint8Array> {
  await ensureWasmInitialized();
  return generateExcelTemplate(definition);
}

export {
  bundledWasmSource,
  ensureWasmInitialized,
  initializeWasm,
  _importExcel as importExcel,
  _importExcelDynamic as importExcelDynamic,
  _exportExcel as exportExcel,
  _fromExcel as fromExcel,
  _fromExcelDynamic as fromExcelDynamic,
  _toExcel as toExcel,
  _downloadExcelTemplate as downloadExcelTemplate,
  _generateExcelTemplate as generateExcelTemplate,
  testUtils,
};
