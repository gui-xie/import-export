const ERROR_CODES = [
  'INVALID_DATA_TYPE_TYPE',
  'INVALID_DATA_TYPE',
  'INVALID_MAX_FILE_SIZE_BYTES',
  'INVALID_ESCAPE_FORMULAS',
  'FILE_TOO_LARGE',
  'DEFINITION_NAME_REQUIRED',
  'DEFINITION_COLUMNS_REQUIRED',
  'COLUMN_KEY_REQUIRED',
  'COLUMN_NAME_REQUIRED',
  'DUPLICATE_COLUMN_KEY',
  'COLUMN_PARENT_EMPTY',
  'COLUMN_PARENT_SELF',
  'COLUMN_PARENT_ORDER',
  'DATA_GROUP_EMPTY',
  'DUPLICATE_DATA_GROUP',
  'DATA_GROUP_PARENT_EMPTY',
  'DATA_GROUP_PARENT_SELF',
  'DATA_GROUP_PARENT_ORDER',
  'IMPORT_NUMBER_PARSE_FAILED',
  'EXPORT_NUMBER_VALUE_INVALID',
  'EXPORT_DATE_VALUE_INVALID',
  'DYNAMIC_HEADER_ROW_INVALID',
  'FILE_SELECTION_CANCELLED',
  'FILE_READ_FAILED',
  'FILE_READ_ABORTED',
  'GROUPED_COLUMN_INVALID',
  'WASM_FETCH_REQUIRED',
  'WASM_ASSET_LOAD_FAILED',
  'WASM_INIT_RETRY_FAILED',
  'WASM_INIT_FAILED',
  'HEADER_MISMATCH',
  'COLUMN_KEY_MISSING',
  'WORKBOOK_NO_WORKSHEETS',
  'WORKSHEET_EMPTY',
  'DYNAMIC_HEADER_ROW_MIN',
  'DYNAMIC_HEADER_ROW_RANGE',
  'DYNAMIC_HEADER_ROW_NOT_FOUND',
  'DYNAMIC_HEADER_EMPTY',
  'DYNAMIC_HEADER_DUPLICATE',
  'IMAGE_FETCHER_EMPTY_DATA',
  'IMAGE_PARSE_FAILED',
  'IMAGE_FETCHER_CALL_FAILED',
  'IMAGE_FETCHER_WAIT_FAILED',
  'IMAGE_FETCHER_INVALID_DATA',
  'IMAGE_FETCHER_REQUIRED',
  'IMPORT_WORKBOOK_FAILED',
  'IMPORT_DYNAMIC_WORKBOOK_FAILED',
  'EXPORT_WORKBOOK_FAILED',
  'TEMPLATE_WORKBOOK_FAILED',
  'INVALID_DEFINITION',
] as const;

type ImportExportErrorCode = (typeof ERROR_CODES)[number];
type ErrorLocale = 'en' | 'en-US' | 'zh' | 'zh-CN' | 'zh_CN';
type NormalizedErrorLocale = 'en' | 'zh';
type ErrorParams = Record<string, unknown>;

interface ErrorMessageContext {
  code: ImportExportErrorCode;
  locale: NormalizedErrorLocale;
  params: Readonly<ErrorParams>;
  defaultMessage: string;
  cause?: unknown;
}

type ErrorMessageTemplate = string | ((context: ErrorMessageContext) => string);
type ErrorMessages = Partial<Record<ImportExportErrorCode, ErrorMessageTemplate>>;

interface ErrorLocalizationOptions {
  /** Built-in error language. Defaults to English for compatibility. */
  locale?: ErrorLocale;
  /** Custom messages keyed by stable error code. */
  errorMessages?: ErrorMessages;
  /** Alias for `errorMessages`. */
  messages?: ErrorMessages;
}

interface ImportExportErrorOptions {
  cause?: unknown;
  message?: string;
}

