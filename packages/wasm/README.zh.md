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
} from "@senlinz/import-export-wasm";

await init();
```

## 直接使用 WASM

```ts
const info = new ExcelInfo(
  "TomAndJerry",
  "sheet1",
  [
    new ExcelColumnInfo("name", "Name"),
    new ExcelColumnInfo("age", "Age").withDataType("number"),
    new ExcelColumnInfo("category", "Category").withAllowedValues([
      "Cat",
      "Mouse",
    ]),
  ],
  "senlinz",
  "2024-11-01T08:00:00"
);

const template = createTemplate(info);

const data = new ExcelData([
  new ExcelRowData([
    new ExcelColumnData("name", "Tom"),
    new ExcelColumnData("age", "12"),
    new ExcelColumnData("category", "Cat"),
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
- 生成的 `pkg/` 目录属于构建产物，不会提交到 git。
- 图片导出需要 `.withImageFetcher(...)`。
- 已知 WASM 失败会抛出带稳定 `code` 和 `params` 字段的 JavaScript `Error` 对象。用户可在应用中自行本地化，或使用 `@senlinz/import-export`。
- 非法 schema、非法数字值、非法日期值都会返回明确错误。

### 结构化错误

已知失败会暴露稳定的 JavaScript 错误结构：

```ts
try {
  const imported = importData(info, workbook);
} catch (error) {
  if (error instanceof Error) {
    console.log(error.name); // ImportExportWasmError
    console.log((error as Error & { code?: string }).code);
    console.log((error as Error & { params?: Record<string, unknown> }).params);
  }
}
```

WASM 包不负责翻译错误消息。如果需要内置中英文消息或单次调用级别的消息覆盖，请使用 `@senlinz/import-export`。

## 开发

```bash
cargo test --lib
cargo bench --features benchmarks
wasm-pack build --release --target web
corepack pnpm install
corepack pnpm exec playwright install chromium
npm run e2e-test
```
