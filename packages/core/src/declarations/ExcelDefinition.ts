interface ExcelDefinition {
    name: string,
    sheetName?: string,
    columns: ExcelColumnDefinition[],
    author?: string,
    createTime?: Date | string,
    title?: string,
    titleHeight?: number,
    titleFormat?: ExcelCellFormatDefinition,
    defaultRowHeight?: number,
    dx?: number,
    dy?: number,
    isHeaderFreeze?: boolean
}

interface ExcelColumnDefinition {
    key: string,
    name: string,
    width?: number,
    note?: string,
    dataType?: "string" | "number" | "date",
    allowedValues?: string[],
    parent?: string,
    backgroundColor?: string,
    color?: string,
    bold?: boolean,
    format?: ExcelCellFormatDefinition,
    valueFormat?: ExcelCellFormatDefinition[] | ExcelCellFormatDefinition,
    dataGroup?: string,
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
    dateFormat?: string,
    borderColor?: string
}

export { ExcelDefinition, ExcelColumnDefinition, ExcelCellFormatDefinition };