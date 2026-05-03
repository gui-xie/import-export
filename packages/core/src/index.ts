export type * from './ExcelDefinition';
import { ExcelDefinition } from './ExcelDefinition';
import type { DynamicExcelImportOptions, DynamicExcelImportResult } from './ExcelDefinition';
import { importExcel, importExcelDynamic, exportExcel, downloadExcelTemplate, fromExcel, fromExcelDynamic, toExcel, generateExcelTemplate, testUtils } from './utils.js';
import { initSync } from '@senlinz/import-export-wasm';
import defaultWasmUrl from '@senlinz/import-export-wasm/pkg/imexport_wasm_bg.wasm?url';

let runtimeReady = false;
let initializePromise: Promise<void> | null = null;

const WASM_INIT_MAX_RETRIES = 2;
const WASM_INIT_BASE_DELAY_MS = 500;

function resolveFetch(): typeof fetch {
  if (typeof fetch !== 'function') {
    throw new Error('WASM initialization requires a global fetch implementation in this runtime.');
  }
  return fetch;
}

async function loadDefaultWasmBytes(): Promise<Uint8Array> {
  const response = await resolveFetch()(defaultWasmUrl);
  if (!response.ok) {
    throw new Error(`Failed to load the bundled Excel WASM asset from '${defaultWasmUrl}'. HTTP ${response.status}.`);
  }
  return new Uint8Array(await response.arrayBuffer());
}

async function loadDefaultWasmBytesWithRetry(): Promise<Uint8Array> {
  let lastError: Error | undefined;
  for (let attempt = 0; attempt <= WASM_INIT_MAX_RETRIES; attempt++) {
    try {
      return await loadDefaultWasmBytes();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < WASM_INIT_MAX_RETRIES) {
        await delay(WASM_INIT_BASE_DELAY_MS * Math.pow(2, attempt));
      }
    }
  }
  throw new Error(`Failed to initialize WASM runtime after ${WASM_INIT_MAX_RETRIES + 1} attempts. Last error: ${lastError!.message}`);
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
        initSync({ module: bytes });
        runtimeReady = true;
      } catch (error) {
        throw new Error(`Failed to initialize the bundled Excel WASM runtime. ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        initializePromise = null;
      }
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
