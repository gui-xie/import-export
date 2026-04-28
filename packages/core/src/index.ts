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
import defaultWasmUrl from '@senlinz/import-export-wasm/pkg/imexport_wasm_bg.wasm?url';

let runtimeReady = false;
let initializePromise: Promise<void> | null = null;

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

async function ensureWasmInitialized() {
  if (runtimeReady) {
    return;
  }
  if (!initializePromise) {
    initializePromise = (async () => {
      try {
        const bytes = await loadDefaultWasmBytes();
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