const EN_MESSAGES: Record<ImportExportErrorCode, string> = {
  INVALID_DATA_TYPE_TYPE: "Invalid dataType '{dataType}' for column '{columnKey}'. dataType values must be strings.",
  INVALID_DATA_TYPE: "Invalid dataType '{dataType}' for column '{columnKey}'. Supported values are: {supportedDataTypes}.",
  INVALID_MAX_FILE_SIZE_BYTES: "Invalid maxFileSizeBytes '{value}' for {context}. Expected a positive finite number in bytes.",
  INVALID_ESCAPE_FORMULAS: "Invalid escapeFormulas '{value}' for {context}. Expected a boolean.",
  FILE_TOO_LARGE: "Selected file '{fileName}' exceeds the {maxFileSize} limit (received {fileSize}).",
  DEFINITION_NAME_REQUIRED: 'Excel definition must include a non-empty name.',
  DEFINITION_COLUMNS_REQUIRED: "Excel definition '{definitionName}' must include at least one column.",
  COLUMN_KEY_REQUIRED: "Excel definition '{definitionName}' contains a column with an empty key.",
  COLUMN_NAME_REQUIRED: "Column '{columnKey}' in definition '{definitionName}' must include a non-empty name.",
  DUPLICATE_COLUMN_KEY: "Duplicate column key '{columnKey}' found in definition '{definitionName}'.",
  COLUMN_PARENT_EMPTY: "Column '{columnKey}' has an empty parent reference.",
  COLUMN_PARENT_SELF: "Column '{columnKey}' cannot reference itself as a parent.",
  COLUMN_PARENT_ORDER: "Column '{columnKey}' references parent '{parentKey}', but parent columns must be declared before their children.",
  DATA_GROUP_EMPTY: "Column '{columnKey}' has an empty dataGroup value.",
  DUPLICATE_DATA_GROUP: "Duplicate dataGroup '{dataGroup}' found in definition '{definitionName}'.",
  DATA_GROUP_PARENT_EMPTY: "Column '{columnKey}' has an empty dataGroupParent value.",
  DATA_GROUP_PARENT_SELF: "Column '{columnKey}' cannot reference its own dataGroup '{dataGroupParent}' as dataGroupParent.",
  DATA_GROUP_PARENT_ORDER: "Column '{columnKey}' references dataGroupParent '{dataGroupParent}', but grouped parents must be declared before dependent columns.",
  IMPORT_NUMBER_PARSE_FAILED: "Failed to parse imported number '{value}' for column '{columnKey}'.",
  EXPORT_NUMBER_VALUE_INVALID: "Column '{columnKey}' expects a finite number value.",
  EXPORT_DATE_VALUE_INVALID: "Column '{columnKey}' expects a date string or Date instance.",
  DYNAMIC_HEADER_ROW_INVALID: "Dynamic import option 'headerRow' must be an integer greater than or equal to 1.",
  FILE_SELECTION_CANCELLED: 'File selection cancelled.',
  FILE_READ_FAILED: 'Failed to read import file.',
  FILE_READ_ABORTED: 'Import file read was aborted.',
  GROUPED_COLUMN_INVALID: "Grouped column '{columnKey}' must be an object with a children array.",
  WASM_FETCH_REQUIRED: 'WASM initialization requires a global fetch implementation in this runtime.',
  WASM_ASSET_LOAD_FAILED: "Failed to load the bundled Excel WASM asset from '{wasmUrl}'. HTTP {status}.",
  WASM_INIT_RETRY_FAILED: 'Failed to initialize WASM runtime after {attempts} attempts. Last error: {lastError}',
  WASM_INIT_FAILED: 'Failed to initialize the bundled Excel WASM runtime. {reason}',
  HEADER_MISMATCH: "Header mismatch at {cell} in sheet '{sheetName}': expected '{expected}', found '{actual}'",
  COLUMN_KEY_MISSING: "Column key '{columnKey}' is missing in definition",
  WORKBOOK_NO_WORKSHEETS: 'Workbook contains no worksheets',
  WORKSHEET_EMPTY: 'Worksheet contains no cells',
  DYNAMIC_HEADER_ROW_MIN: "Dynamic import option 'headerRow' must be greater than or equal to 1",
  DYNAMIC_HEADER_ROW_RANGE: "Dynamic import option 'headerRow' must point to a row within the used range. Received {headerRow}.",
  DYNAMIC_HEADER_ROW_NOT_FOUND: 'Dynamic import could not find a non-empty header row in the worksheet',
  DYNAMIC_HEADER_EMPTY: 'Dynamic import requires non-empty header names. Found an empty header at {cell}.',
  DYNAMIC_HEADER_DUPLICATE: "Dynamic import requires unique header names. Duplicate header '{header}' found at {cell}.",
  IMAGE_FETCHER_EMPTY_DATA: 'Image fetcher returned empty data for URL: {url}',
  IMAGE_PARSE_FAILED: "Failed to parse image from URL '{url}': {reason}",
  IMAGE_FETCHER_CALL_FAILED: 'Error calling image fetcher: {reason}',
  IMAGE_FETCHER_WAIT_FAILED: 'Error waiting for image fetcher: {reason}',
  IMAGE_FETCHER_INVALID_DATA: 'Image fetcher returned invalid data for URL: {url}',
  IMAGE_FETCHER_REQUIRED: 'Image fetcher is not defined',
  IMPORT_WORKBOOK_FAILED: "Failed to import workbook '{definitionName}'. {reason}",
  IMPORT_DYNAMIC_WORKBOOK_FAILED: 'Failed to dynamically import workbook. {reason}',
  EXPORT_WORKBOOK_FAILED: "Failed to export workbook '{definitionName}'. {reason}",
  TEMPLATE_WORKBOOK_FAILED: "Failed to generate template '{definitionName}'. {reason}",
  INVALID_DEFINITION: 'Invalid definition: {reason}',
};

