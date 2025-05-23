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
    headerRowHeight?: number,
    dx?: number,
    dy?: number,
    isHeaderFreeze?: boolean,
    progressCallback?: (progress: number) => void,
    imageFetcher?: (url: string) => Promise<Uint8Array>,
}

interface ExcelColumnDefinition {
    key: string,
    name: string,
    width?: number,
    note?: string,
    dataType?: "string" | "number" | "date" | "image",
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