import {
  createTemplate,
  importData,
  importDynamicData,
  exportData,
  ExcelInfo,
  ExcelData,
  DynamicExcelData,
  ExcelRowData,
  ExcelColumnData,
  ExcelColumnInfo,
  ExcelCellFormat
} from '@senlinz/import-export-wasm';
import {
  ExcelColumnDefinition,
  ExcelDefinition,
  ExcelCellFormatDefinition,
  ExcelColumnDataType,
  DynamicExcelImportOptions,
  DynamicExcelImportResult,
  DynamicExcelImportRow
} from './ExcelDefinition';
import {
  ExportError,
  ImportError,
  ValidationError,
  getErrorMessage
} from './errors.js';
const SUPPORTED_DATA_TYPES = ['text', 'number', 'date', 'image'] as const;
const DOWNLOAD_URL_REVOKE_DELAY_MS = 200;
type NormalizedDataType = typeof SUPPORTED_DATA_TYPES[number];
type NormalizedExcelColumnDefinition = Omit<ExcelColumnDefinition, 'dataType'> & {
  dataType?: NormalizedDataType;
};
type NormalizedExcelDefinition = Omit<ExcelDefinition, 'columns'> & {
  columns: NormalizedExcelColumnDefinition[];
};
type ImportedCellValue = number | string | null;
type ImportedRow = Record<string, ImportedCellValue>;
type ExportRow = Record<string, unknown>;
type ColumnDefinitionMap = Record<string, NormalizedExcelColumnDefinition>;
type ColumnInfoMap = Record<string, ExcelColumnInfo>;
type GroupedCellValue = {
  value?: unknown;
  children: ExportRow[];
};

function normalizeDataType(dataType: ExcelColumnDataType | undefined, columnKey: string): NormalizedDataType {
  const rawDataType = dataType ?? 'text';
  if (typeof rawDataType !== 'string') {
    throw new ValidationError(`Invalid dataType '${String(rawDataType)}' for column '${columnKey}'. dataType values must be strings.`);
  }
  const normalized = rawDataType.trim().toLowerCase();
  const canonical = normalized;
  if (!SUPPORTED_DATA_TYPES.includes(canonical as NormalizedDataType)) {
    throw new ValidationError(
      `Invalid dataType '${dataType}' for column '${columnKey}'. Supported values are: ${SUPPORTED_DATA_TYPES.join(', ')}.`
    );
  }
  return canonical as NormalizedDataType;
}

