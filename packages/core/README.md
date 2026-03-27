# @senlinz/import-export

High-level browser API for Excel template generation, export, and import.

[中文文档](./README.zh.md)

## Install

```bash
pnpm add @senlinz/import-export
```

## Supported API

### Stable definition fields

- `name`
- `sheetName`
- `columns`
- `author`
- `createTime`
- `title`, `titleHeight`, `titleFormat`
- `defaultRowHeight`, `headerRowHeight`
- `dx`, `dy`
- `isHeaderFreeze`
- `progressCallback`
- `imageFetcher`

### Stable column fields

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

### Supported `dataType` values

- `text` - default text cells; the legacy `string` alias is not supported
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
- `downloadExcelTemplate`, `exportExcel`, and `importExcel` require DOM/browser APIs.
- `fromExcel`, `toExcel`, and `generateExcelTemplate` can be used in other runtimes when browser-compatible globals are available.

## Examples

- [Basic browser example](./examples/basic-browser.html)
- [Grouped export example](./examples/grouped-export.html)
- [Definition validation example](./examples/definition-errors.html)

These examples are covered by Playwright tests in [`./tests/import-export.spec.ts`](./tests/import-export.spec.ts).

## Known limitations

- Parent headers and data groups must be declared before dependent columns.
- Date imports normalize to strings instead of `Date` instances.
- Import currently validates a single worksheet at a time.
