export type * from './ExcelDefinition';
export type * from './errors';
import { ExcelDefinition } from './ExcelDefinition';
import type { DynamicExcelImportOptions, DynamicExcelImportResult } from './ExcelDefinition';
import { importExcel, importExcelDynamic, exportExcel, downloadExcelTemplate, fromExcel, fromExcelDynamic, toExcel, generateExcelTemplate, testUtils } from './utils.js';
import { ExportError, getErrorLocalization, getErrorMessage, ImportError, ImportExportError, localizeCaughtError, ValidationError, WasmInitError } from './errors.js';
import initWasm from '@senlinz/import-export-wasm';
import defaultWasmUrl from '@senlinz/import-export-wasm/pkg/imexport_wasm_bg.wasm?url';

let runtimeReady = false;
let initializePromise: Promise<void> | null = null;

const WASM_INIT_MAX_RETRIES = 2;
const WASM_INIT_BASE_DELAY_MS = 500;

function resolveFetch(): typeof fetch {
  if (typeof fetch !== 'function') {
    throw new WasmInitError('WASM_FETCH_REQUIRED');
  }
  return fetch;
}

async function loadDefaultWasmBytes(): Promise<Uint8Array> {
  const response = await resolveFetch()(defaultWasmUrl);
  if (!response.ok) {
    throw new WasmInitError('WASM_ASSET_LOAD_FAILED', {
      wasmUrl: defaultWasmUrl,
      status: response.status,
    });
  }
  return new Uint8Array(await response.arrayBuffer());
}

async function loadDefaultWasmBytesWithRetry(): Promise<Uint8Array> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= WASM_INIT_MAX_RETRIES; attempt++) {
    try {
      return await loadDefaultWasmBytes();
    } catch (error) {
      lastError = error;
      if (attempt < WASM_INIT_MAX_RETRIES) {
        await delay(WASM_INIT_BASE_DELAY_MS * Math.pow(2, attempt));
      }
    }
  }
  throw new WasmInitError(
    'WASM_INIT_RETRY_FAILED',
    {
      attempts: WASM_INIT_MAX_RETRIES + 1,
      lastError: getErrorMessage(lastError),
    },
    {},
    { cause: lastError },
  );
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function ensureWasmInitialized() {
  if (runtimeReady) {
    return;
  }
  if (!initializePromise) {
    initializePromise = (async () => {
      try {
        const bytes = await loadDefaultWasmBytesWithRetry();
        // Use wasm-bindgen's async initializer to avoid synchronous WASM compilation on the main thread.
        await initWasm({ module_or_path: bytes });
        runtimeReady = true;
      } catch (error) {
        throw localizeCaughtError(error, {}, 'WASM_INIT_FAILED', { reason: getErrorMessage(error) }, WasmInitError);
      } finally {
        initializePromise = null;
      }
    })();
  }
  return initializePromise;
}

async function ensureWasmInitializedFor(source?: ExcelDefinition | DynamicExcelImportOptions) {
  try {
    await ensureWasmInitialized();
  } catch (error) {
    throw localizeCaughtError(error, getErrorLocalization(source), 'WASM_INIT_FAILED', { reason: getErrorMessage(error) }, WasmInitError);
  }
}

async function _importExcel<T>(definition: ExcelDefinition): Promise<T[]> {
  await ensureWasmInitializedFor(definition);
  return importExcel(definition);
}

async function _importExcelDynamic(options?: DynamicExcelImportOptions): Promise<DynamicExcelImportResult> {
  await ensureWasmInitializedFor(options);
  return importExcelDynamic(options);
}

async function _exportExcel<T>(definition: ExcelDefinition, data: T[]): Promise<void> {
  await ensureWasmInitializedFor(definition);
  return exportExcel(definition, data);
}

async function _fromExcel<T>(definition: ExcelDefinition, buffer: Uint8Array): Promise<T[]> {
  await ensureWasmInitializedFor(definition);
  return fromExcel(definition, buffer);
}

async function _fromExcelDynamic(buffer: Uint8Array, options?: DynamicExcelImportOptions): Promise<DynamicExcelImportResult> {
  await ensureWasmInitializedFor(options);
  return fromExcelDynamic(buffer, options);
}

async function _toExcel<T>(definition: ExcelDefinition, data: T[]): Promise<Uint8Array> {
  await ensureWasmInitializedFor(definition);
  return toExcel(definition, data);
}

async function _downloadExcelTemplate(definition: ExcelDefinition): Promise<void> {
  await ensureWasmInitializedFor(definition);
  return downloadExcelTemplate(definition);
}

async function _generateExcelTemplate(definition: ExcelDefinition): Promise<Uint8Array> {
  await ensureWasmInitializedFor(definition);
  return generateExcelTemplate(definition);
}

export {
  ExportError,
  ImportError,
  ImportExportError,
  _importExcel as importExcel,
  _importExcelDynamic as importExcelDynamic,
  _exportExcel as exportExcel,
  _fromExcel as fromExcel,
  _fromExcelDynamic as fromExcelDynamic,
  _toExcel as toExcel,
  _downloadExcelTemplate as downloadExcelTemplate,
  _generateExcelTemplate as generateExcelTemplate,
  ValidationError,
  WasmInitError,
  testUtils,
};
