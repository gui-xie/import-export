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
  DynamicExcelImportResult
} from './ExcelDefinition';
const SUPPORTED_DATA_TYPES = ['text', 'number', 'date', 'image'] as const;
const DEFAULT_MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;
const FORMULA_PREFIX_CHARS = new Set(['=', '+', '-', '@', '\t', '\r', '\n']);
const DOWNLOAD_LINK_ID = 'senlinzImportExportDownload';
let pendingDownloadObjectUrl: string | null = null;
let downloadCleanupListenersRegistered = false;
type NormalizedDataType = typeof SUPPORTED_DATA_TYPES[number];
type NormalizedExcelColumnDefinition = Omit<ExcelColumnDefinition, 'dataType'> & {
  dataType?: NormalizedDataType;
};
type NormalizedExcelDefinition = Omit<ExcelDefinition, 'columns'> & {
  columns: NormalizedExcelColumnDefinition[];
  maxFileSizeBytes: number;
  escapeFormulas: boolean;
};
type NormalizedDynamicImportOptions = DynamicExcelImportOptions & {
  maxFileSizeBytes: number;
};
type ImportedCellValue = number | string | null;
type ImportedRow = Record<string, ImportedCellValue>;
type DynamicImportedRow = Record<string, string>;
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
    throw new Error(`Invalid dataType '${String(rawDataType)}' for column '${columnKey}'. dataType values must be strings.`);
  }
  const normalized = rawDataType.trim().toLowerCase();
  const canonical = normalized;
  if (!SUPPORTED_DATA_TYPES.includes(canonical as NormalizedDataType)) {
    throw new Error(
      `Invalid dataType '${dataType}' for column '${columnKey}'. Supported values are: ${SUPPORTED_DATA_TYPES.join(', ')}.`
    );
  }
  return canonical as NormalizedDataType;
}

function normalizeMaxFileSizeBytes(value: number | undefined, context: string): number {
  if (value === undefined) {
    return DEFAULT_MAX_FILE_SIZE_BYTES;
  }
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`Invalid maxFileSizeBytes '${String(value)}' for ${context}. Expected a positive finite number in bytes.`);
  }
  const normalized = Math.trunc(value);
  if (normalized <= 0) {
    throw new Error(`Invalid maxFileSizeBytes '${value}' for ${context}. Expected a positive finite number in bytes.`);
  }
  return normalized;
}

function normalizeEscapeFormulas(value: boolean | undefined, context: string): boolean {
  if (value === undefined) {
    return true;
  }
  if (typeof value !== 'boolean') {
    throw new Error(`Invalid escapeFormulas '${String(value)}' for ${context}. Expected a boolean.`);
  }
  return value;
}

function sanitizeTextCellValue(value: string, escapeFormulas: boolean): string {
  if (!escapeFormulas || value === '') {
    return value;
  }
  const first = value[0];
  if (FORMULA_PREFIX_CHARS.has(first)) {
    return `'${value}`;
  }
  return value;
}

function formatByteSize(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  const rounded = mb % 1 === 0 ? mb.toFixed(0) : mb.toFixed(1);
  return `${rounded} MB`;
}

function enforceFileSizeLimit(file: File, maxFileSizeBytes: number) {
  if (file.size > maxFileSizeBytes) {
    throw new Error(
      `Selected file '${file.name}' exceeds the ${formatByteSize(maxFileSizeBytes)} limit (received ${formatByteSize(file.size)}).`
    );
  }
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
  const normalizedName = definition.name.trim();
  const maxFileSizeBytes = normalizeMaxFileSizeBytes(definition.maxFileSizeBytes, `definition '${normalizedName}'`);
  const escapeFormulas = normalizeEscapeFormulas(definition.escapeFormulas, `definition '${normalizedName}'`);
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
    name: normalizedName,
    sheetName: definition.sheetName?.trim() || undefined,
    columns,
    maxFileSizeBytes,
    escapeFormulas,
  };
}

type TestingUtils = {
  normalizeDefinition(definition: ExcelDefinition): NormalizedExcelDefinition;
  normalizeDynamicImportOptions(options?: DynamicExcelImportOptions): NormalizedDynamicImportOptions;
  sanitizeTextCellValue(value: string, escapeFormulas?: boolean): string;
  defaultMaxFileSizeBytes: number;
};

