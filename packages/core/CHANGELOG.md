# @senlinz/import-export

## 1.0.0

### Major Changes

- Remove the user-facing `initializeWasm`, `bundledWasmSource`, and related manual WASM initialization entry points from the core package.
- Standardize the core package on automatic asynchronous loading of the emitted bundled WASM asset.
- Update the browser docs and examples to describe the single auto-loading flow.
- Updated dependencies
  - @senlinz/import-export-wasm@1.0.0

## 0.1.2

### Patch Changes

- bc02e5d: Add `maxFileSizeBytes` limits for browser picker imports and escape formula-like text values by default during export/template generation.
- Updated dependencies [bc02e5d]
  - @senlinz/import-export-wasm@0.1.2

## 0.1.1

### Patch Changes

- Add schema-less dynamic import APIs: `fromExcelDynamic(buffer, options?)` for caller-provided workbook bytes and `importExcelDynamic(options?)` for browser file uploads.
- Return `{ sheetName, headers, rows }` from dynamic imports so workbooks can be read without defining `columns` ahead of time.
- Support optional sheet selection and configurable header row handling for dynamic imports.
- Updated dependencies
  - @senlinz/import-export-wasm@0.1.1

## 0.1.0

First stable release of the browser-first Excel import/export package.

### Highlights

- Stabilized the public browser API for template generation, import, and export.
- Standardized `columns[].dataType` on `text`, `number`, `date`, and `image`; `string` is no longer accepted as a text alias.
- Added stronger schema validation and clearer runtime errors for malformed definitions, grouped data, numbers, and dates.
