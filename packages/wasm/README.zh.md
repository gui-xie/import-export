# @senlinz/import-export-wasm

用于导入、导出和生成 Excel 工作簿的 Rust / WebAssembly 直接绑定。

[English](./README.md)

## 安装

```bash
pnpm add @senlinz/import-export-wasm
```

## 初始化

先构建包，再在浏览器中加载生成的模块：

```ts
import init, {
  createTemplate,
  exportData,
  importData,
  ExcelInfo,
  ExcelColumnInfo,
  ExcelData,
  ExcelRowData,
  ExcelColumnData,
} from '@senlinz/import-export-wasm';

await init();
```

## 直接使用 WASM

```ts
const info = new ExcelInfo(
  'TomAndJerry',
  'sheet1',
  [
    new ExcelColumnInfo('name', 'Name'),
    new ExcelColumnInfo('age', 'Age').withDataType('number'),
    new ExcelColumnInfo('category', 'Category').withAllowedValues(['Cat', 'Mouse']),
  ],
  'senlinz',
  '2024-11-01T08:00:00',
);

const template = createTemplate(info);

const data = new ExcelData([
  new ExcelRowData([
    new ExcelColumnData('name', 'Tom'),
    new ExcelColumnData('age', '12'),
    new ExcelColumnData('category', 'Cat'),
  ]),
]);

const workbook = await exportData(info, data);
const imported = importData(info, workbook);
```

## 支持的 Schema 规则

- 列 key 必须唯一。
- 表头名称不能为空。
- `dataType` 仅支持 `text`、`number`、`date`、`image`。
- 父级列必须先于子级列声明。
- `dataGroupParent` 必须引用已声明的 `dataGroup`。

## 直接 WASM 示例

- [浏览器示例](./examples/direct-browser.html)

该浏览器示例由 [`./tests/wasm.test.js`](./tests/wasm.test.js) 中的 Playwright 用例覆盖。

## 运行时说明

- 浏览器使用前需要通过 `wasm-pack build` 生成 JS / WASM 产物。
- 图片导出需要 `.withImageFetcher(...)`。
- 非法 schema、非法数字值、非法日期值都会返回明确错误。

## 开发

```bash
cargo test --lib
wasm-pack build --release --target web
pnpm e2e-test
```
