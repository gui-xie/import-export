import { ExcelDataType } from "@senlinz/import-export-wasm"

interface ExcelDefinition {
    name: string,
    sheetName?: string,
    columns: ExcelColumnDefinition[],
    author?: string,
    createTime?: Date | string
}

interface ExcelColumnDefinition {
    key: string,
    name: string,
    width?: number,
    note?: string,
    dataType?: ExcelDataType,
    allowedValues?: string[],
}

export { ExcelDefinition, ExcelColumnDefinition, ExcelDataType };