const ZH_MESSAGES: Record<ImportExportErrorCode, string> = {
  INVALID_DATA_TYPE_TYPE: "列 '{columnKey}' 的 dataType '{dataType}' 无效，dataType 必须是字符串。",
  INVALID_DATA_TYPE: "列 '{columnKey}' 的 dataType '{dataType}' 无效，支持的值为：{supportedDataTypes}。",
  INVALID_MAX_FILE_SIZE_BYTES: "{context} 的 maxFileSizeBytes '{value}' 无效，必须是正的有限字节数。",
  INVALID_ESCAPE_FORMULAS: "{context} 的 escapeFormulas '{value}' 无效，必须是布尔值。",
  FILE_TOO_LARGE: "选择的文件 '{fileName}' 超过 {maxFileSize} 限制（当前 {fileSize}）。",
  DEFINITION_NAME_REQUIRED: 'Excel definition 必须包含非空 name。',
  DEFINITION_COLUMNS_REQUIRED: "Excel definition '{definitionName}' 必须至少包含一列。",
  COLUMN_KEY_REQUIRED: "Excel definition '{definitionName}' 中存在 key 为空的列。",
  COLUMN_NAME_REQUIRED: "definition '{definitionName}' 中的列 '{columnKey}' 必须包含非空 name。",
  DUPLICATE_COLUMN_KEY: "definition '{definitionName}' 中存在重复的列 key '{columnKey}'。",
  COLUMN_PARENT_EMPTY: "列 '{columnKey}' 的 parent 引用不能为空。",
  COLUMN_PARENT_SELF: "列 '{columnKey}' 不能将自身作为 parent。",
  COLUMN_PARENT_ORDER: "列 '{columnKey}' 引用了 parent '{parentKey}'，但父级列必须先于子级列声明。",
  DATA_GROUP_EMPTY: "列 '{columnKey}' 的 dataGroup 不能为空。",
  DUPLICATE_DATA_GROUP: "definition '{definitionName}' 中存在重复的 dataGroup '{dataGroup}'。",
  DATA_GROUP_PARENT_EMPTY: "列 '{columnKey}' 的 dataGroupParent 不能为空。",
  DATA_GROUP_PARENT_SELF: "列 '{columnKey}' 不能将自己的 dataGroup '{dataGroupParent}' 作为 dataGroupParent。",
  DATA_GROUP_PARENT_ORDER: "列 '{columnKey}' 引用了 dataGroupParent '{dataGroupParent}'，但分组父级必须先于依赖列声明。",
  IMPORT_NUMBER_PARSE_FAILED: "无法将导入值 '{value}' 解析为列 '{columnKey}' 的数字。",
  EXPORT_NUMBER_VALUE_INVALID: "列 '{columnKey}' 需要有限数字值。",
  EXPORT_DATE_VALUE_INVALID: "列 '{columnKey}' 需要日期字符串或 Date 实例。",
  DYNAMIC_HEADER_ROW_INVALID: "动态导入选项 'headerRow' 必须是大于等于 1 的整数。",
  FILE_SELECTION_CANCELLED: '已取消文件选择。',
  FILE_READ_FAILED: '读取导入文件失败。',
  FILE_READ_ABORTED: '导入文件读取已中止。',
  GROUPED_COLUMN_INVALID: "分组列 '{columnKey}' 必须是带 children 数组的对象。",
  WASM_FETCH_REQUIRED: '当前运行时缺少全局 fetch，无法初始化 WASM。',
  WASM_ASSET_LOAD_FAILED: "加载内置 Excel WASM 资源 '{wasmUrl}' 失败，HTTP {status}。",
  WASM_INIT_RETRY_FAILED: 'WASM 运行时初始化失败，已尝试 {attempts} 次。最后一次错误：{lastError}',
  WASM_INIT_FAILED: '初始化内置 Excel WASM 运行时失败。{reason}',
  HEADER_MISMATCH: "工作表 '{sheetName}' 的 {cell} 表头不匹配：期望 '{expected}'，实际为 '{actual}'",
  COLUMN_KEY_MISSING: "definition 中缺少列 key '{columnKey}'",
  WORKBOOK_NO_WORKSHEETS: '工作簿不包含工作表',
  WORKSHEET_EMPTY: '工作表不包含单元格',
  DYNAMIC_HEADER_ROW_MIN: "动态导入选项 'headerRow' 必须大于等于 1",
  DYNAMIC_HEADER_ROW_RANGE: "动态导入选项 'headerRow' 必须指向已使用范围内的行，当前为 {headerRow}。",
  DYNAMIC_HEADER_ROW_NOT_FOUND: '动态导入无法在工作表中找到非空表头行',
  DYNAMIC_HEADER_EMPTY: '动态导入要求表头名称非空，在 {cell} 发现空表头。',
  DYNAMIC_HEADER_DUPLICATE: "动态导入要求表头名称唯一，在 {cell} 发现重复表头 '{header}'。",
  IMAGE_FETCHER_EMPTY_DATA: 'imageFetcher 为 URL 返回了空数据：{url}',
  IMAGE_PARSE_FAILED: "解析 URL '{url}' 的图片失败：{reason}",
  IMAGE_FETCHER_CALL_FAILED: '调用 imageFetcher 失败：{reason}',
  IMAGE_FETCHER_WAIT_FAILED: '等待 imageFetcher 结果失败：{reason}',
  IMAGE_FETCHER_INVALID_DATA: 'imageFetcher 为 URL 返回了无效数据：{url}',
  IMAGE_FETCHER_REQUIRED: '未定义 imageFetcher',
  IMPORT_WORKBOOK_FAILED: "导入工作簿 '{definitionName}' 失败。{reason}",
  IMPORT_DYNAMIC_WORKBOOK_FAILED: '动态导入工作簿失败。{reason}',
  EXPORT_WORKBOOK_FAILED: "导出工作簿 '{definitionName}' 失败。{reason}",
  TEMPLATE_WORKBOOK_FAILED: "生成模板 '{definitionName}' 失败。{reason}",
  INVALID_DEFINITION: 'definition 无效：{reason}',
};

