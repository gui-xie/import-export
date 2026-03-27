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
 * - Import validates headers strictly against `columns[].name` order and position.
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
    author?: string,
    /** Workbook creation time accepted as a `Date` or ISO-like string. */
    createTime?: Date | string,
    /** Optional merged title row rendered above the header. */
    title?: string,
    titleHeight?: number,
    titleFormat?: ExcelCellFormatDefinition,
    defaultRowHeight?: number,
    headerRowHeight?: number,
    /** Horizontal column offset before writing the header. */
    dx?: number,
    /** Vertical row offset before writing the header. */
    dy?: number,
    isHeaderFreeze?: boolean,
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
    width?: number,
    note?: string,
    /**
     * Supported values:
     * - `text`
     * - `number`
     * - `date`
     * - `image`
     */
    dataType?: ExcelColumnDataType,
    allowedValues?: string[],
    /** Parent header key for multi-row headers. Parent columns must be declared first. */
    parent?: string,
    backgroundColor?: string,
    color?: string,
    bold?: boolean,
    format?: ExcelCellFormatDefinition,
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

export { ExcelDefinition, ExcelColumnDefinition, ExcelCellFormatDefinition, ExcelColumnDataType };
