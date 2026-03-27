# Future Work Checklist

## Documentation and API clarity
- [ ] Update `/README.md` with current package positioning, install steps, and quick start guidance
- [ ] Expand `/packages/core/README.md` to document `ExcelDefinition`, import/export flows, and supported options
- [ ] Expand `/packages/wasm/README.md` to document direct WASM usage and initialization
- [ ] Promote representative test/demo scenarios into official examples

## Public API stabilization
- [ ] Review `/packages/core/src/ExcelDefinition.ts` and define the stable supported schema
- [ ] Standardize accepted `dataType` values and related behaviors
- [ ] Decide which advanced features are officially supported for release
- [ ] Document browser/runtime support and known limitations

## Code hardening
- [ ] Validate malformed definitions such as duplicate keys, invalid groups, and unsupported field values
- [ ] Improve user-facing import/export error messages for common failure modes
- [ ] Review null/undefined handling across import and export flows
- [ ] Review number and date parsing consistency

## Test expansion
- [ ] Expand `/packages/wasm/src/tests/mod.rs` to cover invalid schemas and workbook edge cases
- [ ] Expand `/packages/core/tests/import-export.spec.ts` to cover browser-side error and round-trip flows
- [ ] Ensure documented examples are backed by automated tests

## CI and release automation
- [ ] Add CI coverage for build and test execution on pushes and pull requests
- [ ] Keep the publish workflow focused on release publishing only

## Release preparation
- [ ] Review prerelease state in `/.changeset/pre.json`
- [ ] Decide whether the next release should be stable or one final prerelease
- [ ] Prepare release notes and verify installability from packed tarballs
- [ ] Publish the coordinated package release when blockers are complete
