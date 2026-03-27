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
import { exportExcel, importExcel, downloadExcelTemplate } from '@senlinz/import-export';

const definition = {
  name: 'TomAndJerry',
  sheetName: 'sheet1',
  columns: [
    { key: 'name', name: 'Name', dataType: 'text' },
    { key: 'age', name: 'Age', dataType: 'number' },
    { key: 'birthday', name: 'Birthday', dataType: 'date' },
    { key: 'category', name: 'Category', allowedValues: ['Cat', 'Mouse'] },
  ],
};

await downloadExcelTemplate(definition);
await exportExcel(definition, [
  { name: 'Tom', age: 12, birthday: '2024-11-01 00:00:00', category: 'Cat' },
  { name: 'Jerry', age: null, birthday: null, category: 'Mouse' },
]);

const rows = await importExcel(definition);
```

## Choose your mode

### Default mode (recommended)

- Keep using the existing top-level APIs with no setup.
- The package auto-initializes its bundled WASM runtime when needed.

### Advanced mode

- Call `initializeWasm(...)` before using the same top-level APIs.
- Use this when you want to load the WASM bytes/module/source yourself for custom hosting, bundler control, or performance-sensitive setups.

```ts
import { initializeWasm, exportExcel } from '@senlinz/import-export';

const wasmBytes = new Uint8Array(
  await (await fetch('/assets/imexport_wasm_bg.wasm')).arrayBuffer()
);

initializeWasm({ bytes: wasmBytes });
await exportExcel(definition, [{ name: 'Tom', age: 12, birthday: '2024-11-01 00:00:00', category: 'Cat' }]);
```

Manual initialization accepts `source`, `bytes`, or `module` and throws a clear error for invalid input.

## Stable supported schema

- `columns[].dataType` supports `text`, `number`, `date`, and `image`.
- Parent headers must be declared before child headers.
- `dataGroup` and `dataGroupParent` are the supported advanced nesting features for grouped export rows.
- Image export requires `imageFetcher`.

## Browser/runtime support

- Primary target: browser ESM runtimes.
- Required browser APIs: `Blob`, `FileReader`, `URL.createObjectURL`, and `atob`.
- `fromExcel`, `toExcel`, and `generateExcelTemplate` can also be used in non-DOM runtimes when those browser-compatible globals are available.
- `initializeWasm` lets advanced users provide their own WASM source, bytes, or compiled module.

## Known limitations

- Import validates worksheet headers strictly against the configured column names and order.
- Date imports are returned as strings in `YYYY-MM-DD HH:mm:ss` form.
- Empty imported `number` and `date` cells are normalized to `null`.
- Grouped export data must match the configured parent/group hierarchy.

## Examples

- [Basic browser flow](./packages/core/examples/basic-browser.html)
- [Manual WASM browser flow](./packages/core/examples/manual-wasm-browser.html)
- [Grouped export flow](./packages/core/examples/grouped-export.html)
- [Direct WASM browser flow](./packages/wasm/examples/direct-browser.html)

## Release preparation

- `0.1.0` is the prepared stable release line and publishes to npm `latest`.
- Verify packed artifacts before publishing:

```bash
corepack pnpm --filter @senlinz/import-export-wasm build
corepack pnpm --filter @senlinz/import-export build
mkdir -p /tmp/import-export-release
corepack pnpm --dir packages/wasm pack --pack-destination /tmp/import-export-release
corepack pnpm --dir packages/core pack --pack-destination /tmp/import-export-release
```

## Development

```bash
corepack pnpm install --frozen-lockfile
cargo test --manifest-path packages/wasm/Cargo.toml --lib
corepack pnpm --filter @senlinz/import-export-wasm build
corepack pnpm --filter @senlinz/import-export build
corepack pnpm --filter @senlinz/import-export test
```

## License

MIT
