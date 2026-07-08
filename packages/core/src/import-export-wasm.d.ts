declare module '@senlinz/import-export-wasm' {
  export class ExcelCellFormat {
    withRule(rule: 'default' | 'eq'): this;
    withValue(value: string): this;
    withColor(color: string): this;
    withBold(bold: boolean): this;
    withItalic(italic: boolean): this;
    withUnderline(underline: boolean): this;
    withStrikethrough(strikethrough: boolean): this;
    withFontSize(fontSize: number): this;
    withBackgroundColor(backgroundColor: string): this;
    withAlign(align: 'left' | 'center' | 'right'): this;
    withAlignVertical(alignVertical: 'top' | 'center' | 'bottom'): this;
    withBorderColor(borderColor: string): this;
    withDateFormat(dateFormat: string): this;
  }

  export class ExcelColumnInfo {
    key: string;
    data_type: string;
    data_group?: string | null;

    constructor(key: string, name: string);
    withWidth(width: number): this;
    withDataType(dataType: string): this;
    withNote(note: string): this;
    withAllowedValues(allowedValues: string[]): this;
    withParent(parent: string): this;
    withFormat(format: ExcelCellFormat): this;
    withValueFormat(formats: ExcelCellFormat[]): this;
    withDataGroup(dataGroup: string): this;
    withDataGroupParent(dataGroupParent: string): this;
  }

  export class ExcelInfo {
    columns: ExcelColumnInfo[];

    constructor(name: string, sheetName: string, columns: ExcelColumnInfo[], author: string, createTime: string);
    withOffset(dx: number, dy: number): this;
    withTitle(title: string): this;
    withTitleHeight(titleHeight: number): this;
    withTitleFormat(titleFormat: ExcelCellFormat): this;
    withDefaultRowHeight(defaultRowHeight: number): this;
    withHeaderRowHeight(headerRowHeight: number): this;
    withIsHeaderFreeze(isHeaderFreeze: boolean): this;
    withProgressCallback(progressCallback: (progress: number) => void): this;
    withImageFetcher(imageFetcher: (url: string) => Promise<Uint8Array>): this;
  }

  export class ExcelColumnData {
    key: string;
    value: string;

    constructor(key: string, value: string);
    static newRootGroup(key: string, children: ExcelRowData[]): ExcelColumnData;
    static newGroup(key: string, value: string, children: ExcelRowData[]): ExcelColumnData;
  }

  export class ExcelRowData {
    columns: ExcelColumnData[];

    constructor(columns: ExcelColumnData[]);
  }

  export class ExcelData {
    rows: ExcelRowData[];

    constructor(rows: ExcelRowData[]);
  }

  export class DynamicExcelData {
    sheet_name: string;
    headers: string[];
    rows: ExcelRowData[];

    constructor(sheet_name: string, headers: string[], rows: ExcelRowData[]);
  }

  type InitInput = BufferSource | WebAssembly.Module | Response | RequestInfo | URL;

  export default function init(input?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<unknown>;
  export function initSync(input: { module: BufferSource | WebAssembly.Module }): void;
  export function createTemplate(info: ExcelInfo): Uint8Array;
  export function importData(info: ExcelInfo, buffer: Uint8Array): ExcelData;
  export function importDynamicData(sheetName: string | undefined, headerRow: number | undefined, buffer: Uint8Array): DynamicExcelData;
  export function exportData(info: ExcelInfo, data: ExcelData): Promise<Uint8Array>;
}

declare module '@senlinz/import-export-wasm/pkg/imexport_wasm_bg.wasm' {
  const wasmSource: string;
  export default wasmSource;
}

declare module '@senlinz/import-export-wasm/pkg/imexport_wasm_bg.wasm?url' {
  const wasmUrl: string;
  export default wasmUrl;
}