const ERROR_CODE_SET = new Set<string>(ERROR_CODES);
const DEFAULT_MESSAGES: Record<NormalizedErrorLocale, Record<ImportExportErrorCode, string>> = {
  en: EN_MESSAGES,
  zh: ZH_MESSAGES,
};

function normalizeLocale(locale?: ErrorLocale): NormalizedErrorLocale {
  if (locale === 'zh' || locale === 'zh-CN' || locale === 'zh_CN') {
    return 'zh';
  }
  return 'en';
}

function formatParam(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map(formatParam).join(', ');
  }
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
}

function interpolate(template: string, params: Readonly<ErrorParams>): string {
  return template.replace(/\{([A-Za-z0-9_]+)\}/g, (placeholder, key: string) => {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      return formatParam(params[key]);
    }
    return placeholder;
  });
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function getErrorLocalization(source?: ErrorLocalizationOptions): ErrorLocalizationOptions {
  return {
    locale: source?.locale,
    errorMessages: source?.errorMessages,
    messages: source?.messages,
  };
}

function formatErrorMessage(code: ImportExportErrorCode, params: ErrorParams = {}, localization: ErrorLocalizationOptions = {}, cause?: unknown): string {
  const locale = normalizeLocale(localization.locale);
  const defaultTemplate = DEFAULT_MESSAGES[locale][code] ?? DEFAULT_MESSAGES.en[code];
  const defaultMessage = interpolate(defaultTemplate, params);
  const customMessage = localization.errorMessages?.[code] ?? localization.messages?.[code];
  if (!customMessage) {
    return defaultMessage;
  }
  if (typeof customMessage === 'function') {
    return customMessage({ code, locale, params, defaultMessage, cause });
  }
  return interpolate(customMessage, params);
}

