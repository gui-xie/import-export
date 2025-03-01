export type * from './components.d.ts';
import { ExcelDefinition } from './declarations/ExcelDefinition.js';
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
    }
}

function _importExcel<T>(defintion: ExcelDefinition): Promise<T[]> {
    initializeWasm();
    return importExcel(defintion);
}

function _exportExcel<T>(defintion: ExcelDefinition, data: T[]): Promise<void> {
    initializeWasm();
    return exportExcel(defintion, data);
}

function _fromExcel<T>(definition: ExcelDefinition, buffer: Uint8Array): Promise<T[]> {
    initializeWasm();
    return fromExcel(definition, buffer);
}

function _toExcel<T>(definition: ExcelDefinition, data: T[]): Promise<Uint8Array> {
    initializeWasm();
    return toExcel(definition, data);
}

function _downloadExcelTemplate(defintion: ExcelDefinition): Promise<void> {
    initializeWasm();
    return downloadExcelTemplate(defintion);
}

export {
    getUtils,
    _importExcel as importExcel,
    _exportExcel as exportExcel,
    _fromExcel as fromExcel,
    _toExcel as toExcel,
    _downloadExcelTemplate as downloadExcelTemplate
};