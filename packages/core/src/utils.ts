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
import {
  ExcelColumnDefinition,
  ExcelDefinition,
  ExcelCellFormatDefinition,
  ExcelColumnDataType
} from './ExcelDefinition';

let wasmInitialized = false;
const SUPPORTED_DATA_TYPES = ['text', 'number', 'date', 'image'] as const;
type NormalizedDataType = typeof SUPPORTED_DATA_TYPES[number];
type NormalizedExcelColumnDefinition = Omit<ExcelColumnDefinition, 'dataType'> & {
  dataType?: NormalizedDataType;
};
type NormalizedExcelDefinition = Omit<ExcelDefinition, 'columns'> & {
  columns: NormalizedExcelColumnDefinition[];
};

function initializeWasm() {
  if (!wasmInitialized) {
    const wasm = gunzipSync(Uint8Array.from(atob(imexportWasm as any), c => c.charCodeAt(0)));
    initSync({ module: wasm });
    wasmInitialized = true;
  }
}

function normalizeDataType(dataType: ExcelColumnDataType | undefined, columnKey: string): NormalizedDataType {
  const rawDataType = dataType ?? 'text';
  if (typeof rawDataType !== 'string') {
    throw new Error(`Invalid dataType '${String(rawDataType)}' for column '${columnKey}'. dataType values must be strings.`);
  }
  const normalized = rawDataType.trim().toLowerCase();
  const canonical = normalized === 'string' ? 'text' : normalized;
  if (!SUPPORTED_DATA_TYPES.includes(canonical as NormalizedDataType)) {
    throw new Error(
      `Invalid dataType '${dataType}' for column '${columnKey}'. Supported values are: ${SUPPORTED_DATA_TYPES.join(', ')}.`
    );
  }
  return canonical as NormalizedDataType;
}

function normalizeDefinition(definition: ExcelDefinition): NormalizedExcelDefinition {
  if (!definition.name?.trim()) {
    throw new Error('Excel definition must include a non-empty name.');
  }
  if (!Array.isArray(definition.columns) || definition.columns.length === 0) {
    throw new Error(`Excel definition '${definition.name}' must include at least one column.`);
  }

  const knownColumnKeys = new Set<string>();
  const knownGroups = new Set<string>();
  const columns = definition.columns.map((column) => {
    const key = column.key?.trim();
    const name = column.name?.trim();
    if (!key) {
      throw new Error(`Excel definition '${definition.name}' contains a column with an empty key.`);
    }
    if (!name) {
      throw new Error(`Column '${key}' in definition '${definition.name}' must include a non-empty name.`);
    }
    if (knownColumnKeys.has(key)) {
      throw new Error(`Duplicate column key '${key}' found in definition '${definition.name}'.`);
    }

    const normalizedColumn: NormalizedExcelColumnDefinition = {
      ...column,
      key,
      name,
      dataType: normalizeDataType(column.dataType, key),
    };

    if (normalizedColumn.parent) {
      const parent = normalizedColumn.parent.trim();
      if (!parent) {
        throw new Error(`Column '${key}' has an empty parent reference.`);
      }
      if (parent === key) {
        throw new Error(`Column '${key}' cannot reference itself as a parent.`);
      }
      if (!knownColumnKeys.has(parent)) {
        throw new Error(`Column '${key}' references parent '${parent}', but parent columns must be declared before their children.`);
      }
      normalizedColumn.parent = parent;
    }

    if (normalizedColumn.dataGroup) {
      const dataGroup = normalizedColumn.dataGroup.trim();
      if (!dataGroup) {
        throw new Error(`Column '${key}' has an empty dataGroup value.`);
      }
      if (knownGroups.has(dataGroup)) {
        throw new Error(`Duplicate dataGroup '${dataGroup}' found in definition '${definition.name}'.`);
      }
      knownGroups.add(dataGroup);
      normalizedColumn.dataGroup = dataGroup;
    }

    if (normalizedColumn.dataGroupParent) {
      const dataGroupParent = normalizedColumn.dataGroupParent.trim();
      if (!dataGroupParent) {
        throw new Error(`Column '${key}' has an empty dataGroupParent value.`);
      }
      if (normalizedColumn.dataGroup === dataGroupParent) {
        throw new Error(`Column '${key}' cannot reference its own dataGroup '${dataGroupParent}' as dataGroupParent.`);
      }
      if (!knownGroups.has(dataGroupParent)) {
        throw new Error(
          `Column '${key}' references dataGroupParent '${dataGroupParent}', but grouped parents must be declared before dependent columns.`
        );
      }
      normalizedColumn.dataGroupParent = dataGroupParent;
    }

    knownColumnKeys.add(key);
    return normalizedColumn;
  });

  return {
    ...definition,
    name: definition.name.trim(),
    sheetName: definition.sheetName?.trim() || definition.sheetName,
    columns,
  };
}