class ImportExportError extends Error {
  static readonly errorName: string = 'ImportExportError';

  readonly code: ImportExportErrorCode;
  readonly params: ErrorParams;
  readonly locale: NormalizedErrorLocale;
  declare cause?: unknown;

  constructor(code: ImportExportErrorCode, params: ErrorParams = {}, localization: ErrorLocalizationOptions = {}, options: ImportExportErrorOptions = {}) {
    super(options.message ?? formatErrorMessage(code, params, localization, options.cause));
    this.name = (new.target as typeof ImportExportError).errorName;
    this.code = code;
    this.params = params;
    this.locale = normalizeLocale(localization.locale);
    this.cause = options.cause;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

class ValidationError extends ImportExportError {
  static readonly errorName = 'ValidationError';
}

class WasmInitError extends ImportExportError {
  static readonly errorName = 'WasmInitError';
}

class ImportError extends ImportExportError {
  static readonly errorName = 'ImportError';
}

class ExportError extends ImportExportError {
  static readonly errorName = 'ExportError';
}

type ImportExportErrorConstructor = new (
  code: ImportExportErrorCode,
  params?: ErrorParams,
  localization?: ErrorLocalizationOptions,
  options?: ImportExportErrorOptions,
) => ImportExportError;

type ParsedWasmError = {
  code: ImportExportErrorCode;
  params: ErrorParams;
};

function isErrorCode(value: unknown): value is ImportExportErrorCode {
  return typeof value === 'string' && ERROR_CODE_SET.has(value);
}

function getStructuredParams(value: unknown): ErrorParams {
  if (typeof value !== 'object' || value === null) {
    return {};
  }
  const params = (value as { params?: unknown }).params;
  if (typeof params === 'object' && params !== null && !Array.isArray(params)) {
    return params as ErrorParams;
  }
  return {};
}

function getStructuredCode(value: unknown): ImportExportErrorCode | undefined {
  if (typeof value !== 'object' || value === null) {
    return undefined;
  }
  const code = (value as { code?: unknown }).code;
  return isErrorCode(code) ? code : undefined;
}

function parseKnownWasmError(message: string): ParsedWasmError | undefined {
  // Try to parse structured JSON error format first
  try {
    const trimmed = message.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === 'object' && isErrorCode(parsed.code) && typeof parsed.params === 'object') {
        return { code: parsed.code, params: parsed.params as ErrorParams };
      }
    }
  } catch {
    // Not JSON, continue with regex parsing
  }

  // Use non-greedy matching and handle newlines with [\s\S]*
  let match: RegExpExecArray | null;

