# Import/Export Safety Specification

## Goals
- Prevent unbounded browser uploads from exhausting memory during import.
- Block Excel formula injection for exported text values by default while allowing an explicit opt-out.

## Scope
- Browser-based imports triggered by `importExcel` and `importExcelDynamic`.
- Text cell serialization during export and template generation.
- Does **not** change schema-less byte APIs (`fromExcel`, `fromExcelDynamic`, `toExcel`, `generateExcelTemplate`) beyond the shared serialization rules.

## API Changes
- `ExcelDefinition.maxFileSizeBytes?: number`  
  - Positive finite byte limit applied to browser uploads.  
  - Default: `25 * 1024 * 1024` (≈25 MiB).  
  - Validation rejects non-numeric or non-positive values.
- `DynamicExcelImportOptions.maxFileSizeBytes?: number`  
  - Same validation and default as above for dynamic browser uploads.
- `ExcelDefinition.escapeFormulas?: boolean`  
  - Default `true`. When enabled, text values starting with `=`, `+`, `-`, `@`, tab, carriage return, or newline are prefixed with `'` before export to neutralize formulas.  
  - Set `false` to deliberately allow formula cells.

## Behavior
- Upload flow
  - File size is checked before `FileReader` loads bytes. Oversized files reject with a limit-specific error and clean up the hidden input.
  - Limits apply only to browser upload helpers; callers passing raw `Uint8Array` remain responsible for size management.
- Export flow
  - Text cell serialization uses the `escapeFormulas` flag; number/date/image columns are unaffected.
  - Grouped export values share the same escaping rules.

## Validation & Testing
- Unit tests cover:
  - Defaulting and validation for `maxFileSizeBytes` and `escapeFormulas`.
  - Dynamic import option normalization with custom limits.
  - Formula-like text escaping with opt-out.
- Build/tests: `pnpm -C packages/core build`, `pnpm -C packages/core test:unit`, `pnpm -C packages/wasm cargo-test`.

## Non-goals
- Streaming uploads/exports.
- Server-side validation or content scanning.
- Changing WASM schema validation or adding new data types.
