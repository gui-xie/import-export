# Future Work Checklist

## Documentation and API clarity
- [x] Update `/README.md` with current package positioning, install steps, and quick start guidance
- [x] Expand `/packages/core/README.md` to document `ExcelDefinition`, import/export flows, and supported options
- [x] Expand `/packages/wasm/README.md` to document direct WASM usage and initialization
- [x] Promote representative test/demo scenarios into official examples

## Public API stabilization
- [x] Review `/packages/core/src/ExcelDefinition.ts` and define the stable supported schema
- [x] Standardize accepted `dataType` values and related behaviors
- [x] Decide which advanced features are officially supported for release
- [x] Document browser/runtime support and known limitations

## Code hardening
- [x] Validate malformed definitions such as duplicate keys, invalid groups, and unsupported field values
- [x] Improve user-facing import/export error messages for common failure modes
- [x] Review null/undefined handling across import and export flows
- [x] Review number and date parsing consistency

## Test expansion
- [x] Expand `/packages/wasm/src/tests/mod.rs` to cover invalid schemas and workbook edge cases
- [x] Expand `/packages/core/tests/import-export.spec.ts` to cover browser-side error and round-trip flows
- [x] Ensure documented examples are backed by automated tests

## CI and release automation
- [x] Add CI coverage for build and test execution on pushes and pull requests
- [x] Keep the publish workflow focused on release publishing only

## Release preparation
- [x] Review prerelease state in `/.changeset/pre.json`
- [x] Decide whether the next release should be stable or one final prerelease
- [x] Prepare release notes and verify installability from packed tarballs
- [ ] Publish the coordinated package release when blockers are complete
