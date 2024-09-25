# @senlinz/import-export-wasm
**@senlinz/import-export-wasm** is the Rust WebAssembly core library for the **@senlinz/import-export** library. It provides the core logic for handling Excel data in browser environments.

> **Note:** This library is currently in beta. Features and APIs may change.

## Features
- Rust WebAssembly core for efficient Excel data handling.
- Read using [calamine](https://docs.rs/calamine/).
- Write using [rust_xlsxwriter](https://docs.rs/rust_xlsxwriter/).

## Usage
```html 
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Demo (@senlin/import-export-wasm)</title>
</head>


<body>
    <button id="downloadTemplate">Download Template</button>
    <button id="exportWithData">Export With Data</button>
    <button id="importWithData">Import With Data</button>
    <a id="download" style="display: none"></a>
    <input type="file" accept=".xlsx" id="file" style="display: none">

    <script type="module">
        import initAsync, { createTemplate, exportData, importData, ExcelInfo, ExcelColumnInfo, ExcelData, ExcelRowData, ExcelColumnData } from 'https://cdn.jsdelivr.net/npm/@senlinz/import-export-wasm/pkg/imexport_wasm.js';
        await initAsync({ path: 'https://cdn.jsdelivr.net/npm/@senlinz/import-export-wasm/pkg/imexport_wasm_bg.wasm' });
        
        const downloadEl = document.getElementById('download');
        const fileEl = document.getElementById('file');

        fileEl.addEventListener('change', fileChange);
        document.getElementById('downloadTemplate').addEventListener('click', downloadTemplate);
        document.getElementById('exportWithData').addEventListener('click', exportWithData);
        document.getElementById('importWithData').addEventListener('click', importWithData);

        const res = await fetch('https://cdn.jsdelivr.net/npm/@senlinz/import-export-wasm/pkg/imexport_wasm_bg.wasm');
        const bytes = await res.arrayBuffer();

        function downloadTemplate() {
            const info = getExcelInfo();
            download(info.name, createTemplate(info));
        }

        function exportWithData() {
            const info = getExcelInfo();
            const data = new ExcelData([
                new ExcelRowData([
                    new ExcelColumnData("name", "Tom"),
                    new ExcelColumnData("age", "12"),
                    new ExcelColumnData("category", "Cat")
                ]),
                new ExcelRowData([
                    new ExcelColumnData("name", "Jerry"),
                    new ExcelColumnData("age", "10"),
                    new ExcelColumnData("category", "Mouse")
                ])
            ]);
            download(info.name, exportData(info, data));
        }

        function importWithData() {
            fileEl.click();
        }

        function fileChange(e) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const info = getExcelInfo();
                const excelData = importData(info, data);
                console.log(toJson(excelData));
            };
            reader.readAsArrayBuffer(file);
        }

        function download(name, excelData) {
            const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            downloadEl.download = `${name}.xlsx`;
            downloadEl.href = url;
            downloadEl.click();
            URL.revokeObjectURL(url);
        }

        function getExcelInfo() {
            const excelName = "TomAndJerry";
            const columns = [
                new ExcelColumnInfo("name", "Name", 20),
                new ExcelColumnInfo("age", "Age"),
                new ExcelColumnInfo("category", "Category")
            ];
            const info = new ExcelInfo(excelName, "sheet1", columns);
            return info;
        }

        function toJson(excelData) {
            const data = [];
            const info = getExcelInfo();
            for (let i = 0; i < excelData.rows.length; i++) {
                const item = {};
                let row = excelData.rows[i];
                for (let j = 0; j < row.columns.length; j++) {
                    let column = row.columns[j];
                    item[column.key] = column.value;
                }
                data.push(item);
            }
            return data;
        }
    </script>
</body>

</html>
```