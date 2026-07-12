# @senlinz/import-export-wasm

Direct Rust/WebAssembly bindings for importing, exporting, and templating Excel workbooks.

[中文文档](./README.zh.md)

## Install

```bash
pnpm add @senlinz/import-export-wasm
```

## Initialization

Build the package and load the generated module in the browser:

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

## Direct WASM usage

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

## Supported schema rules

- Column keys must be unique.
- Header names must be non-empty.
- Supported `dataType` values are `text`, `number`, `date`, and `image`.
- Parent columns must be declared before child columns.
- `dataGroupParent` values must refer to a previously declared `dataGroup`.

## Direct WASM examples

- [Browser example](./examples/direct-browser.html)

The browser example is covered by Playwright tests in [`./tests/wasm.test.js`](./tests/wasm.test.js).

## Runtime notes

- Browser usage requires the generated JS/WASM assets from `wasm-pack build`.
- The generated `pkg/` directory is a build artifact and is not tracked in git.
- Image export requires `.withImageFetcher(...)`.
- Known WASM failures throw JavaScript `Error` objects with stable `code` and `params` fields. Localize user-facing messages in your application or use `@senlinz/import-export`.
- Invalid schemas and invalid exported number/date values now fail with explicit errors.

## Development

```bash
cargo test --lib
cargo bench --features benchmarks
wasm-pack build --release --target web
corepack pnpm install
corepack pnpm exec playwright install chromium
npm run e2e-test
```
