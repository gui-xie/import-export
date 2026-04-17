/* tslint:disable */
/* eslint-disable */

export class DynamicExcelData {
    free(): void;
    [Symbol.dispose](): void;
    constructor(sheet_name: string, headers: string[], rows: ExcelRowData[]);
    headers: string[];
    rows: ExcelRowData[];
    sheet_name: string;
}

export class ExcelCellFormat {
    free(): void;
    [Symbol.dispose](): void;
    constructor();
    withAlign(align: string): ExcelCellFormat;
    withAlignVertical(align_vertical: string): ExcelCellFormat;
    withBackgroundColor(background_color: string): ExcelCellFormat;
    withBold(bold: boolean): ExcelCellFormat;
    withBorderColor(border_color: string): ExcelCellFormat;
    withColor(color: string): ExcelCellFormat;
    withDateFormat(date_format: string): ExcelCellFormat;
    withFontSize(font_size: number): ExcelCellFormat;
    withItalic(italic: boolean): ExcelCellFormat;
    withRule(rule: string): ExcelCellFormat;
    withStrikethrough(strikethrough: boolean): ExcelCellFormat;
    withUnderline(underline: boolean): ExcelCellFormat;
    withValue(value: string): ExcelCellFormat;
    align_vertical: string;
    align: string;
    background_color: string;
    bold: boolean;
    get border_color(): string | undefined;
    set border_color(value: string | null | undefined);
    color: string;
    get date_format(): string | undefined;
    set date_format(value: string | null | undefined);
    font_size: number;
    italic: boolean;
    rule: string;
    strikethrough: boolean;
    underline: boolean;
    value: string;
}

export class ExcelColumnData {
    free(): void;
    [Symbol.dispose](): void;
    constructor(key: string, value: string);
    static newGroup(group_name: string, value: string, children: ExcelRowData[]): ExcelColumnData;
    static newRootGroup(group_name: string, children: ExcelRowData[]): ExcelColumnData;
    withChildren(children: ExcelRowData[]): ExcelColumnData;
    children: ExcelRowData[];
    key: string;
    value: string;
}

export class ExcelColumnInfo {
    free(): void;
    [Symbol.dispose](): void;
    constructor(key: string, name: string);
    withAllowedValues(allowed_values: string[]): ExcelColumnInfo;
    withDataGroup(group: string): ExcelColumnInfo;
    withDataGroupParent(group_parent: string): ExcelColumnInfo;
    withDataType(data_type: string): ExcelColumnInfo;
    withFormat(format: ExcelCellFormat): ExcelColumnInfo;
    withNote(note: string): ExcelColumnInfo;
    withParent(parent: string): ExcelColumnInfo;
    withValueFormat(value_format: ExcelCellFormat[]): ExcelColumnInfo;
    withWidth(width: number): ExcelColumnInfo;
    allowed_values: string[];
    data_group_parent: string;
    data_group: string;
    data_type: string;
    get format(): ExcelCellFormat | undefined;
    set format(value: ExcelCellFormat | null | undefined);
    key: string;
    name: string;
    get note(): string | undefined;
    set note(value: string | null | undefined);
    parent: string;
    value_format: ExcelCellFormat[];
    width: number;
}

export class ExcelData {
    free(): void;
    [Symbol.dispose](): void;
    constructor(rows: ExcelRowData[]);
    rows: ExcelRowData[];
}

export class ExcelInfo {
    free(): void;
    [Symbol.dispose](): void;
    constructor(name: string, sheet_name: string, columns: ExcelColumnInfo[], author: string, create_time: string);
    withDefaultRowHeight(row_height: number): ExcelInfo;
    withHeaderRowHeight(row_height: number): ExcelInfo;
    withImageFetcher(fetcher: Function): ExcelInfo;
    withIsHeaderFreeze(is_header_freeze: boolean): ExcelInfo;
    withOffset(dx: number, dy: number): ExcelInfo;
    withProgressCallback(callback: Function): ExcelInfo;
    withTitle(title: string): ExcelInfo;
    withTitleFormat(title_format: ExcelCellFormat): ExcelInfo;
    withTitleHeight(title_height: number): ExcelInfo;
    author: string;
    columns: ExcelColumnInfo[];
    create_time: string;
    get default_row_height(): number | undefined;
    set default_row_height(value: number | null | undefined);
    dx: number;
    dy: number;
    get header_row_height(): number | undefined;
    set header_row_height(value: number | null | undefined);
    is_header_freeze: boolean;
    name: string;
    sheet_name: string;
    get title_format(): ExcelCellFormat | undefined;
    set title_format(value: ExcelCellFormat | null | undefined);
    get title_height(): number | undefined;
    set title_height(value: number | null | undefined);
    get title(): string | undefined;
    set title(value: string | null | undefined);
}