function parseImportedValue(column: NormalizedExcelColumnDefinition, value: string): number | string | null {
  if (value === '') {
    return column.dataType === 'number' || column.dataType === 'date' ? null : value;
  }
  if (column.dataType === 'number') {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      throw new Error(`Failed to parse imported number '${value}' for column '${column.key}'.`);
    }
    return parsed;
  }
  return value;
}

function serializeCellValue(column: ExcelColumnInfo, value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  const dataType = column.data_type.toLowerCase();

  if (dataType === 'number') {
    const numericValue = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(numericValue)) {
      throw new Error(`Column '${column.key}' expects a finite number value.`);
    }
    return numericValue.toString();
  }

  if (dataType === 'date') {
    if (value instanceof Date) {
      return toDatetimeString(value);
    }
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) {
        return '';
      }
      if (Number.isNaN(Date.parse(trimmed))) {
        throw new Error(`Column '${column.key}' expects a valid date string or Date instance.`);
      }
      return trimmed;
    }
    throw new Error(`Column '${column.key}' expects a date string or Date instance.`);
  }

  return value.toString();
}

async function getItems(data: ExcelData, columns: NormalizedExcelColumnDefinition[]) {
  const result = [] as any;
  const columnMap = {} as Record<string, NormalizedExcelColumnDefinition>;
  for (const column of columns) {
    columnMap[column.key] = column;
  }
  for (const row of data.rows) {
    const item = {} as any;
    for (const column of row.columns) {
      const definition = columnMap[column.key];
      if (!definition) {
        continue;
      }
      item[column.key] = parseImportedValue(definition, column.value);
    }
    result.push(item);
  }
  return result;
}

async function _fromExcel<T>(
  definition: ExcelDefinition,
  buffer: Uint8Array,
): Promise<T[]> {
  const normalizedDefinition = normalizeDefinition(definition);
  const info = getInfo(normalizedDefinition);
  const data = importData(info, buffer);
  const items = getItems(data, normalizedDefinition.columns);
  return items;
}

function mapExcelData(items: any[], columnMap: any, parentKey: string = ''): ExcelRowData[] {
  const rows = [];
  for (const item of items) {
    let columnData = [];
    for (const columnKey in item) {
      let column: ExcelColumnInfo = columnMap[columnKey];
      let v = item[columnKey];
      if (!column || v === undefined) continue;
      if (!column.data_group) {
        columnData.push(new ExcelColumnData(columnKey, serializeCellValue(column, v)));
        continue;
      }
      if (v === null) {
        continue;
      }
      if (typeof v !== 'object' || !Array.isArray(v.children)) {
        throw new Error(`Grouped column '${columnKey}' must be an object with a children array.`);
      }
      if (v.children.length) {
        let children = mapExcelData(v.children, columnMap, columnKey);
        if (!parentKey) {
          columnData.push(ExcelColumnData.newRootGroup(columnKey, children));
        } else {
          columnData.push(ExcelColumnData.newGroup(columnKey, serializeCellValue(column, v.value), children));
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
  const normalizedDefinition = normalizeDefinition(definition);
  const info = getInfo(normalizedDefinition);
  let columnMap = {} as any;
  for (const column of info.columns) {
    columnMap[column.key] = column;
  }
  const rows = mapExcelData(data, columnMap);
  const excelData = new ExcelData(rows);
  return exportData(info, excelData);
}

async function generateExcelTemplate(definition: ExcelDefinition) {
  return createTemplate(getInfo(normalizeDefinition(definition)));
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

function getInfo(definition: NormalizedExcelDefinition): ExcelInfo {
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
  if (definition.headerRowHeight) info = info.withHeaderRowHeight(definition.headerRowHeight);
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
  return new Promise<T[]>((resolve, reject) => {
    document.querySelector('#senlinzImportExportInput')?.remove();
    const fileInput = document.createElement('input');
    fileInput.id = 'senlinzImportExportInput';
    fileInput.style.display = 'none';
    fileInput.type = 'file';
    fileInput.accept = '.xlsx,.xls,.xlsm,.xlsb,.xla,.xlam,.ods';
    document.body.appendChild(fileInput);

    const cleanup = () => {
      fileInput.removeEventListener('change', fileHandler);
      fileInput.remove();
    };

    const rejectWithError = (error: unknown) => {
      cleanup();
      reject(error instanceof Error ? error : new Error(String(error)));
    };

    fileInput.addEventListener('change', fileHandler);
    fileInput.click();

    function fileHandler(event: Event) {
      const target = event.target as HTMLInputElement;
      if (!target || !target.files || target.files.length === 0) {
        return;
      }
      const file = target.files[0];
      const reader = new FileReader();
      reader.onerror = () => {
        rejectWithError(reader.error ?? new Error('Failed to read import file.'));
      };
      reader.onabort = () => {
        rejectWithError(new Error('Import file read was aborted.'));
      };
      reader.onload = async () => {
        try {
          const buffer = new Uint8Array(reader.result as ArrayBuffer);
          const items = await _fromExcel(defintion, buffer);
          cleanup();
          resolve(items as T[]);
        } catch (error) {
          rejectWithError(error);
        }
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
