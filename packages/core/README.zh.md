# @senlinz/import-export

面向浏览器的高阶 Excel 模板生成、导出与导入 API。

[English](./README.md)

## 安装

```bash
pnpm add @senlinz/import-export
```

## 支持的 API

### 稳定的 definition 字段

- `name`
- `sheetName`
- `columns`
- `author`
- `createTime`
- `title`、`titleHeight`、`titleFormat`
- `defaultRowHeight`、`headerRowHeight`
- `dx`、`dy`
- `isHeaderFreeze`
- `progressCallback`
- `imageFetcher`

### 稳定的列字段

- `key`
- `name`
- `width`
- `note`
- `dataType`
- `allowedValues`
- `parent`
- `format`
- `valueFormat`
- `dataGroup`
- `dataGroupParent`

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

## 导入行为

- 表头必须与 `columns[].name` 完全一致。
- `number` 列导入后返回数字。
- 空的 `number` / `date` 单元格导入后返回 `null`。
- `date` 列导入后返回格式化字符串。
- 非法或不完整的 schema 会在读取工作簿前立即失败。

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
- `downloadExcelTemplate`、`exportExcel`、`importExcel` 依赖 DOM / 浏览器 API。
- 当运行时提供兼容的浏览器全局对象时，也可以使用 `fromExcel`、`toExcel`、`generateExcelTemplate`。

## 示例

- [基础浏览器示例](./examples/basic-browser.html)
- [分组导出示例](./examples/grouped-export.html)
- [Definition 校验示例](./examples/definition-errors.html)

这些示例由 [`./tests/import-export.spec.ts`](./tests/import-export.spec.ts) 中的 Playwright 用例覆盖。

## 已知限制

- 父级表头和数据分组必须先于依赖它们的列声明。
- `date` 导入结果会规范化为字符串，而不是 `Date` 实例。
- 当前一次只校验一个工作表。
