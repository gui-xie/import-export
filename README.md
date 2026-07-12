# import-export

Browser-first Excel import/export packages backed by Rust and WebAssembly.

[中文文档](./README.zh.md)

## Packages

- [`@senlinz/import-export`](./packages/core/README.md): the high-level browser API for template generation, import, and export.
- [`@senlinz/import-export-wasm`](./packages/wasm/README.md): the lower-level WASM package for direct workbook operations.

## Install

```bash
pnpm add @senlinz/import-export
```

If you want direct WASM access instead of the higher-level wrapper:

```bash
pnpm add @senlinz/import-export-wasm
```

## Quick start

```ts
import {
  exportExcel,
  importExcel,
  downloadExcelTemplate,
} from "@senlinz/import-export";

const definition = {
  name: "TomAndJerry",
  sheetName: "sheet1",
  columns: [
    { key: "name", name: "Name", dataType: "text" },
    { key: "age", name: "Age", dataType: "number" },
    { key: "birthday", name: "Birthday", dataType: "date" },
    { key: "category", name: "Category", allowedValues: ["Cat", "Mouse"] },
  ],
};

await downloadExcelTemplate(definition);
await exportExcel(definition, [
  { name: "Tom", age: 12, birthday: "2024-11-01 00:00:00", category: "Cat" },
  { name: "Jerry", age: null, birthday: null, category: "Mouse" },
]);

const rows = await importExcel(definition);
```

## WASM loading

- `@senlinz/import-export` auto-loads its emitted bundled WASM asset on first use.
- In Vite and other browser ESM bundlers, no separate `initializeWasm(...)` or `?url` wiring is needed in the core package.
- If you need direct low-level WASM control, use `@senlinz/import-export-wasm` instead of the high-level wrapper.

## Error handling

- `@senlinz/import-export` wraps known validation, import, export, and WASM initialization failures in `ImportExportError` subclasses.
- Errors expose stable `code`, structured `params`, normalized `locale`, and the original `cause`.
- Error messages default to English. Set `locale: 'zh'` or `locale: 'zh-CN'` on `ExcelDefinition` or dynamic import options for built-in Chinese messages.
- Use `errorMessages` or `messages` to override messages by stable error code.
- Direct `@senlinz/import-export-wasm` calls throw JavaScript `Error` objects with stable `code` and `params`; application-level localization belongs in your app or in the core wrapper.

## Stable supported schema

- `columns[].dataType` supports `text`, `number`, `date`, and `image`.
- Parent headers must be declared before child headers.
- `dataGroup` and `dataGroupParent` are the supported advanced nesting features for grouped export rows.
- Image export requires `imageFetcher`.

## Browser/runtime support

- Primary target: browser ESM runtimes.
- Required browser APIs: `Blob`, `FileReader`, `URL.createObjectURL`, and `fetch`.
- `fromExcel`, `fromExcelDynamic`, `toExcel`, and `generateExcelTemplate` can also be used in non-DOM runtimes when those browser-compatible globals are available.
- `importExcelDynamic` provides the same schema-less import flow as `fromExcelDynamic`, but through the default browser file picker.
- The core package owns WASM loading internally and initializes the bundled asset asynchronously on first use.

## Known limitations

- Import validates worksheet headers strictly against the configured column names and order.
- Use `importExcelDynamic(...)` for schema-less browser uploads, or `fromExcelDynamic(...)` when you already have workbook bytes and need `{ sheetName, headers, rows }`.
- Date imports are returned as strings in `YYYY-MM-DD HH:mm:ss` form.
- Empty imported `number` and `date` cells are normalized to `null`.
- Grouped export data must match the configured parent/group hierarchy.

## Examples

- [Basic browser flow](./packages/core/examples/basic-browser.html)
- [Grouped export flow](./packages/core/examples/grouped-export.html)
- [Direct WASM browser flow](./packages/wasm/examples/direct-browser.html)

## Release preparation

- Current package version: `1.1.0`.
- `1.1.0` adds localized core error messages, stable error codes and params, per-call custom message overrides, and structured WASM error consumption while keeping compatibility with earlier string-encoded WASM errors.
- Prepare the coordinated release:

```bash
corepack pnpm changeset
corepack pnpm run release:version
corepack pnpm run release:check
```

- Publish from GitHub Actions with **Actions → Publish packages → Run workflow**, then enter:
  - `confirm=publish`
  - `version=1.1.0`

## Development

```bash
corepack pnpm install --frozen-lockfile
cargo test --manifest-path packages/wasm/Cargo.toml --lib
cargo bench --manifest-path packages/wasm/Cargo.toml --features benchmarks
corepack pnpm --filter @senlinz/import-export-wasm build
corepack pnpm --filter @senlinz/import-export build
corepack pnpm --filter @senlinz/import-export test
```

## License

MIT
