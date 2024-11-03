export type * from './components.d.ts';
import { importExcel, exportExcel, downloadExcelTemplate, fromExcel, toExcel, generateExcelTemplate, initializeWasm } from './utils.js';

function getUtils() {
    initializeWasm();
    return {
        importExcel,
        exportExcel,
        downloadExcelTemplate,
        fromExcel,
        toExcel,
        generateExcelTemplate
    }
}

export { getUtils };