function normalizeDefinition(definition: ExcelDefinition): NormalizedExcelDefinition {
  if (!definition.name?.trim()) {
    throw new ValidationError('Excel definition must include a non-empty name.');
  }
  if (!Array.isArray(definition.columns) || definition.columns.length === 0) {
    throw new ValidationError(`Excel definition '${definition.name}' must include at least one column.`);
  }

  const knownColumnKeys = new Set<string>();
  const knownGroups = new Set<string>();
  const columns = definition.columns.map((column) => {
    const key = column.key?.trim();
    const name = column.name?.trim();
    if (!key) {
      throw new ValidationError(`Excel definition '${definition.name}' contains a column with an empty key.`);
    }
    if (!name) {
      throw new ValidationError(`Column '${key}' in definition '${definition.name}' must include a non-empty name.`);
    }
    if (knownColumnKeys.has(key)) {
      throw new ValidationError(`Duplicate column key '${key}' found in definition '${definition.name}'.`);
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
        throw new ValidationError(`Column '${key}' has an empty parent reference.`);
      }
      if (parent === key) {
        throw new ValidationError(`Column '${key}' cannot reference itself as a parent.`);
      }
      if (!knownColumnKeys.has(parent)) {
        throw new ValidationError(`Column '${key}' references parent '${parent}', but parent columns must be declared before their children.`);
      }
      normalizedColumn.parent = parent;
    }

    if (normalizedColumn.dataGroup) {
      const dataGroup = normalizedColumn.dataGroup.trim();
      if (!dataGroup) {
        throw new ValidationError(`Column '${key}' has an empty dataGroup value.`);
      }
      if (knownGroups.has(dataGroup)) {
        throw new ValidationError(`Duplicate dataGroup '${dataGroup}' found in definition '${definition.name}'.`);
      }
      knownGroups.add(dataGroup);
      normalizedColumn.dataGroup = dataGroup;
    }

    if (normalizedColumn.dataGroupParent) {
      const dataGroupParent = normalizedColumn.dataGroupParent.trim();
      if (!dataGroupParent) {
        throw new ValidationError(`Column '${key}' has an empty dataGroupParent value.`);
      }
      if (normalizedColumn.dataGroup === dataGroupParent) {
        throw new ValidationError(`Column '${key}' cannot reference its own dataGroup '${dataGroupParent}' as dataGroupParent.`);
      }
      if (!knownGroups.has(dataGroupParent)) {
        throw new ValidationError(
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
    sheetName: definition.sheetName?.trim() || undefined,
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
      throw new ImportError(`Failed to parse imported number '${value}' for column '${column.key}'.`);
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
      throw new ExportError(`Column '${column.key}' expects a finite number value.`);
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
      return trimmed;
    }
    throw new ExportError(`Column '${column.key}' expects a date string or Date instance.`);
  }

  return value.toString();
}

function getItems(data: ExcelData, columns: NormalizedExcelColumnDefinition[]): ImportedRow[] {
  const result: ImportedRow[] = [];
  const columnMap: ColumnDefinitionMap = {};
  for (const column of columns) {
    columnMap[column.key] = column;
  }
  for (const row of data.rows) {
    const item: ImportedRow = {};
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

function getDynamicItems(data: DynamicExcelData): DynamicExcelImportRow[] {
  return data.rows.map((row) => {
    const item: Record<string, string> = {};
    for (const column of row.columns) {
      item[column.key] = column.value;
    }
    return item;
  });
}

function normalizeDynamicImportOptions<THeader extends string = string>(options: DynamicExcelImportOptions<THeader> = {}): DynamicExcelImportOptions<THeader> {
  if (options.headerRow !== undefined) {
    if (!Number.isInteger(options.headerRow) || options.headerRow < 1) {
      throw new ValidationError("Dynamic import option 'headerRow' must be an integer greater than or equal to 1.");
    }
  }
  if (options.expectedHeaders !== undefined) {
    if (!Array.isArray(options.expectedHeaders) || options.expectedHeaders.length === 0) {
      throw new ValidationError("Dynamic import option 'expectedHeaders' must be a non-empty string array when provided.");
    }
    const knownHeaders = new Set<string>();
    for (const header of options.expectedHeaders) {
      if (typeof header !== 'string' || !header.trim()) {
        throw new ValidationError("Dynamic import option 'expectedHeaders' must only contain non-empty strings.");
      }
      if (knownHeaders.has(header)) {
        throw new ValidationError(`Dynamic import option 'expectedHeaders' contains a duplicate header '${header}'.`);
      }
      knownHeaders.add(header);
    }
  }

  return {
    sheetName: options.sheetName?.trim() || undefined,
    headerRow: options.headerRow,
    expectedHeaders: options.expectedHeaders,
  };
}

function getValidatedDynamicHeaders<THeader extends string>(actualHeaders: string[], expectedHeaders: readonly THeader[]): THeader[] {
  const mismatchMessage = `Dynamic import headers did not match the expected schema. Expected [${expectedHeaders.join(', ')}], received [${actualHeaders.join(', ')}].`;

  if (actualHeaders.length !== expectedHeaders.length) {
    throw new ImportError(mismatchMessage);
  }

  for (let index = 0; index < expectedHeaders.length; index += 1) {
    if (actualHeaders[index] !== expectedHeaders[index]) {
      throw new ImportError(mismatchMessage);
    }
  }

  return [...expectedHeaders];
}

/**
 * Builds a typed row object after `getValidatedDynamicHeaders(...)` has confirmed that the
 * worksheet headers match the caller-provided `expectedHeaders` exactly and in order.
 */
function getTypedDynamicItems<THeader extends string>(
  data: DynamicExcelData,
  expectedHeaders: readonly THeader[],
): DynamicExcelImportRow<THeader>[] {
  return data.rows.map((row) => {
    const item = Object.fromEntries(expectedHeaders.map((header) => [header, ''])) as DynamicExcelImportRow<THeader>;
    for (const column of row.columns) {
      if (column.key in item) {
        item[column.key as THeader] = column.value;
      }
    }
    return item;
  });
}

async function _fromExcel<T>(
  definition: ExcelDefinition,
  buffer: Uint8Array,
): Promise<T[]> {
  const normalizedDefinition = normalizeDefinition(definition);
  const info = getInfo(normalizedDefinition);
  try {
    const data = importData(info, buffer);
    const items = getItems(data, normalizedDefinition.columns);
    return items as T[];
  } catch (error) {
    if (error instanceof ValidationError || error instanceof ImportError) {
      throw error;
    }
    throw new ImportError(`Failed to import workbook '${normalizedDefinition.name}'. ${getErrorMessage(error)}`, { cause: error });
  }
}

async function _fromExcelDynamic(
  buffer: Uint8Array,
  options?: DynamicExcelImportOptions,
): Promise<DynamicExcelImportResult>;
async function _fromExcelDynamic<THeader extends string>(
  buffer: Uint8Array,
  options: DynamicExcelImportOptions<THeader> & { expectedHeaders: readonly THeader[] },
): Promise<DynamicExcelImportResult<THeader>>;
async function _fromExcelDynamic<THeader extends string = string>(
  buffer: Uint8Array,
  options?: DynamicExcelImportOptions<THeader>,
): Promise<DynamicExcelImportResult | DynamicExcelImportResult<THeader>> {
  const normalizedOptions = normalizeDynamicImportOptions(options);
  try {
    const data = importDynamicData(normalizedOptions.sheetName, normalizedOptions.headerRow, buffer);
    if (normalizedOptions.expectedHeaders) {
      const headers = getValidatedDynamicHeaders(data.headers, normalizedOptions.expectedHeaders);
      return {
        sheetName: data.sheet_name,
        headers,
        rows: getTypedDynamicItems(data, headers),
      };
    }
    return {
      sheetName: data.sheet_name,
      headers: [...data.headers],
      rows: getDynamicItems(data),
    };
  } catch (error) {
    if (error instanceof ValidationError || error instanceof ImportError) {
      throw error;
    }
    throw new ImportError(`Failed to dynamically import workbook. ${getErrorMessage(error)}`, { cause: error });
  }
}

function readFileFromUpload<T>(load: (buffer: Uint8Array) => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
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
      if (error instanceof Error) {
        reject(error);
        return;
      }
      reject(new ImportError(String(error), { cause: error }));
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
        rejectWithError(new ImportError(reader.error?.message ?? 'Failed to read import file.', { cause: reader.error }));
      };
      reader.onabort = () => {
        rejectWithError(new ImportError('Import file read was aborted.'));
      };
      reader.onload = async () => {
        try {
          const buffer = new Uint8Array(reader.result as ArrayBuffer);
          const result = await load(buffer);
          cleanup();
          resolve(result);
        } catch (error) {
          rejectWithError(error);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  });
}

function isGroupedCellValue(value: unknown): value is GroupedCellValue {
  return typeof value === 'object' && value !== null && Array.isArray((value as GroupedCellValue).children);
}

function mapExcelData(items: ExportRow[], columnMap: ColumnInfoMap, parentKey: string = ''): ExcelRowData[] {
  const rows: ExcelRowData[] = [];
  for (const item of items) {
    const columnData: ExcelColumnData[] = [];
    for (const columnKey in item) {
      const column = columnMap[columnKey];
      const v = item[columnKey];
      if (!column || v === undefined) continue;
      if (!column.data_group) {
        columnData.push(new ExcelColumnData(columnKey, serializeCellValue(column, v)));
        continue;
      }
      if (v === null) {
        continue;
      }
      if (!isGroupedCellValue(v)) {
        throw new ExportError(`Grouped column '${columnKey}' must be an object with a children array.`);
      }
      if (v.children.length) {
        const children = mapExcelData(v.children, columnMap, columnKey);
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
  const columnMap: ColumnInfoMap = {};
  for (const column of info.columns) {
    columnMap[column.key] = column;
  }
  try {
    const rows = mapExcelData(data as ExportRow[], columnMap);
    const excelData = new ExcelData(rows);
    return exportData(info, excelData);
  } catch (error) {
    if (error instanceof ValidationError || error instanceof ExportError) {
      throw error;
    }
    throw new ExportError(`Failed to export workbook '${normalizedDefinition.name}'. ${getErrorMessage(error)}`, { cause: error });
  }
}

async function generateExcelTemplate(definition: ExcelDefinition) {
  const normalizedDefinition = normalizeDefinition(definition);
  try {
    return createTemplate(getInfo(normalizedDefinition));
  } catch (error) {
    if (error instanceof ValidationError || error instanceof ExportError) {
      throw error;
    }
    throw new ExportError(`Failed to generate template '${normalizedDefinition.name}'. ${getErrorMessage(error)}`, { cause: error });
  }
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
  const objectUrl = URL.createObjectURL(blob);
  linkInput.href = objectUrl;
  linkInput.click();
  setTimeout(() => URL.revokeObjectURL(objectUrl), DOWNLOAD_URL_REVOKE_DELAY_MS);
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
  const columns = definition.columns.map(c => {
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
      const formats = Array.isArray(c.valueFormat) ? c.valueFormat : [c.valueFormat];
      column = column.withValueFormat(formats.map(mapFormat));
    }
    if (c.dataGroup) column = column.withDataGroup(c.dataGroup);
    if (c.dataGroupParent) column = column.withDataGroupParent(c.dataGroupParent);
    return column;
  });

  let info = new ExcelInfo(
    definition.name,
    definition.sheetName ?? 'sheet1',
    columns,
    definition.author ?? '',
    toDatetimeString(definition.createTime ?? new Date())
  );
  const dx = definition.dx ?? 0;
  const dy = definition.dy ?? 0;
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

function importExcel<T>(definition: ExcelDefinition): Promise<T[]> {
  return readFileFromUpload((buffer) => _fromExcel<T>(definition, buffer));
}

function importExcelDynamic(options?: DynamicExcelImportOptions): Promise<DynamicExcelImportResult>;
function importExcelDynamic<THeader extends string>(options: DynamicExcelImportOptions<THeader> & { expectedHeaders: readonly THeader[] }): Promise<DynamicExcelImportResult<THeader>>;
function importExcelDynamic<THeader extends string = string>(options?: DynamicExcelImportOptions<THeader>): Promise<DynamicExcelImportResult | DynamicExcelImportResult<THeader>> {
  return readFileFromUpload((buffer) => _fromExcelDynamic(buffer, options));
}

async function exportExcel<T>(definition: ExcelDefinition, data: T[]) {
  const excelData = await _toExcel(definition, data);
  download(excelData, `${definition.name}.xlsx`);
}

export {
  importExcel,
  importExcelDynamic,
  exportExcel,
  downloadExcelTemplate,
  _fromExcel as fromExcel,
  _fromExcelDynamic as fromExcelDynamic,
  _toExcel as toExcel,
  generateExcelTemplate,
  download
};
