# Contributing to import-export

Thank you for your interest in contributing! This guide covers everything you need to set up the development environment, build the project, run tests, and submit changes.

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| [Node.js](https://nodejs.org/) | ≥ 16 | Required for the TypeScript core package |
| [pnpm](https://pnpm.io/) | 9.x | Package manager — the repo pins `pnpm@9.15.9` via `packageManager` in `package.json` |
| [Rust toolchain](https://rustup.rs/) | ≥ 1.88 (MSRV) | Install via `rustup`. The minimum supported Rust version is declared in `Cargo.toml` |
| [wasm-pack](https://rustwasm.github.io/wasm-pack/) | Latest | Builds the Rust crate into a WebAssembly package |

After cloning the repository, install Node.js dependencies from the repo root:

```bash
pnpm install
```

This also sets up the Husky pre-commit hooks automatically via the `prepare` script.

## Repository Structure

The project is a pnpm workspace with two packages:

```
packages/
  core/    → @senlinz/import-export     (TypeScript wrapper)
  wasm/    → @senlinz/import-export-wasm (Rust/WASM bindings)
```

The core package depends on the WASM package, so the WASM package must be built first.

## Building

Build the WASM package first, then the core package:

```bash
# 1. Build the WASM package (Rust → WebAssembly)
pnpm --filter @senlinz/import-export-wasm build

# 2. Build the core package (TypeScript → JS bundle)
pnpm --filter @senlinz/import-export build
```

Or build both in sequence:

```bash
pnpm run release:build
```

## Running Tests

### Rust Unit Tests

```bash
cargo test --manifest-path packages/wasm/Cargo.toml --lib
```

### Core Unit Tests (Jest)

Requires the core package to be built first:

```bash
npx jest --config packages/core/jest.config.mjs
```

### Browser / E2E Tests (Playwright)

```bash
# Core browser tests
pnpm --filter @senlinz/import-export test

# WASM browser tests
pnpm --filter @senlinz/import-export-wasm e2e-test
```

Make sure Playwright browsers are installed (`npx playwright install`) before running browser tests for the first time.

### Rust Benchmarks

```bash
cargo bench --manifest-path packages/wasm/Cargo.toml --features benchmarks
```

## Pre-Commit Hooks

The repository uses [Husky](https://typicode.github.io/husky/) with [lint-staged](https://github.com/lint-staged/lint-staged) to enforce code quality on every commit:

- **Rust formatting** — `cargo fmt --check` runs on the WASM crate
- **TypeScript/JavaScript formatting** — `prettier --check` runs on staged `.ts`, `.js`, and `.mjs` files

If a check fails, the commit is blocked. Fix the formatting issues and try again:

```bash
# Fix Rust formatting
cargo fmt --manifest-path packages/wasm/Cargo.toml

# Fix JS/TS formatting (if prettier is available globally or via npx)
npx prettier --write <file>
```

## Changeset Workflow

This project uses [@changesets/cli](https://github.com/changesets/changesets) for versioning and release management.

### When to Create a Changeset

Any pull request that changes user-facing behavior, fixes a bug, or updates a public API should include a changeset. Documentation-only or CI-only changes typically do not need one.

### Creating a Changeset

```bash
pnpm changeset
```

This interactive command asks you to:

1. Select which packages are affected (`@senlinz/import-export`, `@senlinz/import-export-wasm`, or both)
2. Choose the semver bump type (patch, minor, or major) for each package
3. Write a short summary of the change

A markdown file is created in the `.changeset/` directory. Commit this file along with your code changes.

### Versioning and Publishing

Maintainers run the following to apply changesets and bump versions:

```bash
pnpm changeset version
```

This consumes all pending changeset files, updates `package.json` versions, and appends to `CHANGELOG.md` in each affected package.

## Dependency Pinning Strategy

### Rust (Cargo)

Cargo dependencies use **caret ranges** (e.g., `"0.8"`, `"0.2"`) in `Cargo.toml`. This allows compatible updates within the specified major version.

Exact reproducibility is guaranteed by tracking `Cargo.lock` in version control. The lock file pins every transitive dependency to a specific version, so all contributors and CI builds resolve identical dependency trees.

**Rationale:** Caret ranges let Dependabot propose version bumps via pull requests without requiring manual `Cargo.toml` edits for every patch release. The committed `Cargo.lock` ensures that builds are deterministic regardless of when dependencies are resolved. This gives us the best of both worlds — automated update proposals and reproducible builds.

When adding a new Rust dependency, use a caret range:

```toml
# Good
some-crate = "1.5"

# Avoid exact pins in Cargo.toml — let Cargo.lock handle exactness
# some-crate = "=1.5.3"
```

### Node.js (pnpm)

Node.js dependencies use caret ranges (e.g., `^2.27.9`) in `package.json`, with `pnpm-lock.yaml` tracked in version control for exact reproducibility.

## Submitting Changes

1. Fork the repository and create a feature branch from `main`
2. Make your changes and add tests where appropriate
3. Run the full test suite to verify nothing is broken
4. Create a changeset if your change affects package behavior (`pnpm changeset`)
5. Open a pull request against `main`

The CI pipeline will automatically run security audits, MSRV verification, and the full test suite on your pull request.
