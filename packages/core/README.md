# @senlinz/import-export

High-level browser API for Excel template generation, export, and import.

[中文文档](./README.zh.md)

## Install

```bash
pnpm add @senlinz/import-export
```

## Choose your mode

### Default mode (recommended)

- No setup required.
- `importExcel`, `importExcelDynamic`, `exportExcel`, `fromExcel`, `fromExcelDynamic`, `toExcel`, `downloadExcelTemplate`, and `generateExcelTemplate` automatically initialize the bundled WASM runtime.
- Best for most browser applications.

### Advanced mode

- Call `initializeWasm(...)` yourself before using the Excel APIs.
- Use this when you want custom WASM hosting, bundler control, or to reuse bytes/modules that you loaded elsewhere.
- Supported manual inputs: `source`, `bytes`, or `module`.
- `bundledWasmSource` is also exported for self-contained demos/tests that still want explicit manual initialization.

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

If you provide invalid manual input, `initializeWasm(...)` throws a clear error immediately.

## Supported API

### Stable definition fields

- `name` - file name used for template/export downloads
- `sheetName` - worksheet name used for export and preferred during import
- `columns` - stable schema for headers, validation, and row mapping
- `author` - optional workbook author metadata
- `createTime` - optional workbook creation time as a `Date` or date string
- `title`, `titleHeight`, `titleFormat` - optional merged title row and its layout/format
- `defaultRowHeight`, `headerRowHeight` - row heights for exported data rows and header rows
- `dx`, `dy` - horizontal and vertical offsets before the header starts
- `isHeaderFreeze` - freezes the header area so column labels stay visible while scrolling
- `progressCallback` - progress hook for long-running import/export work
- `imageFetcher` - required resolver for `image` columns during export

### Schema-less import

Use `importExcelDynamic(options?)` when you want to open the browser file picker without defining `columns` ahead of time.

```ts
import { importExcelDynamic } from '@senlinz/import-export';

const result = await importExcelDynamic({
  sheetName: 'sheet1',
  headerRow: 1,
});

console.log(result.headers);
console.log(result.rows);
```

Use `fromExcelDynamic(buffer, options?)` when you want to read caller-provided workbook bytes without defining `columns` ahead of time.

```ts
import { fromExcelDynamic } from '@senlinz/import-export';

const result = await fromExcelDynamic(fileBytes, {
  sheetName: 'sheet1',
  headerRow: 1,
});

console.log(result.headers);
console.log(result.rows);
```

- `importExcelDynamic(...)` depends on DOM/browser file upload APIs.
- `sheetName` is optional and falls back to the first worksheet when missing.
- `headerRow` is optional, 1-based, and defaults to the first non-empty row in the selected sheet.
- The result shape is `{ sheetName, headers, rows }`.
- Dynamic import requires non-empty, unique header names in the selected header row.

### Stable column fields

- `key` - unique programmatic field key
- `name` - visible worksheet header label
- `width` - exported column width
- `note` - header note/comment shown in Excel
- `dataType` - scalar cell type
- `allowedValues` - validation list for allowed cell values
- `parent` - parent header key for multi-row headers
- `format` - base cell format for the column
- `valueFormat` - direct or conditional format overrides for exported values
- `dataGroup` - logical group identifier for nested export data
- `dataGroupParent` - parent group identifier for nested export data

### Supported `dataType` values

- `text` - default text cells
- `number` - finite numeric values
- `date` - `Date` instances or parseable date strings on export
- `image` - image URLs or identifiers resolved through `imageFetcher`

## Import/export flow

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

## Import behavior

- Headers must match the configured `columns[].name` values exactly.
- Imported `number` columns are returned as numbers.
- Empty imported `number` and `date` cells are returned as `null`.
- Imported `date` values are returned as formatted strings.
- Unknown or malformed schemas fail fast before any workbook operation starts.
- Use `importExcelDynamic(...)` for browser uploads without a schema, or `fromExcelDynamic(...)` when you already have workbook bytes.

## Export behavior

- `null` and `undefined` values are exported as blank cells.
- Number columns reject non-finite values.
- Date columns accept `Date` instances or parseable date strings.
- Grouped export objects must use `{ value?, children: [...] }` for configured `dataGroup` columns.
- Image columns require `imageFetcher`.

## Advanced supported features

These advanced features are supported and considered part of the public API:

- merged title rows
- frozen headers
- column notes
- allowed value validation lists
- conditional `valueFormat`
- nested grouped export data via `dataGroup` and `dataGroupParent`
- image export via `imageFetcher`

## Browser/runtime support

- Browser ESM runtimes are the primary target.
- `downloadExcelTemplate`, `exportExcel`, `importExcel`, and `importExcelDynamic` require DOM/browser APIs.
- `fromExcel`, `toExcel`, and `generateExcelTemplate` can be used in other runtimes when browser-compatible globals are available.
- `fromExcelDynamic` can also be used in other runtimes when browser-compatible globals are available.
- `initializeWasm` can be used to pre-initialize the runtime with caller-managed `source`, `bytes`, or `module`.

## Examples

- [Basic browser example](./examples/basic-browser.html)
- [Manual WASM browser example](./examples/manual-wasm-browser.html)
- [Grouped export example](./examples/grouped-export.html)
- [Definition validation example](./examples/definition-errors.html)

These examples are covered by Playwright tests in [`./tests/import-export.spec.ts`](./tests/import-export.spec.ts).

## Known limitations

- Parent headers and data groups must be declared before dependent columns.
- Date imports normalize to strings instead of `Date` instances.
- Import currently validates a single worksheet at a time.
