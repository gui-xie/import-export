import {
  initSync,
  createTemplate,
  importData,
  exportData,
  ExcelInfo,
  ExcelData,
  ExcelRowData,
  ExcelColumnData,
  ExcelColumnInfo,
  ExcelDataType
} from '@senlinz/import-export-wasm';
import imexportWasm from '@senlinz/import-export-wasm/pkg/imexport_wasm_bg.wasm';
import { gunzipSync } from 'fflate';
import { ExcelColumnDefinition, ExcelDefinition } from './declarations/ExcelDefinition';

let wasmInitialized = false;

function initializeWasm() {
  if (!wasmInitialized) {
    const wasm = gunzipSync(Uint8Array.from(atob(imexportWasm as any), c => c.charCodeAt(0)));
    initSync({ module: wasm });
    wasmInitialized = true;
  }
}

async function getItems(data: ExcelData, columns: ExcelColumnDefinition[]) {
  const result = [] as any;
  const columnTypes = {} as any;
  for (const column of columns) {
    columnTypes[column.key] = column.dataType;
  }
  for (const row of data.rows) {
    const item = {} as any;
    for (const column of row.columns) {
      const columnType = columnTypes[column.key];
      if (columnType == ExcelDataType.Number) {
        item[column.key] = parseFloat(column.value);
        continue;
      }
      item[column.key] = column.value;
    }
    result.push(item);
  }
  return result;
}

async function fromExcel<T>(
  definition: ExcelDefinition,
  buffer: Uint8Array,
): Promise<T[]> {
  const info = getInfo(definition);
  const data = importData(info, buffer);
  const items = getItems(data, definition.columns);
  return items;
}

async function toExcel<T>(
  definition: ExcelDefinition,
  data: T[]
) {
  const info = getInfo(definition);
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

async function generateExcelTemplate(definition: ExcelDefinition) {
  return createTemplate(getInfo(definition));
}

async function downloadExcelTemplate(definition: ExcelDefinition) {
  const excelName = `${definition.name}.xlsx`;
  const excelData = await generateExcelTemplate(definition);
  download(excelData, excelName);
}

function download(
  data: Uint8Array | string,
  name: string,
  type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
  const id = 'senlinzImportExportDownload';
  document.querySelector(`#${id}`)?.remove();
  const linkInput = document.createElement('a');
  linkInput.id = id;
  linkInput.download = name;
  const blob = new Blob([data], { type });
  linkInput.href = URL.createObjectURL(blob);
  linkInput.click();
}

function getInfo(definition: ExcelDefinition): ExcelInfo {
  var columns = definition.columns.map(c => {
    let column = new ExcelColumnInfo(c.key, c.name);
    if (c.width) column = column.withWidth(c.width);
    if (c.dataType) column = column.withDataType(c.dataType);
    if (c.note) column = column.withNote(c.note);
    if (c.allowedValues) column = column.withAllowedValues(c.allowedValues);
    return column;
  });

  var info = new ExcelInfo(
    definition.name,
    definition.sheetName ?? 'sheet1',
    columns,
    definition.author ?? '',
    toDatetimeString(definition.createTime ?? new Date())
  );
  return info;
}

function toDatetimeString(date: Date | string) {
  if (typeof date === 'string') {
    return date;
  }
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const pad = (num: number) => num < 10 ? `0${num}` : num.toString();
  return `${year}-${pad(month)}-${pad(day)} ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function importExcel<T>(defintion: ExcelDefinition): Promise<T[]> {
  return new Promise<T[]>((resolve, _) => {
    let fileInput = document.querySelector('#senlinzImportExportInput') as HTMLInputElement;
    if (!fileInput) {
      document.querySelector('#senlinzImportExportInput')?.remove();
      fileInput = document.createElement('input');
      fileInput.id = 'senlinzImportExportInput';
      fileInput.style.display = 'none';
      fileInput.type = 'file';
      fileInput.accept = '.xlsx,.xls,.xlsm,.xlsb,.xla,.xlam,.ods';
      fileInput.addEventListener('change', fileHandler);
      document.body.appendChild(fileInput);
    }

    const button = document.createElement('button');
    button.textContent = 'Import Excel';
    button.style.display = 'none';
    button.addEventListener('click', () => {
      fileInput.click();
    });

    document.body.appendChild(button);
    button.click();
    button.removeEventListener('click', () => {
      fileInput.click();
    });
    document.body.removeChild(button);

    function fileHandler(event: Event) {
      const file = (event.target as HTMLInputElement).files[0];
      const reader = new FileReader();
      reader.onload = async () => {
        const buffer = new Uint8Array(reader.result as ArrayBuffer);
        const items = await fromExcel(defintion, buffer);
        fileInput.removeEventListener('change', fileHandler);
        fileInput.remove();
        resolve(items as T[]);
      };
      reader.readAsArrayBuffer(file);
    }
  });
}

async function exportExcel<T>(definition: ExcelDefinition, data: T[]) {
  const excelData = await toExcel(definition, data);
  download(excelData, `${definition.name}.xlsx`);
}

export {
  importExcel,
  exportExcel,
  downloadExcelTemplate,
  fromExcel,
  toExcel,
  generateExcelTemplate,
  initializeWasm,
  download
};