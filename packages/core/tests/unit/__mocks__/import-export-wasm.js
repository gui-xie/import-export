/**
 * Mock for @senlinz/import-export-wasm
 *
 * Stubs out all WASM exports so that pure JS helpers (testUtils)
 * can be tested without building the Rust/WASM package.
 */

export default async function init() {}

export function createTemplate() {
  throw new Error('createTemplate is not available in test environment');
}

export function importData() {
  throw new Error('importData is not available in test environment');
}

export function importDynamicData() {
  throw new Error('importDynamicData is not available in test environment');
}

export function exportData() {
  throw new Error('exportData is not available in test environment');
}

export function initSync() {}

export class ExcelInfo {
  constructor() {}
}

export class ExcelData {
  constructor() {}
}

export class ExcelColumnInfo {
  constructor() {}
}

export class ExcelCellFormat {
  constructor() {}
}

export class ExcelColumnData {
  constructor() {}
}

export class ExcelRowData {
  constructor() {}
}
