# @senlinz/import-export

High-level browser API for Excel template generation, export, and import.

[中文文档](./README.zh.md)

## Install

```bash
pnpm add @senlinz/import-export
```

## WASM loading

- `importExcel`, `importExcelDynamic`, `exportExcel`, `fromExcel`, `fromExcelDynamic`, `toExcel`, `downloadExcelTemplate`, and `generateExcelTemplate` auto-load and initialize the bundled WASM asset on first use.
- In Vite and other browser ESM bundlers, no manual `initializeWasm(...)` call or `?url` import is required when using the high-level core package.
- If you need to manage the WASM module yourself, use `@senlinz/import-export-wasm` directly instead of this package.

```ts
import { toExcel } from '@senlinz/import-export';

const workbook = await toExcel(
  {
    name: 'TomAndJerry',
    columns: [{ key: 'name', name: 'Name', dataType: 'text' }],
  },
  [{ name: 'Tom' }],
);
```

## Supported API

### Error localization

Errors default to English for compatibility. Set `locale: 'zh'` or `locale: 'zh-CN'` on an `ExcelDefinition` or `DynamicExcelImportOptions` object to use built-in Chinese messages.

You can override messages by stable error code with either a string template or a function. Message functions receive the error code, normalized locale, default message, original cause, and structured params.

```ts
import { fromExcel, ImportExportError } from '@senlinz/import-export';

const definition = {
  name: 'LocalizedImport',
  locale: 'zh-CN',
  columns: [{ key: 'name', name: '姓名', dataType: 'text' }],
  errorMessages: {
    HEADER_MISMATCH: ({ params }) => `表头错误：${params.cell} 需要 ${params.expected}，实际是 ${params.actual}`,
    INVALID_DATA_TYPE: '列 {columnKey} 的类型 {dataType} 不支持，可选值：{supportedDataTypes}',
  },
};

try {
  await fromExcel(definition, workbookBytes);
} catch (error) {
  if (error instanceof ImportExportError) {
    console.log(error.code, error.params, error.message);
  }
}
```

The package exports `ImportExportError`, `ValidationError`, `ImportError`, `ExportError`, and `WasmInitError`. Each error includes `code`, `params`, `locale`, and `cause`.

### Stable definition fields

- `name` - file name used for template/export downloads
- `sheetName` - worksheet name used for template/export generation; schema-based import reads the first worksheet
- `columns` - stable schema for headers, validation, and row mapping
- `author` - optional workbook author metadata
- `createTime` - optional workbook creation time as a `Date` or date string
- `maxFileSizeBytes` - browser upload limit in bytes (default 25 MiB) enforced before reading a file
- `title`, `titleHeight`, `titleFormat` - optional merged title row and its layout/format
- `defaultRowHeight`, `headerRowHeight` - row heights for exported data rows and header rows
- `dx`, `dy` - horizontal and vertical offsets before the header starts
- `isHeaderFreeze` - freezes the header area so column labels stay visible while scrolling
- `progressCallback` - progress hook for long-running import/export work
- `imageFetcher` - required resolver for `image` columns during export
- `escapeFormulas` - escapes formula-like text during export to block Excel formula injection (default: enabled)
- `locale` - built-in error language (`en`, `zh`, or `zh-CN`; default `en`)
- `errorMessages` / `messages` - custom error messages keyed by stable error code

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
- `maxFileSizeBytes` is optional and uses the same default 25 MiB browser upload limit as schema-based import.
- `locale` and `errorMessages` can customize dynamic import errors.
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
- Schema-based import reads the first worksheet in the workbook.
- Imported `number` columns are returned as numbers.
- Empty imported `number` and `date` cells are returned as `null`.
- Imported `date` values are returned as formatted strings.
- Unknown or malformed schemas fail fast before any workbook operation starts.
- Browser uploads enforce `maxFileSizeBytes` before reading the file (default 25 MiB).
- Use `importExcelDynamic(...)` for browser uploads without a schema, or `fromExcelDynamic(...)` when you already have workbook bytes.

## Export behavior

- `null` and `undefined` values are exported as blank cells.
- Number columns reject non-finite values.
- Date columns accept `Date` instances or parseable date strings.
- Text columns escape values that look like formulas by default; set `escapeFormulas: false` to allow formulas intentionally.
- Grouped export objects must use `{ value?, children: [...] }` for configured `dataGroup` columns.
- Image columns require `imageFetcher`.

## Image fetcher with URL validation

When using `imageFetcher` for image columns, validate URLs before fetching to avoid requests to untrusted origins. The example below enforces HTTPS and checks the HTTP response status:

```typescript
const imageFetcher = async (url: string): Promise<Uint8Array> => {
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:') {
    throw new Error(`Refusing to fetch image from non-HTTPS URL: ${url}`);
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
  }
  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
};
```

For server-side contexts, also consider restricting URLs to trusted domains and rejecting private/internal network addresses. See [SECURITY.md](../../SECURITY.md) for the full image fetcher trust model and additional guidance.

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
- The core package initializes its emitted bundled WASM asset asynchronously before the first workbook operation.

## Examples

- [Basic browser example](./examples/basic-browser.html)
- [Grouped export example](./examples/grouped-export.html)
- [Definition validation example](./examples/definition-errors.html)

These examples are covered by Playwright tests in [`./tests/import-export.spec.ts`](./tests/import-export.spec.ts).

## Test utilities

The package exposes a `testUtils` namespace for use in consumer test suites:

```ts
import { testUtils } from '@senlinz/import-export';
```

> **Warning:** `testUtils` is intended for testing purposes only. These helpers are internal implementation details and carry **no stability guarantee** — they may change or be removed in any release without notice.

| Helper                                          | Description                                                                                                                                               |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `normalizeDefinition(definition)`               | Normalizes and validates an `ExcelDefinition`, trimming strings and applying defaults.                                                                    |
| `normalizeDynamicImportOptions(options?)`       | Normalizes and validates dynamic import options (e.g. `headerRow`, `maxFileSizeBytes`).                                                                   |
| `sanitizeTextCellValue(value, escapeFormulas?)` | Sanitizes a text cell value to prevent formula injection. Prefixes formula-like values with a single quote when `escapeFormulas` is `true` (the default). |
| `defaultMaxFileSizeBytes`                       | The default maximum file size in bytes (25 MB).                                                                                                           |

## Known limitations

- Parent headers and data groups must be declared before dependent columns.
- Date imports normalize to strings instead of `Date` instances.
- Import currently validates a single worksheet at a time.
