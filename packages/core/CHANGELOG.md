# @senlinz/import-export

## 1.1.0

### Minor Changes

- Add localized core error messages with built-in English and Chinese output, stable error codes and params, and per-call custom message overrides.
- Consume structured WASM errors through stable `code` and `params` fields while retaining compatibility with earlier string-encoded WASM errors.

### Patch Changes

- 59924a8: Fix the bundled WASM async initialization flow for the first browser workbook operation and publish the coordinated patch release.
- Updated dependencies [59924a8]
  - @senlinz/import-export-wasm@1.0.2

## 1.0.1

### Patch Changes

- Fix the bundled WASM async initialization flow so browser-first workbook operations initialize correctly on first use.
- Keep the core and WASM package release versions aligned for the coordinated patch release.

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
