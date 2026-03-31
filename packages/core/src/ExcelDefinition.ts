/**
 * Stable scalar cell types supported by the public API.
 */
type ExcelColumnDataType = "text" | "number" | "date" | "image";

/**
 * Runtime support:
 * - Browser ESM environments with `Blob`, `FileReader`, `atob`, and `URL.createObjectURL`.
 * - Node.js can use `fromExcel`, `toExcel`, and `generateExcelTemplate` when compatible browser globals are available.
 *
 * Known limitations:
 * - Schema-based import validates headers strictly against `columns[].name` order and position.
 * - Grouped export expects parent columns and data groups to be declared before children.
 * - Image export requires `imageFetcher`.
 */
interface ExcelDefinition {
    /** File name used for template/export downloads. */
    name: string,
    /** Worksheet name used for export and preferred during import. */
    sheetName?: string,
    /** Stable schema definition for worksheet columns. */
    columns: ExcelColumnDefinition[],
    /** Optional workbook author metadata written into generated files. */
    author?: string,
    /** Workbook creation time accepted as a `Date` or ISO-like string. */
    createTime?: Date | string,
    /** Optional merged title row rendered above the header. */
    title?: string,
    /** Height of the optional merged title row in worksheet units. */
    titleHeight?: number,
    /** Format applied to the optional merged title row. */
    titleFormat?: ExcelCellFormatDefinition,
    /** Default height used for data rows when exporting a worksheet. */
    defaultRowHeight?: number,
    /** Height applied to header rows during template/export generation. */
    headerRowHeight?: number,
    /** Horizontal column offset before writing the header. */
    dx?: number,
    /** Vertical row offset before writing the header. */
    dy?: number,
    /** Freezes the header area so column labels remain visible while scrolling. */
    isHeaderFreeze?: boolean,
    /** Optional progress callback receiving values from `0` to `100` during long-running work. */
    progressCallback?: (progress: number) => void,
    /**
     * Required when any exported column uses `dataType: "image"`.
     * The callback must resolve to image bytes for the provided URL or identifier.
     */
    imageFetcher?: (url: string) => Promise<Uint8Array>,
}

interface ExcelColumnDefinition {
    /** Stable programmatic key used to map row objects. Must be unique within a definition. */
    key: string,
    /** Visible worksheet header label. */
    name: string,
    /** Column width used for template/export rendering. */
    width?: number,
    /** Excel note/comment attached to the header cell. */
    note?: string,
    /**
     * Supported values:
     * - `text`
     * - `number`
     * - `date`
     * - `image`
     */
    dataType?: ExcelColumnDataType,
    /** Drop-down allowed values used for template validation and import expectations. */
    allowedValues?: string[],
    /** Parent header key for multi-row headers. Parent columns must be declared first. */
    parent?: string,
    /** Header background color in a CSS-like hex string such as `#RRGGBB`. */
    backgroundColor?: string,
    /** Header text color in a CSS-like hex string such as `#RRGGBB`. */
    color?: string,
    /** Whether the header text should be rendered bold. */
    bold?: boolean,
    /** Base format applied to cells in this column. */
    format?: ExcelCellFormatDefinition,
    /** Conditional or direct format overrides applied to exported cell values. */
    valueFormat?: ExcelCellFormatDefinition[] | ExcelCellFormatDefinition,
    /** Optional logical group identifier for nested export data. */
    dataGroup?: string,
    /** Optional parent group identifier. Referenced groups must be declared first. */
    dataGroupParent?: string
}

interface ExcelCellFormatDefinition {
    rule?: 'default' | 'eq',
    value?: string,
    color?: string,
    bold?: boolean,
    italic?: boolean,
    underline?: boolean,
    strikethrough?: boolean,
    fontSize?: number,
    backgroundColor?: string,
    align?: 'left' | 'center' | 'right',
    alignVertical?: 'top' | 'center' | 'bottom',
    /** Excel-compatible number format string used for date display. */
    dateFormat?: string,
    borderColor?: string
}

interface DynamicExcelImportOptions {
    /** Preferred worksheet name. Falls back to the first sheet when omitted or missing. */
    sheetName?: string,
    /** 1-based worksheet row number to use as the header row. Defaults to the first non-empty row. */
    headerRow?: number
}

interface DynamicExcelImportResult {
    /** Actual worksheet name that was imported. */
    sheetName: string,
    /** Header labels read from the worksheet in left-to-right order. */
    headers: string[],
    /** Row data keyed by the imported header labels. */
    rows: Record<string, string>[]
}

export {
    ExcelDefinition,
    ExcelColumnDefinition,
    ExcelCellFormatDefinition,
    ExcelColumnDataType,
    DynamicExcelImportOptions,
    DynamicExcelImportResult
};
