interface ExcelDefinition {
    name: string,
    sheetName: string,
    columns: ExcelColumnDefinition[]
}

interface ExcelColumnDefinition {
    key: string,
    name: string
}

export { ExcelDefinition, ExcelColumnDefinition }