export class ExcelRowData {
    free(): void;
    [Symbol.dispose](): void;
    constructor(columns: ExcelColumnData[]);
    columns: ExcelColumnData[];
}

export function createTemplate(info: ExcelInfo): Uint8Array;

export function exportData(info: ExcelInfo, data: ExcelData): Promise<any>;

export function importData(info: ExcelInfo, excel_bytes: Uint8Array): ExcelData;

export function importDynamicData(sheet_name: string | null | undefined, header_row: number | null | undefined, excel_bytes: Uint8Array): DynamicExcelData;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly createTemplate: (a: number) => [number, number, number, number];
    readonly exportData: (a: number, b: number) => any;
    readonly importData: (a: number, b: number, c: number) => [number, number, number];
    readonly importDynamicData: (a: number, b: number, c: number, d: number, e: number) => [number, number, number];
    readonly __wbg_excelcellformat_free: (a: number, b: number) => void;
    readonly __wbg_excelcolumninfo_free: (a: number, b: number) => void;
    readonly __wbg_excelinfo_free: (a: number, b: number) => void;
    readonly __wbg_get_excelcellformat_align: (a: number) => [number, number];
    readonly __wbg_get_excelcellformat_align_vertical: (a: number) => [number, number];
    readonly __wbg_get_excelcellformat_background_color: (a: number) => [number, number];
    readonly __wbg_get_excelcellformat_bold: (a: number) => number;
    readonly __wbg_get_excelcellformat_border_color: (a: number) => [number, number];
    readonly __wbg_get_excelcellformat_color: (a: number) => [number, number];
    readonly __wbg_get_excelcellformat_date_format: (a: number) => [number, number];
    readonly __wbg_get_excelcellformat_font_size: (a: number) => number;
    readonly __wbg_get_excelcellformat_italic: (a: number) => number;
    readonly __wbg_get_excelcellformat_rule: (a: number) => [number, number];
    readonly __wbg_get_excelcellformat_strikethrough: (a: number) => number;
    readonly __wbg_get_excelcellformat_underline: (a: number) => number;
    readonly __wbg_get_excelcellformat_value: (a: number) => [number, number];
    readonly __wbg_get_excelcolumninfo_allowed_values: (a: number) => [number, number];
    readonly __wbg_get_excelcolumninfo_data_group: (a: number) => [number, number];
    readonly __wbg_get_excelcolumninfo_data_group_parent: (a: number) => [number, number];
    readonly __wbg_get_excelcolumninfo_data_type: (a: number) => [number, number];
    readonly __wbg_get_excelcolumninfo_format: (a: number) => number;
    readonly __wbg_get_excelcolumninfo_key: (a: number) => [number, number];
    readonly __wbg_get_excelcolumninfo_name: (a: number) => [number, number];
    readonly __wbg_get_excelcolumninfo_note: (a: number) => [number, number];
    readonly __wbg_get_excelcolumninfo_parent: (a: number) => [number, number];
    readonly __wbg_get_excelcolumninfo_value_format: (a: number) => [number, number];
    readonly __wbg_get_excelcolumninfo_width: (a: number) => number;
    readonly __wbg_get_excelinfo_author: (a: number) => [number, number];
    readonly __wbg_get_excelinfo_columns: (a: number) => [number, number];
    readonly __wbg_get_excelinfo_create_time: (a: number) => [number, number];
    readonly __wbg_get_excelinfo_default_row_height: (a: number) => [number, number];
    readonly __wbg_get_excelinfo_dx: (a: number) => number;
    readonly __wbg_get_excelinfo_dy: (a: number) => number;
    readonly __wbg_get_excelinfo_header_row_height: (a: number) => [number, number];
    readonly __wbg_get_excelinfo_is_header_freeze: (a: number) => number;
    readonly __wbg_get_excelinfo_name: (a: number) => [number, number];
    readonly __wbg_get_excelinfo_sheet_name: (a: number) => [number, number];
    readonly __wbg_get_excelinfo_title: (a: number) => [number, number];
    readonly __wbg_get_excelinfo_title_format: (a: number) => number;
    readonly __wbg_get_excelinfo_title_height: (a: number) => [number, number];
    readonly __wbg_set_excelcellformat_align: (a: number, b: number, c: number) => void;
    readonly __wbg_set_excelcellformat_align_vertical: (a: number, b: number, c: number) => void;
    readonly __wbg_set_excelcellformat_background_color: (a: number, b: number, c: number) => void;
    readonly __wbg_set_excelcellformat_bold: (a: number, b: number) => void;
    readonly __wbg_set_excelcellformat_border_color: (a: number, b: number, c: number) => void;
    readonly __wbg_set_excelcellformat_color: (a: number, b: number, c: number) => void;
    readonly __wbg_set_excelcellformat_date_format: (a: number, b: number, c: number) => void;
    readonly __wbg_set_excelcellformat_font_size: (a: number, b: number) => void;
    readonly __wbg_set_excelcellformat_italic: (a: number, b: number) => void;
    readonly __wbg_set_excelcellformat_rule: (a: number, b: number, c: number) => void;
    readonly __wbg_set_excelcellformat_strikethrough: (a: number, b: number) => void;
    readonly __wbg_set_excelcellformat_underline: (a: number, b: number) => void;
    readonly __wbg_set_excelcellformat_value: (a: number, b: number, c: number) => void;
    readonly __wbg_set_excelcolumninfo_allowed_values: (a: number, b: number, c: number) => void;
    readonly __wbg_set_excelcolumninfo_data_group: (a: number, b: number, c: number) => void;
    readonly __wbg_set_excelcolumninfo_data_group_parent: (a: number, b: number, c: number) => void;
    readonly __wbg_set_excelcolumninfo_data_type: (a: number, b: number, c: number) => void;
    readonly __wbg_set_excelcolumninfo_format: (a: number, b: number) => void;
    readonly __wbg_set_excelcolumninfo_key: (a: number, b: number, c: number) => void;
    readonly __wbg_set_excelcolumninfo_name: (a: number, b: number, c: number) => void;
    readonly __wbg_set_excelcolumninfo_note: (a: number, b: number, c: number) => void;
    readonly __wbg_set_excelcolumninfo_parent: (a: number, b: number, c: number) => void;
    readonly __wbg_set_excelcolumninfo_value_format: (a: number, b: number, c: number) => void;
    readonly __wbg_set_excelcolumninfo_width: (a: number, b: number) => void;
    readonly __wbg_set_excelinfo_author: (a: number, b: number, c: number) => void;
    readonly __wbg_set_excelinfo_columns: (a: number, b: number, c: number) => void;
    readonly __wbg_set_excelinfo_create_time: (a: number, b: number, c: number) => void;
    readonly __wbg_set_excelinfo_default_row_height: (a: number, b: number, c: number) => void;
    readonly __wbg_set_excelinfo_dx: (a: number, b: number) => void;
    readonly __wbg_set_excelinfo_dy: (a: number, b: number) => void;
    readonly __wbg_set_excelinfo_header_row_height: (a: number, b: number, c: number) => void;
    readonly __wbg_set_excelinfo_is_header_freeze: (a: number, b: number) => void;
    readonly __wbg_set_excelinfo_name: (a: number, b: number, c: number) => void;
    readonly __wbg_set_excelinfo_sheet_name: (a: number, b: number, c: number) => void;
    readonly __wbg_set_excelinfo_title: (a: number, b: number, c: number) => void;
    readonly __wbg_set_excelinfo_title_format: (a: number, b: number) => void;
    readonly __wbg_set_excelinfo_title_height: (a: number, b: number, c: number) => void;
    readonly excelcellformat_new: () => number;
    readonly excelcellformat_withAlign: (a: number, b: number, c: number) => number;
    readonly excelcellformat_withAlignVertical: (a: number, b: number, c: number) => number;
    readonly excelcellformat_withBackgroundColor: (a: number, b: number, c: number) => number;
    readonly excelcellformat_withBold: (a: number, b: number) => number;
    readonly excelcellformat_withBorderColor: (a: number, b: number, c: number) => number;
    readonly excelcellformat_withColor: (a: number, b: number, c: number) => number;
    readonly excelcellformat_withDateFormat: (a: number, b: number, c: number) => number;
    readonly excelcellformat_withFontSize: (a: number, b: number) => number;
    readonly excelcellformat_withItalic: (a: number, b: number) => number;
    readonly excelcellformat_withRule: (a: number, b: number, c: number) => number;
    readonly excelcellformat_withStrikethrough: (a: number, b: number) => number;
    readonly excelcellformat_withUnderline: (a: number, b: number) => number;
    readonly excelcellformat_withValue: (a: number, b: number, c: number) => number;
    readonly excelcolumninfo_bind_new: (a: number, b: number, c: number, d: number) => number;
    readonly excelcolumninfo_withAllowedValues: (a: number, b: number, c: number) => number;
    readonly excelcolumninfo_withDataGroup: (a: number, b: number, c: number) => number;
    readonly excelcolumninfo_withDataGroupParent: (a: number, b: number, c: number) => number;
    readonly excelcolumninfo_withDataType: (a: number, b: number, c: number) => number;
    readonly excelcolumninfo_withFormat: (a: number, b: number) => number;
    readonly excelcolumninfo_withNote: (a: number, b: number, c: number) => number;
    readonly excelcolumninfo_withParent: (a: number, b: number, c: number) => number;
    readonly excelcolumninfo_withValueFormat: (a: number, b: number, c: number) => number;
    readonly excelcolumninfo_withWidth: (a: number, b: number) => number;
    readonly excelinfo_bind_new: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number) => [number, number, number];
    readonly excelinfo_withDefaultRowHeight: (a: number, b: number) => number;
    readonly excelinfo_withHeaderRowHeight: (a: number, b: number) => number;
    readonly excelinfo_withImageFetcher: (a: number, b: any) => number;
    readonly excelinfo_withIsHeaderFreeze: (a: number, b: number) => number;
    readonly excelinfo_withOffset: (a: number, b: number, c: number) => number;
    readonly excelinfo_withProgressCallback: (a: number, b: any) => number;
    readonly excelinfo_withTitle: (a: number, b: number, c: number) => number;
    readonly excelinfo_withTitleFormat: (a: number, b: number) => number;
    readonly excelinfo_withTitleHeight: (a: number, b: number) => number;
    readonly __wbg_dynamicexceldata_free: (a: number, b: number) => void;
    readonly __wbg_get_dynamicexceldata_headers: (a: number) => [number, number];
    readonly __wbg_get_dynamicexceldata_rows: (a: number) => [number, number];
    readonly __wbg_get_dynamicexceldata_sheet_name: (a: number) => [number, number];
    readonly __wbg_set_dynamicexceldata_headers: (a: number, b: number, c: number) => void;
    readonly __wbg_set_dynamicexceldata_rows: (a: number, b: number, c: number) => void;
    readonly __wbg_set_dynamicexceldata_sheet_name: (a: number, b: number, c: number) => void;
    readonly dynamicexceldata_new: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
    readonly __wbg_excelrowdata_free: (a: number, b: number) => void;
    readonly __wbg_get_excelrowdata_columns: (a: number) => [number, number];
    readonly __wbg_set_excelrowdata_columns: (a: number, b: number, c: number) => void;
    readonly excelrowdata_new: (a: number, b: number) => number;
    readonly __wbg_excelcolumndata_free: (a: number, b: number) => void;
    readonly __wbg_get_excelcolumndata_children: (a: number) => [number, number];
    readonly __wbg_get_excelcolumndata_key: (a: number) => [number, number];
    readonly __wbg_get_excelcolumndata_value: (a: number) => [number, number];
    readonly __wbg_set_excelcolumndata_children: (a: number, b: number, c: number) => void;
    readonly __wbg_set_excelcolumndata_key: (a: number, b: number, c: number) => void;
    readonly __wbg_set_excelcolumndata_value: (a: number, b: number, c: number) => void;
    readonly excelcolumndata_bind_new: (a: number, b: number, c: number, d: number) => number;
    readonly excelcolumndata_newGroup: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
    readonly excelcolumndata_newRootGroup: (a: number, b: number, c: number, d: number) => number;
    readonly excelcolumndata_withChildren: (a: number, b: number, c: number) => number;
    readonly __wbg_exceldata_free: (a: number, b: number) => void;
    readonly __wbg_get_exceldata_rows: (a: number) => [number, number];
    readonly __wbg_set_exceldata_rows: (a: number, b: number, c: number) => void;
    readonly exceldata_new: (a: number, b: number) => number;
    readonly wasm_bindgen__convert__closures_____invoke__hb3e5d356ee2e5466: (a: number, b: number, c: any) => [number, number];
    readonly wasm_bindgen__convert__closures_____invoke__h98029d2eb04d9334: (a: number, b: number, c: any, d: any) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_destroy_closure: (a: number, b: number) => void;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __externref_drop_slice: (a: number, b: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
