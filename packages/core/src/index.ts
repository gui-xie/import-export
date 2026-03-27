export type * from './ExcelDefinition';
import { ExcelDefinition } from './ExcelDefinition';
import {
    importExcel,
    exportExcel,
    downloadExcelTemplate,
    fromExcel,
    toExcel,
    generateExcelTemplate,
    initializeWasm,
} from './utils.js';

function getUtils() {
    initializeWasm();
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
    initializeWasm();
    return importExcel(definition);
}

function _exportExcel<T>(definition: ExcelDefinition, data: T[]): Promise<void> {
    initializeWasm();
    return exportExcel(definition, data);
}

function _fromExcel<T>(definition: ExcelDefinition, buffer: Uint8Array): Promise<T[]> {
    initializeWasm();
    return fromExcel(definition, buffer);
}

function _toExcel<T>(definition: ExcelDefinition, data: T[]): Promise<Uint8Array> {
    initializeWasm();
    return toExcel(definition, data);
}

function _downloadExcelTemplate(definition: ExcelDefinition): Promise<void> {
    initializeWasm();
    return downloadExcelTemplate(definition);
}

export {
    getUtils,
    _importExcel as importExcel,
    _exportExcel as exportExcel,
    _fromExcel as fromExcel,
    _toExcel as toExcel,
    _downloadExcelTemplate as downloadExcelTemplate
};
