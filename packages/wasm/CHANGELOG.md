# @senlinz/import-export-wasm

## 1.1.0

### Minor Changes

- Return structured JavaScript errors with stable `code` and `params` fields for known WASM failures, leaving localization to callers and the core package.

## 1.0.2

### Patch Changes

- 59924a8: Fix the bundled WASM async initialization flow for the first browser workbook operation and publish the coordinated patch release.

## 1.0.1

### Patch Changes

- Republish the coordinated workspace patch release at `1.0.1` so the WASM package stays aligned with `@senlinz/import-export`.
- Include the bundled WASM initialization fix in the patch release notes.

## 1.0.0

### Major Changes

- Republish the coordinated workspace release at `1.0.0` so the WASM package stays aligned with `@senlinz/import-export`.

## 0.1.2

### Patch Changes

- bc02e5d: Republish the coordinated workspace release at `0.1.2` so the WASM package stays aligned with `@senlinz/import-export`.

## 0.1.1

### Patch Changes

- Add schema-less workbook import support through `importDynamicData`, returning detected headers and row records without requiring a predefined schema.
- Support optional sheet selection and configurable header row resolution for dynamic imports, including fallback to the first matching worksheet/header row.
