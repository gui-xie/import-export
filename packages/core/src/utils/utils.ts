import {
  initSync,
  createTemplate,
  importData,
  exportData,
  ExcelInfo,
  ExcelData,
  ExcelRowData,
  ExcelColumnData,
  ExcelColumnInfo
} from '@senlinz/import-export-wasm';
import imexportWasm from '@senlinz/import-export-wasm/pkg/imexport_wasm_bg.wasm';
import { gunzipSync } from 'fflate';
import { ExcelDefinition } from '../declarations/ExcelDefintion';

let wasmInitialized = false;

function initializeWasm() {
  if (!wasmInitialized) {
    const wasm = gunzipSync(Uint8Array.from(atob(imexportWasm as any), c => c.charCodeAt(0)));
    initSync({ module: wasm });
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
  definition: ExcelDefinition,
  buffer: Uint8Array,
): Promise<T[]> {
  const info = getInfo(definition);
  const data = importData(info, buffer);
  const items = getItems(data);
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
  const excelData = await generateExcelTemplate(definition);
  download(excelData, definition.name);
}

function download(excelTemplate: Uint8Array, name: string) {
  document.querySelector('#senlinzImportExportA')?.remove();
  const linkInput = document.createElement('a');
  linkInput.id = 'senlinzImportExportA';
  linkInput.download = `${name}.xlsx`;
  const blob = new Blob([excelTemplate],
    {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
  linkInput.href = URL.createObjectURL(blob);
  linkInput.click();
}

function getInfo(definition: ExcelDefinition): ExcelInfo {
  var info = new ExcelInfo(
    definition.name,
    definition.sheetName,
    definition.columns.map(c => {
      const column = new ExcelColumnInfo(c.key, c.name);
      column.data_type = c.dataType;
      column.width = c.width;
      column.note = c.note;
      column.allowed_values = c.allowedValues;
      return column;
    })
  );
  info.author = definition.author;
  return info;
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
    document.body.removeChild(button);


    function fileHandler(event: Event) {
      const file = (event.target as HTMLInputElement).files[0];
      const reader = new FileReader();
      reader.onload = async () => {
        const buffer = new Uint8Array(reader.result as ArrayBuffer);
        const items = await fromExcel(defintion, buffer);
        resolve(items as T[]);
      };
      reader.readAsArrayBuffer(file);
    }
  });
}

async function exportExcel<T>(definition: ExcelDefinition, data: T[]) {
  const excelData = await toExcel(definition, data);
  download(excelData, definition.name);
}

export {
  importExcel,
  exportExcel,
  downloadExcelTemplate,
  fromExcel,
  toExcel,
  generateExcelTemplate,
  initializeWasm
};