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

## 稳定支持的 Schema

- `columns[].dataType` 仅支持 `text`、`number`、`date`、`image`；请直接使用 `text`，不再支持 `string`。
- 父级表头必须先于子级表头声明。
- `dataGroup` 和 `dataGroupParent` 是当前稳定支持的分组导出能力。
- 图片导出需要提供 `imageFetcher`。

## 浏览器 / 运行时支持

- 主要面向浏览器 ESM 运行时。
- 依赖的浏览器 API：`Blob`、`FileReader`、`URL.createObjectURL`、`atob`。
- 当运行时提供兼容的浏览器全局对象时，也可以在非 DOM 环境下使用 `fromExcel`、`toExcel`、`generateExcelTemplate`。

## 已知限制

- 导入时会严格按照配置的列名和顺序校验表头。
- `date` 类型导入结果会返回 `YYYY-MM-DD HH:mm:ss` 格式的字符串。
- 空的 `number` / `date` 单元格在导入后会被规范化为 `null`。
- 分组导出数据必须与配置的父子层级保持一致。

## 示例

- [基础浏览器流程](./packages/core/examples/basic-browser.html)
- [分组导出流程](./packages/core/examples/grouped-export.html)
- [直接使用 WASM 的浏览器流程](./packages/wasm/examples/direct-browser.html)

## 发布准备

- `0.1.0` 已作为稳定版本发布线准备完成，发布到 npm 时应使用 `latest` 标签。
- 发布前请先验证打包产物：

```bash
corepack pnpm --filter @senlinz/import-export-wasm build
corepack pnpm --filter @senlinz/import-export build
mkdir -p /tmp/import-export-release
corepack pnpm --dir packages/wasm pack --pack-destination /tmp/import-export-release
corepack pnpm --dir packages/core pack --pack-destination /tmp/import-export-release
```

## 开发

```bash
corepack pnpm install --frozen-lockfile
cargo test --manifest-path packages/wasm/Cargo.toml --lib
corepack pnpm --filter @senlinz/import-export-wasm build
corepack pnpm --filter @senlinz/import-export build
corepack pnpm --filter @senlinz/import-export test
```

## 许可证

MIT
