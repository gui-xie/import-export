import initAsync, {
  createTemplate,
  importData,
  exportData,
  ExcelInfo,
  ExcelData,
  ExcelRowData,
  ExcelColumnData
} from '@senlinz/import-export-wasm';
import imexportWasm from '@senlinz/import-export-wasm/pkg/imexport_wasm_bg.wasm';
import { gunzipSync } from 'fflate';

let wasmInitialized = false;

async function initializeWasm() {
  if (!wasmInitialized) {
    const wasm = gunzipSync(Uint8Array.from(atob(imexportWasm as any), c => c.charCodeAt(0)));
    await initAsync(wasm);
    wasmInitialized = true;
  }
}

async function getItems(data: ExcelData) {
  const result = [] as any;
  for (const row of data.rows) {
    const item = {} as any;
    for (const column of row.columns) {
      item[column.key] = column.value;
    }
    result.push(item);
  }
  return result;
}

async function fromExcel<T>(
  info: ExcelInfo,
  buffer: Uint8Array,
): Promise<T[]> {
  const data = importData(info, buffer);
  const items = getItems(data);
  return items;
}

async function toExcel<T>(
  info: ExcelInfo,
  data: T[]
) {
  const rows = data.map(item => {
    const columns = info.columns.map(column => {
      const val = item[column.key];
      return new ExcelColumnData(
        column.key,
        (val === undefined || val === null) ? '' : val.toString()
      );
    });
    const row = new ExcelRowData(columns);
    return row;
  });
  const excelData = new ExcelData(rows);
  return exportData(info, excelData);
}

async function createExcel(info: ExcelInfo) {
  return createTemplate(info);
}

export { fromExcel, toExcel, createExcel, initializeWasm };