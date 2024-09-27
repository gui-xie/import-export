# @senlinz/import-export

**@senlinz/import-export** is a simple Excel import/export library designed for use in browser environments. It leverages Rust compiled to WebAssembly (WASM) for its core logic and provides a web component built with Stencil.

> **Note:** This library is currently in beta. Features and APIs may change.

## Features
- Import and export Excel files in browser environments.
- Rust WebAssembly core for efficient Excel data handling.
- Built with Rust's [calamine](https://docs.rs/calamine/) and [rust_xlsxwriter](https://docs.rs/rust_xlsxwriter/) libraries for efficient handling of Excel data.
- Web component generation using [Stencil.js](https://stenciljs.com/).
- Ready-to-use Vue wrapper, with React and Angular support coming soon.

## Packages
- **@senlinz/import-export**: The Stencil web component with the Rust WebAssembly core.
- **[@senlinz/import-export-wasm](./packages/wasm/README.md)**: The Rust WebAssembly core library.
- **@senlinz/import-export-vue**: The Vue wrapper for the Stencil web component.

## License
This project is licensed under the [MIT](https://opensource.org/license/MIT) License.
