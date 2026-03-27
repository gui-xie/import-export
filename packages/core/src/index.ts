export type * from './ExcelDefinition';
export type { InitializeWasmOptions } from './runtime.js';
import { ExcelDefinition } from './ExcelDefinition';
import {
  importExcel,
  exportExcel,
  downloadExcelTemplate,
  fromExcel,
  toExcel,
  generateExcelTemplate,
} from './utils.js';
import {
  bundledWasmSource,
  ensureWasmInitialized,
  initializeWasm,
} from './runtime.js';

function getUtils() {
  ensureWasmInitialized();
  return {
    importExcel,
    exportExcel,
    downloadExcelTemplate,
    fromExcel,
    toExcel,
    generateExcelTemplate,
  };
}

function _importExcel<T>(definition: ExcelDefinition): Promise<T[]> {
  ensureWasmInitialized();
  return importExcel(definition);
}

function _exportExcel<T>(definition: ExcelDefinition, data: T[]): Promise<void> {
  ensureWasmInitialized();
  return exportExcel(definition, data);
}

function _fromExcel<T>(definition: ExcelDefinition, buffer: Uint8Array): Promise<T[]> {
  ensureWasmInitialized();
  return fromExcel(definition, buffer);
}

function _toExcel<T>(definition: ExcelDefinition, data: T[]): Promise<Uint8Array> {
  ensureWasmInitialized();
  return toExcel(definition, data);
}

function _downloadExcelTemplate(definition: ExcelDefinition): Promise<void> {
  ensureWasmInitialized();
  return downloadExcelTemplate(definition);
}

function _generateExcelTemplate(definition: ExcelDefinition): Promise<Uint8Array> {
  ensureWasmInitialized();
  return generateExcelTemplate(definition);
}

export {
  bundledWasmSource,
  getUtils,
  initializeWasm,
  _importExcel as importExcel,
  _exportExcel as exportExcel,
  _fromExcel as fromExcel,
  _toExcel as toExcel,
  _downloadExcelTemplate as downloadExcelTemplate,
  _generateExcelTemplate as generateExcelTemplate,
};
