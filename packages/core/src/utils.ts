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
  ExcelCellFormat
} from '@senlinz/import-export-wasm';
import imexportWasm from '@senlinz/import-export-wasm/pkg/imexport_wasm_bg.wasm';
import { gunzipSync } from 'fflate';
import { ExcelColumnDefinition, ExcelDefinition, ExcelCellFormatDefinition } from './declarations/ExcelDefinition';

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
      if (columnType == "number") {
        item[column.key] = parseFloat(column.value);
        continue;
      }
      item[column.key] = column.value;
    }
    result.push(item);
  }
  return result;
}

async function _fromExcel<T>(
  definition: ExcelDefinition,
  buffer: Uint8Array,
): Promise<T[]> {
  const info = getInfo(definition);
  const data = importData(info, buffer);
  const items = getItems(data, definition.columns);
  return items;
}

function mapExcelData(items: any[], columnMap: any, parentKey: string = '') {
  const rows = [];
  for (const item of items) {
    let columnData = [];
    for (const columnKey in item) {
      let column: ExcelColumnInfo = columnMap[columnKey];
      let v = item[columnKey];
      if (!column || v === undefined) continue;
      if (!column.data_group) {
        columnData.push(new ExcelColumnData(columnKey, v.toString()));
        continue;
      }
      if (v.children && v.children.length) {
        let children = mapExcelData(v.children, columnMap, columnKey);
        if (!parentKey) {
          columnData.push(ExcelColumnData.newRootGroup(columnKey, children));
        } else {
          columnData.push(ExcelColumnData.newGroup(columnKey, v.value.toString(), children));
        }
      }
    }
    rows.push(new ExcelRowData(columnData));
  }
  return rows;
}

async function _toExcel<T>(
  definition: ExcelDefinition,
  data: T[]
) {
  const info = getInfo(definition);
  let columnMap = {} as any;
  for (const column of info.columns) {
    columnMap[column.key] = column;
  }
  const rows = mapExcelData(data, columnMap);
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

function mapFormat(vf: ExcelCellFormatDefinition) {
  let result = new ExcelCellFormat();
  if (vf.rule) result = result.withRule(vf.rule);
  if (vf.value) result = result.withValue(vf.value);
  if (vf.color) result = result.withColor(vf.color);
  if (vf.bold) result = result.withBold(vf.bold);
  if (vf.italic) result = result.withItalic(vf.italic);
  if (vf.underline) result = result.withUnderline(vf.underline);
  if (vf.strikethrough) result = result.withStrikethrough(vf.strikethrough);
  if (vf.fontSize) result = result.withFontSize(vf.fontSize);
  if (vf.backgroundColor) result = result.withBackgroundColor(vf.backgroundColor);
  if (vf.align) result = result.withAlign(vf.align);
  if (vf.alignVertical) result = result.withAlignVertical(vf.alignVertical);
  if (vf.borderColor) result = result.withBorderColor(vf.borderColor);
  if (vf.dateFormat) result = result.withDateFormat(vf.dateFormat);
  return result;
}

function getInfo(definition: ExcelDefinition): ExcelInfo {
  var columns = definition.columns.map(c => {
    let column = new ExcelColumnInfo(c.key, c.name);
    if (c.width) column = column.withWidth(c.width);
    if (c.dataType) column = column.withDataType(c.dataType);
    if (c.note) column = column.withNote(c.note);
    if (c.allowedValues) column = column.withAllowedValues(c.allowedValues);
    if (c.parent) column = column.withParent(c.parent);
    if (c.format) {
      column = column.withFormat(mapFormat(c.format));
    }
    if (c.valueFormat) {
      let formats = Array.isArray(c.valueFormat) ? c.valueFormat : [c.valueFormat];
      column = column.withValueFormat(formats.map(mapFormat));
    }
    if (c.dataGroup) column = column.withDataGroup(c.dataGroup);
    if (c.dataGroupParent) column = column.withDataGroupParent(c.dataGroupParent);
    return column;
  });

  var info = new ExcelInfo(
    definition.name,
    definition.sheetName ?? 'sheet1',
    columns,
    definition.author ?? '',
    toDatetimeString(definition.createTime ?? new Date())
  );
  let dx = definition.dx ?? 0;
  let dy = definition.dy ?? 0;
  info = info.withOffset(dx, dy);
  if (definition.title) info = info.withTitle(definition.title);
  if (definition.titleHeight) info = info.withTitleHeight(definition.titleHeight);
  if (definition.titleFormat) info = info.withTitleFormat(mapFormat(definition.titleFormat));
  if (definition.defaultRowHeight) info = info.withDefaultRowHeight(definition.defaultRowHeight);
  if (definition.isHeaderFreeze) info = info.withIsHeaderFreeze(definition.isHeaderFreeze);
  if (definition.progressCallback) info = info.withProgressCallback(definition.progressCallback);
  if (definition.imageFetcher) info = info.withImageFetcher(definition.imageFetcher);
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
        const items = await _fromExcel(defintion, buffer);
        fileInput.removeEventListener('change', fileHandler);
        fileInput.remove();
        resolve(items as T[]);
      };
      reader.readAsArrayBuffer(file);
    }
  });
}

async function exportExcel<T>(definition: ExcelDefinition, data: T[]) {
  const excelData = await _toExcel(definition, data);
  download(excelData, `${definition.name}.xlsx`);
}

export {
  importExcel,
  exportExcel,
  downloadExcelTemplate,
  _fromExcel as fromExcel,
  _toExcel as toExcel,
  generateExcelTemplate,
  initializeWasm,
  download
};