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

export interface InitializeWasmOptions {
  source?: string;
  bytes?: BufferSource;
  module?: WebAssembly.Module;
}

type WasmFetchFn = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

type ConfigureWasmOptions =
  | InitializeWasmOptions
  | {
    url: string;
    fetch?: WasmFetchFn;
  };

let configuredWasmOptions: ConfigureWasmOptions | null = null;
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

function hasDirectWasmInput(options: ConfigureWasmOptions): options is InitializeWasmOptions {
  return 'source' in options || 'bytes' in options || 'module' in options;
}

function resolveFetch(fetcher?: WasmFetchFn): WasmFetchFn {
  if (fetcher) {
    return fetcher;
  }
  if (typeof fetch !== 'function') {
    throw new Error('WASM initialization requires fetch. Provide configureWasm({ url, fetch }).');
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

function normalizeCustomInitialization(options: InitializeWasmOptions) {
  const hasSource = options.source !== undefined;
  const hasBytes = options.bytes !== undefined;
  const hasModule = options.module !== undefined;
  const providedCount = Number(hasSource) + Number(hasBytes) + Number(hasModule);

  if (providedCount === 0) {
    throw new Error('initializeWasm(options) requires exactly one of source, bytes, or module.');
  }
  if (providedCount > 1) {
    throw new Error('initializeWasm(options) accepts exactly one input source.');
  }

  if (hasSource) {
    return { module: decodeEmbeddedWasm(options.source!) as BufferSource | WebAssembly.Module };
  }
  if (hasBytes) {
    if (!isBufferSource(options.bytes)) {
      throw new Error('Invalid WASM bytes provided to initializeWasm({ bytes }). Expected an ArrayBuffer or typed array.');
    }
    return { module: options.bytes as BufferSource | WebAssembly.Module };
  }
  if (!(options.module instanceof WebAssembly.Module)) {
    throw new Error('Invalid WASM module provided to initializeWasm({ module }). Expected a WebAssembly.Module instance.');
  }
  return { module: options.module };
}

async function resolveWasmInitializationOptions(): Promise<InitializeWasmOptions> {
  if (configuredWasmOptions) {
    if (hasDirectWasmInput(configuredWasmOptions)) {
      return configuredWasmOptions;
    }
    return {
      bytes: await bytesFromUrl(configuredWasmOptions.url, configuredWasmOptions.fetch),
    };
  }

  return {
    bytes: await bytesFromUrl(defaultWasmUrl),
  };
}

function initializeWasm(options: InitializeWasmOptions) {
  const normalized = normalizeCustomInitialization(options);
  initSync({ module: normalized.module });
}

function configureWasm(options: ConfigureWasmOptions) {
  if (hasDirectWasmInput(options)) {
    if (options.bytes !== undefined && !isBufferSource(options.bytes)) {
      throw new Error('configureWasm({ bytes }) expects an ArrayBuffer or typed array.');
    }
    configuredWasmOptions = options;
    return;
  }

  if (!options.url?.trim()) {
    throw new Error('configureWasm({ url }) expects a non-empty URL string.');
  }

  configuredWasmOptions = {
    ...options,
    url: options.url.trim(),
  };
}

const configureViteWasm = configureWasm;

async function ensureWasmInitialized() {
  if (!initializePromise) {
    initializePromise = (async () => {
      const options = await resolveWasmInitializationOptions();
      initializeWasm(options);
    })();
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
  configureWasm,
  configureViteWasm,
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

export type {
  ConfigureWasmOptions,
};