  // For patterns with quoted strings that might contain special chars, extract just the first line or quoted portion
  match = /^Header mismatch at ([^\n]+) in sheet '([^\n']+)': expected '([^'\n]*)', found '([^'\n]*)'(?:[\s\S])*$/.exec(message);
  if (match) {
    return {
      code: 'HEADER_MISMATCH',
      params: {
        cell: match[1],
        sheetName: match[2],
        expected: match[3],
        actual: match[4],
      },
    };
  }

  match = /^Column key '([^'\n]*)' is missing in definition$/.exec(message);
  if (match) {
    return { code: 'COLUMN_KEY_MISSING', params: { columnKey: match[1] } };
  }

  if (message === 'Workbook contains no worksheets') {
    return { code: 'WORKBOOK_NO_WORKSHEETS', params: {} };
  }

  if (message === 'Worksheet contains no cells') {
    return { code: 'WORKSHEET_EMPTY', params: {} };
  }

  if (message === "Dynamic import option 'headerRow' must be greater than or equal to 1") {
    return { code: 'DYNAMIC_HEADER_ROW_MIN', params: {} };
  }

  match = /^Dynamic import option 'headerRow' must point to a row within the used range\. Received (\d+)\./.exec(message);
  if (match) {
    return { code: 'DYNAMIC_HEADER_ROW_RANGE', params: { headerRow: Number(match[1]) } };
  }

  if (message === 'Dynamic import could not find a non-empty header row in the worksheet') {
    return { code: 'DYNAMIC_HEADER_ROW_NOT_FOUND', params: {} };
  }

  match = /^Dynamic import requires non-empty header names\. Found an empty header at ([^\n.]+)\./.exec(message);
  if (match) {
    return { code: 'DYNAMIC_HEADER_EMPTY', params: { cell: match[1] } };
  }

  match = /^Dynamic import requires unique header names\. Duplicate header '(.*?)' found at (.+)\.$/.exec(message);
  if (match) {
    return { code: 'DYNAMIC_HEADER_DUPLICATE', params: { header: match[1], cell: match[2] } };
  }

  match = /^Image fetcher returned empty data for URL: ([^\n]*)$/.exec(message);
  if (match) {
    return { code: 'IMAGE_FETCHER_EMPTY_DATA', params: { url: match[1] } };
  }

  match = /^Failed to parse image from URL '([^'\n]*)': ([^\n]*)(?:[\s\S])*$/.exec(message);
  if (match) {
    return { code: 'IMAGE_PARSE_FAILED', params: { url: match[1], reason: match[2] } };
  }

  match = /^Error calling image fetcher: ([^\n]*)(?:[\s\S])*$/.exec(message);
  if (match) {
    return { code: 'IMAGE_FETCHER_CALL_FAILED', params: { reason: match[1] } };
  }

  match = /^Error waiting for image fetcher: ([^\n]*)(?:[\s\S])*$/.exec(message);
  if (match) {
    return { code: 'IMAGE_FETCHER_WAIT_FAILED', params: { reason: match[1] } };
  }

  match = /^Image fetcher returned invalid data for URL: ([^\n]*)$/.exec(message);
  if (match) {
    return { code: 'IMAGE_FETCHER_INVALID_DATA', params: { url: match[1] } };
  }

  if (message === 'Image fetcher is not defined') {
    return { code: 'IMAGE_FETCHER_REQUIRED', params: {} };
  }

  match = /^Invalid number value '([^'\n]*)' for column '([^'\n]*)': ([^\n]*)$/.exec(message);
  if (match) {
    return {
      code: 'EXPORT_NUMBER_VALUE_INVALID',
      params: { value: match[1], columnKey: match[2], reason: match[3] },
    };
  }

  match = /^Invalid date value '([^'\n]*)' for column '([^'\n]*)': ([^\n]*)$/.exec(message);
  if (match) {
    return {
      code: 'EXPORT_DATE_VALUE_INVALID',
      params: { value: match[1], columnKey: match[2], reason: match[3] },
    };
  }

  match = /^Invalid definition: ([^\n]*)$/.exec(message);
  if (match) {
    return { code: 'INVALID_DEFINITION', params: { reason: match[1] } };
  }

  return undefined;
}

function localizeCaughtError(
  error: unknown,
  localization: ErrorLocalizationOptions,
  fallbackCode: ImportExportErrorCode,
  fallbackParams: ErrorParams = {},
  ErrorClass: ImportExportErrorConstructor = ImportExportError,
): ImportExportError {
  if (error instanceof ImportExportError) {
    const Constructor = error.constructor as ImportExportErrorConstructor;
    return new Constructor(error.code, error.params, localization, { cause: error.cause ?? error });
  }

  const structuredCode = getStructuredCode(error);
  if (structuredCode) {
    return new ErrorClass(structuredCode, getStructuredParams(error), localization, { cause: error });
  }

  const message = getErrorMessage(error);
  const parsed = parseKnownWasmError(message);
  if (parsed) {
    return new ErrorClass(parsed.code, parsed.params, localization, { cause: error });
  }

  return new ErrorClass(
    fallbackCode,
    {
      ...fallbackParams,
      reason: message,
    },
    localization,
    { cause: error },
  );
}

export { ExportError, formatErrorMessage, getErrorLocalization, getErrorMessage, ImportError, ImportExportError, localizeCaughtError, ValidationError, WasmInitError };

export type { ErrorLocalizationOptions, ErrorLocale, ErrorMessageContext, ErrorMessages, ErrorMessageTemplate, ErrorParams, ImportExportErrorCode };
