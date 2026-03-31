# @senlinz/import-export

面向浏览器的高阶 Excel 模板生成、导出与导入 API。

[English](./README.md)

## 安装

```bash
pnpm add @senlinz/import-export
```

## 选择使用模式

### 默认模式（推荐）

- 无需额外初始化。
- `importExcel`、`importExcelDynamic`、`exportExcel`、`fromExcel`、`fromExcelDynamic`、`toExcel`、`downloadExcelTemplate`、`generateExcelTemplate` 会自动初始化内置 WASM 运行时。
- 适合绝大多数浏览器场景。

### 高级模式

- 在使用这些 Excel API 之前，先手动调用 `initializeWasm(...)`。
- 适用于自定义 WASM 托管、需要自己控制 bundler 行为，或希望复用已加载 bytes / module 的场景。
- 支持的手动输入：`source`、`bytes`、`module`。
- 同时也导出了 `bundledWasmSource`，方便在自包含 demo / 测试中显式走手动初始化流程。

```ts
import { initializeWasm, toExcel } from '@senlinz/import-export';

const wasmBytes = new Uint8Array(
  await (await fetch('/assets/imexport_wasm_bg.wasm')).arrayBuffer()
);

initializeWasm({ bytes: wasmBytes });

const workbook = await toExcel({
  name: 'TomAndJerry',
  columns: [{ key: 'name', name: 'Name', dataType: 'text' }],
}, [{ name: 'Tom' }]);
```

如果手动传入的 WASM 输入无效，`initializeWasm(...)` 会立即抛出清晰的错误信息。

## 支持的 API

### 稳定的 definition 字段

- `name`：模板 / 导出下载时使用的文件名
- `sheetName`：导出时使用、导入时优先匹配的工作表名称
- `columns`：表头、校验和行映射使用的稳定列定义
- `author`：可选的工作簿作者元数据
- `createTime`：可选的工作簿创建时间，支持 `Date` 或日期字符串
- `title`、`titleHeight`、`titleFormat`：可选的合并标题行及其高度、样式
- `defaultRowHeight`、`headerRowHeight`：导出时数据行和表头行的行高
- `dx`、`dy`：表头写入前的横向、纵向偏移量
- `isHeaderFreeze`：冻结表头区域，滚动时仍保持列标题可见
- `progressCallback`：长时间导入 / 导出过程中的进度回调
- `imageFetcher`：导出 `image` 列时必需的图片数据解析回调

### 稳定的列字段

- `key`：唯一的程序字段名
- `name`：工作表中显示的列表头
- `width`：导出列宽
- `note`：附加在表头单元格上的备注 / 注释
- `dataType`：标量单元格类型
- `allowedValues`：单元格允许值的校验列表
- `parent`：多级表头时的父级表头 key
- `format`：列的基础单元格格式
- `valueFormat`：导出值的直接或条件格式覆盖
- `dataGroup`：嵌套导出数据使用的逻辑分组标识
- `dataGroupParent`：嵌套导出数据使用的父级分组标识

### 支持的 `dataType`

- `text`：默认文本类型
- `number`：有限数值
- `date`：导出时支持 `Date` 实例或日期字符串
- `image`：通过 `imageFetcher` 解析图片 URL 或标识

## 导入 / 导出流程

```ts
import { downloadExcelTemplate, exportExcel, importExcel } from '@senlinz/import-export';

const definition = {
  name: 'TomAndJerry',
  sheetName: 'sheet1',
  columns: [
    { key: 'name', name: 'Name', dataType: 'text', width: 20, note: 'required' },
    { key: 'age', name: 'Age', dataType: 'number', width: 10 },
    { key: 'birthday', name: 'Birthday', dataType: 'date', width: 18 },
    { key: 'category', name: 'Category', allowedValues: ['Cat', 'Mouse'] },
    { key: 'image', name: 'Image', dataType: 'image', width: 10 },
  ],
  imageFetcher: async (url: string) => new Uint8Array(await (await fetch(url)).arrayBuffer()),
};

await downloadExcelTemplate(definition);

await exportExcel(definition, [
  { name: 'Tom', age: 12, birthday: '2024-11-01 00:00:00', category: 'Cat', image: '/Tom.jpg' },
  { name: 'Jerry', age: null, birthday: null, category: 'Mouse', image: '/Jerry.png' },
]);

const rows = await importExcel(definition);
```

## 动态导入

当你不想预先定义 `columns`，并希望直接使用浏览器文件选择框时，可使用 `importExcelDynamic(options?)`。

```ts
import { importExcelDynamic } from '@senlinz/import-export';

const result = await importExcelDynamic({
  sheetName: 'sheet1',
  headerRow: 1,
});
```

当你已经拿到工作簿字节数据时，可继续使用 `fromExcelDynamic(buffer, options?)`。

```ts
import { fromExcelDynamic } from '@senlinz/import-export';

const result = await fromExcelDynamic(fileBytes, {
  sheetName: 'sheet1',
  headerRow: 1,
});
```

- `importExcelDynamic(...)` 依赖 DOM / 浏览器文件上传 API。
- `sheetName` 可选，未提供或不存在时会回退到第一个工作表。
- `headerRow` 可选，使用从 `1` 开始的行号，默认会自动选择首个非空行。
- 返回值结构为 `{ sheetName, headers, rows }`。

## 导入行为

- 表头必须与 `columns[].name` 完全一致。
- `number` 列导入后返回数字。
- 空的 `number` / `date` 单元格导入后返回 `null`。
- `date` 列导入后返回格式化字符串。
- 非法或不完整的 schema 会在读取工作簿前立即失败。
- 无 schema 导入时，可使用 `importExcelDynamic(...)`（浏览器上传）或 `fromExcelDynamic(...)`（字节缓冲）。

## 导出行为

- `null` 和 `undefined` 会导出为空单元格。
- 数字列会拒绝非有限值。
- 日期列支持 `Date` 实例或日期字符串。
- 分组导出对象必须使用 `{ value?, children: [...] }` 结构。
- 图片列必须提供 `imageFetcher`。

## 已支持的高级能力

以下高级能力已纳入公开 API：

- 合并标题行
- 冻结表头
- 列备注
- 下拉候选值
- 条件 `valueFormat`
- 使用 `dataGroup` / `dataGroupParent` 的嵌套分组导出
- 通过 `imageFetcher` 导出图片

## 浏览器 / 运行时支持

- 主要面向浏览器 ESM 运行时。
- `downloadExcelTemplate`、`exportExcel`、`importExcel`、`importExcelDynamic` 依赖 DOM / 浏览器 API。
- 当运行时提供兼容的浏览器全局对象时，也可以使用 `fromExcel`、`fromExcelDynamic`、`toExcel`、`generateExcelTemplate`。
- `initializeWasm` 可用于使用调用方提供的 `source`、`bytes` 或 `module` 预初始化运行时。

## 示例

- [基础浏览器示例](./examples/basic-browser.html)
- [手动初始化 WASM 的浏览器示例](./examples/manual-wasm-browser.html)
- [分组导出示例](./examples/grouped-export.html)
- [Definition 校验示例](./examples/definition-errors.html)

这些示例由 [`./tests/import-export.spec.ts`](./tests/import-export.spec.ts) 中的 Playwright 用例覆盖。

## 已知限制

- 父级表头和数据分组必须先于依赖它们的列声明。
- `date` 导入结果会规范化为字符串，而不是 `Date` 实例。
- 当前一次只校验一个工作表。
