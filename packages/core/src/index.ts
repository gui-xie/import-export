export type * from './ExcelDefinition';
export type { InitializeWasmOptions } from './runtime.js';
import { ExcelDefinition } from './ExcelDefinition';
import type { DynamicExcelImportOptions, DynamicExcelImportResult } from './ExcelDefinition';
import {
  ExportError,
  ImportError,
  ImportExportError,
  ValidationError,
  WasmInitError,
} from './errors.js';
import {
  importExcel,
  importExcelDynamic,
  exportExcel,
  downloadExcelTemplate,
  fromExcel,
  fromExcelDynamic,
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
    importExcelDynamic,
    exportExcel,
    downloadExcelTemplate,
    fromExcel,
    fromExcelDynamic,
    toExcel,
    generateExcelTemplate,
  };
}

function _importExcel<T>(definition: ExcelDefinition): Promise<T[]> {
  ensureWasmInitialized();
  return importExcel(definition);
}

function _importExcelDynamic(options?: DynamicExcelImportOptions): Promise<DynamicExcelImportResult>;
function _importExcelDynamic<THeader extends string>(options: DynamicExcelImportOptions<THeader> & { expectedHeaders: readonly THeader[] }): Promise<DynamicExcelImportResult<THeader>>;
function _importExcelDynamic<THeader extends string = string>(options?: DynamicExcelImportOptions<THeader>): Promise<DynamicExcelImportResult | DynamicExcelImportResult<THeader>> {
  ensureWasmInitialized();
  return importExcelDynamic(options);
}

function _exportExcel<T>(definition: ExcelDefinition, data: T[]): Promise<void> {
  ensureWasmInitialized();
  return exportExcel(definition, data);
}

function _fromExcel<T>(definition: ExcelDefinition, buffer: Uint8Array): Promise<T[]> {
  ensureWasmInitialized();
  return fromExcel(definition, buffer);
}

function _fromExcelDynamic(buffer: Uint8Array, options?: DynamicExcelImportOptions): Promise<DynamicExcelImportResult>;
function _fromExcelDynamic<THeader extends string>(buffer: Uint8Array, options: DynamicExcelImportOptions<THeader> & { expectedHeaders: readonly THeader[] }): Promise<DynamicExcelImportResult<THeader>>;
function _fromExcelDynamic<THeader extends string = string>(buffer: Uint8Array, options?: DynamicExcelImportOptions<THeader>): Promise<DynamicExcelImportResult | DynamicExcelImportResult<THeader>> {
  ensureWasmInitialized();
  return fromExcelDynamic(buffer, options);
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
  ExportError,
  getUtils,
  ImportError,
  ImportExportError,
  initializeWasm,
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
};