const testUtils: TestingUtils = {
  normalizeDefinition,
  normalizeDynamicImportOptions,
  sanitizeTextCellValue: (value: string, escapeFormulas = true) => sanitizeTextCellValue(value, escapeFormulas),
  defaultMaxFileSizeBytes: DEFAULT_MAX_FILE_SIZE_BYTES,
};

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

function serializeCellValue(column: ExcelColumnInfo, value: unknown, escapeFormulas: boolean): string {
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
      return trimmed;
    }
    throw new Error(`Column '${column.key}' expects a date string or Date instance.`);
  }

  if (dataType === 'text') {
    return sanitizeTextCellValue(value.toString(), escapeFormulas);
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

function getDynamicItems(data: DynamicExcelData): DynamicImportedRow[] {
  return data.rows.map((row) => {
    const item: DynamicImportedRow = {};
    for (const column of row.columns) {
      item[column.key] = column.value;
    }
    return item;
  });
}

function normalizeDynamicImportOptions(options: DynamicExcelImportOptions = {}): NormalizedDynamicImportOptions {
  if (options.headerRow !== undefined) {
    if (!Number.isInteger(options.headerRow) || options.headerRow < 1) {
      throw new Error("Dynamic import option 'headerRow' must be an integer greater than or equal to 1.");
    }
  }

  return {
    sheetName: options.sheetName?.trim() || undefined,
    headerRow: options.headerRow,
    maxFileSizeBytes: normalizeMaxFileSizeBytes(options.maxFileSizeBytes, 'dynamic import options'),
  };
}

async function fromExcelWithNormalizedDefinition<T>(
  normalizedDefinition: NormalizedExcelDefinition,
  buffer: Uint8Array,
): Promise<T[]> {
  const info = getInfo(normalizedDefinition);
  const data = importData(info, buffer);
  const items = getItems(data, normalizedDefinition.columns);
  return items as T[];
}

async function _fromExcel<T>(
  definition: ExcelDefinition,
  buffer: Uint8Array,
): Promise<T[]> {
  const normalizedDefinition = normalizeDefinition(definition);
  return fromExcelWithNormalizedDefinition<T>(normalizedDefinition, buffer);
}

async function fromExcelDynamicWithOptions(
  buffer: Uint8Array,
  options: NormalizedDynamicImportOptions,
): Promise<DynamicExcelImportResult> {
  const data = importDynamicData(options.sheetName, options.headerRow, buffer);
  return {
    sheetName: data.sheet_name,
    headers: [...data.headers],
    rows: getDynamicItems(data),
  };
}

async function _fromExcelDynamic(
  buffer: Uint8Array,
  options?: DynamicExcelImportOptions,
): Promise<DynamicExcelImportResult> {
  const normalizedOptions = normalizeDynamicImportOptions(options);
  return fromExcelDynamicWithOptions(buffer, normalizedOptions);
}

function readFileFromUpload<T>(
  load: (buffer: Uint8Array) => Promise<T>,
  maxFileSizeBytes: number = DEFAULT_MAX_FILE_SIZE_BYTES
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    document.querySelector('#senlinzImportExportInput')?.remove();
    const fileInput = document.createElement('input');
    fileInput.id = 'senlinzImportExportInput';
    fileInput.style.display = 'none';
    fileInput.type = 'file';
    fileInput.accept = '.xlsx,.xls,.xlsm,.xlsb,.xla,.xlam,.ods';
    document.body.appendChild(fileInput);
    let settled = false;

    const cleanup = () => {
      fileInput.removeEventListener('change', fileHandler);
      fileInput.removeEventListener('cancel', cancelHandler);
      fileInput.remove();
    };

    const rejectWithError = (error: unknown) => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      reject(error instanceof Error ? error : new Error(String(error)));
    };

    const resolveWithValue = (value: T) => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      resolve(value);
    };

    const cancelHandler = () => {
      rejectWithError(new Error('File selection cancelled.'));
    };

    fileInput.addEventListener('change', fileHandler);
    fileInput.addEventListener('cancel', cancelHandler);
    fileInput.click();

    function fileHandler(event: Event) {
      const target = event.target as HTMLInputElement;
      if (!target || !target.files || target.files.length === 0) {
        rejectWithError(new Error('File selection cancelled.'));
        return;
      }
      const file = target.files[0];
      try {
        enforceFileSizeLimit(file, maxFileSizeBytes);
      } catch (error) {
        rejectWithError(error);
        return;
      }
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
          const result = await load(buffer);
          resolveWithValue(result);
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

function mapExcelData(items: ExportRow[], columnMap: ColumnInfoMap, escapeFormulas: boolean, parentKey: string = ''): ExcelRowData[] {
  const rows: ExcelRowData[] = [];
  for (const item of items) {
    const columnData: ExcelColumnData[] = [];
    for (const columnKey in item) {
      const column = columnMap[columnKey];
      const v = item[columnKey];
      if (!column || v === undefined) continue;
      if (!column.data_group) {
        columnData.push(new ExcelColumnData(columnKey, serializeCellValue(column, v, escapeFormulas)));
        continue;
      }
      if (v === null) {
        continue;
      }
      if (!isGroupedCellValue(v)) {
        throw new Error(`Grouped column '${columnKey}' must be an object with a children array.`);
      }
      if (v.children.length) {
        const children = mapExcelData(v.children, columnMap, escapeFormulas, columnKey);
        if (!parentKey) {
          columnData.push(ExcelColumnData.newRootGroup(columnKey, children));
        } else {
          columnData.push(ExcelColumnData.newGroup(columnKey, serializeCellValue(column, v.value, escapeFormulas), children));
        }
      }
    }
    rows.push(new ExcelRowData(columnData));
  }
  return rows;
}

function getColumnMap(info: ExcelInfo): ColumnInfoMap {
  const columnMap: ColumnInfoMap = {};
  for (const column of info.columns) {
    columnMap[column.key] = column;
  }
  return columnMap;
}

async function toExcelWithNormalizedDefinition<T>(
  definition: NormalizedExcelDefinition,
  data: T[]
) {
  const info = getInfo(definition);
  const columnMap = getColumnMap(info);
  const rows = mapExcelData(data as ExportRow[], columnMap, definition.escapeFormulas);
  const excelData = new ExcelData(rows);
  return exportData(info, excelData);
}

async function _toExcel<T>(
  definition: ExcelDefinition,
  data: T[]
) {
  const normalizedDefinition = normalizeDefinition(definition);
  return toExcelWithNormalizedDefinition(normalizedDefinition, data);
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
  cleanupPendingDownloadObjectUrl();
  document.querySelector(`#${DOWNLOAD_LINK_ID}`)?.remove();
  const linkInput = document.createElement('a');
  linkInput.id = DOWNLOAD_LINK_ID;
  linkInput.download = name;
  const blob = new Blob([data], { type });
  const objectUrl = URL.createObjectURL(blob);
  linkInput.href = objectUrl;
  registerDownloadCleanupListeners();
  pendingDownloadObjectUrl = objectUrl;
  linkInput.click();
}

function cleanupPendingDownloadObjectUrl() {
  if (!pendingDownloadObjectUrl) {
    return;
  }
  URL.revokeObjectURL(pendingDownloadObjectUrl);
  pendingDownloadObjectUrl = null;
}

function registerDownloadCleanupListeners() {
  if (downloadCleanupListenersRegistered || typeof window === 'undefined') {
    return;
  }
  const cleanup = () => cleanupPendingDownloadObjectUrl();
  window.addEventListener('focus', cleanup);
  window.addEventListener('pagehide', cleanup);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      cleanup();
    }
  });
  downloadCleanupListenersRegistered = true;
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
  const normalizedDefinition = normalizeDefinition(definition);
  return readFileFromUpload(
    (buffer) => fromExcelWithNormalizedDefinition<T>(normalizedDefinition, buffer),
    normalizedDefinition.maxFileSizeBytes
  );
}

function importExcelDynamic(options?: DynamicExcelImportOptions): Promise<DynamicExcelImportResult> {
  const normalizedOptions = normalizeDynamicImportOptions(options);
  return readFileFromUpload(
    (buffer) => fromExcelDynamicWithOptions(buffer, normalizedOptions),
    normalizedOptions.maxFileSizeBytes
  );
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
  download,
  testUtils
};
