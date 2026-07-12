# import-export

基于 Rust 和 WebAssembly 的浏览器优先 Excel 导入导出库。

[English](./README.md)

## 包列表

- [`@senlinz/import-export`](./packages/core/README.zh.md)：面向浏览器的高阶 API，提供模板生成、导入和导出。
- [`@senlinz/import-export-wasm`](./packages/wasm/README.zh.md)：更底层的 WASM 包，直接暴露工作簿能力。

## 安装

```bash
pnpm add @senlinz/import-export
```

如果你希望直接使用 WASM 能力：

```bash
pnpm add @senlinz/import-export-wasm
```

## 快速开始

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

## WASM 加载

- `@senlinz/import-export` 会在首次调用时自动异步加载并初始化内置 WASM 资源。
- 在 Vite 和其他浏览器 ESM bundler 中，core 包不再需要单独的 `initializeWasm(...)` 或 `?url` 接线。
- 如果你需要直接控制底层 WASM，请改用 `@senlinz/import-export-wasm`，而不是高阶封装。

## 错误处理

- `@senlinz/import-export` 会把已知的校验、导入、导出和 WASM 初始化失败包装为 `ImportExportError` 子类。
- 错误对象包含稳定的 `code`、结构化 `params`、规范化后的 `locale` 和原始 `cause`。
- 错误消息默认是英文。在 `ExcelDefinition` 或动态导入选项中设置 `locale: 'zh'` 或 `locale: 'zh-CN'` 后，会使用内置中文消息。
- 可以通过 `errorMessages` 或 `messages` 按稳定错误码覆盖消息。
- 直接使用 `@senlinz/import-export-wasm` 时，已知失败会抛出带稳定 `code` 和 `params` 的 JavaScript `Error`；用户可在应用层本地化，也可使用 core 包。

## 稳定支持的 Schema

- `columns[].dataType` 仅支持 `text`、`number`、`date`、`image`。
- 父级表头必须先于子级表头声明。
- `dataGroup` 和 `dataGroupParent` 是当前稳定支持的分组导出能力。
- 图片导出需要提供 `imageFetcher`。

## 浏览器 / 运行时支持

- 主要面向浏览器 ESM 运行时。
- 依赖的浏览器 API：`Blob`、`FileReader`、`URL.createObjectURL`、`fetch`。
- 当运行时提供兼容的浏览器全局对象时，也可以在非 DOM 环境下使用 `fromExcel`、`fromExcelDynamic`、`toExcel`、`generateExcelTemplate`。
- `importExcelDynamic` 提供与 `fromExcelDynamic` 对应的浏览器文件选择导入能力。
- core 包会在内部负责 WASM 加载，并在首次使用时异步初始化内置资源。

## 已知限制

- 导入时会严格按照配置的列名和顺序校验表头。
- 无 schema 导入时，可使用 `importExcelDynamic(...)`（浏览器上传）或 `fromExcelDynamic(...)`（已有字节数据）。
- `date` 类型导入结果会返回 `YYYY-MM-DD HH:mm:ss` 格式的字符串。
- 空的 `number` / `date` 单元格在导入后会被规范化为 `null`。
- 分组导出数据必须与配置的父子层级保持一致。

## 示例

- [基础浏览器流程](./packages/core/examples/basic-browser.html)
- [分组导出流程](./packages/core/examples/grouped-export.html)
- [直接使用 WASM 的浏览器流程](./packages/wasm/examples/direct-browser.html)

## 发布准备

- 当前包版本：`1.1.0`。
- `1.1.0` 新增 core 错误消息多语言、稳定错误码和结构化参数、单次调用级别的自定义消息覆盖，并能消费结构化 WASM 错误，同时兼容早期字符串形式的 WASM 错误。
- 协同版本发布前，先执行：

```bash
corepack pnpm changeset
corepack pnpm run release:version
corepack pnpm run release:check
```

- 然后在 GitHub Actions 的 **Publish packages** 工作流里手动发布，并填写：
  - `confirm=publish`
  - `version=1.1.0`

## 开发

```bash
corepack pnpm install --frozen-lockfile
cargo test --manifest-path packages/wasm/Cargo.toml --lib
cargo bench --manifest-path packages/wasm/Cargo.toml --features benchmarks
corepack pnpm --filter @senlinz/import-export-wasm build
corepack pnpm --filter @senlinz/import-export build
corepack pnpm --filter @senlinz/import-export test
```

## 许可证

MIT
