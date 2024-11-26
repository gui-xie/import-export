# @senlinz/import-export
example for import and export excel file

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IMPORT-EXPORT-TEST</title>
</head>
<button id="btnImport">Import</button>
<button id="btnExport">Export</button>
<button id="btnDownloadTemplate">Download Template</button>
<div id="importOutput"></div>

<body>
  <script type="module">
    import { getUtils } from 'https://cdn.jsdelivr.net/npm/@senlinz/import-export@0.1.0-beta.7/+esm';
    const {
      importExcel,
      exportExcel,
      downloadExcelTemplate
    } = getUtils();

    const excelInfo = {
      name: 'TomAndJerry',
      sheetName: 'sheet1',
      columns: [
        { key: 'name', name: 'Name', dataType: 0, width: 20, note: 'required' },
        { key: 'age', name: 'Age', dataType: 1, width: 10 },
        { key: 'category', name: 'Category', dataType: 0, allowedValues: ['Cat', 'Mouse'] }
      ],
      author: 'senlinz',
      createTime: '2024-11-01T09:00:00'
    };

    btnImport.addEventListener('click', importClick);
    btnExport.addEventListener('click', exportClick);
    btnDownloadTemplate.addEventListener('click', downloadTemplateClick);

    function exportClick() {
      exportExcel(excelInfo, [
        { name: 'Tom', age: 12, category: 'Cat' },
        { name: 'Jerry', age: 13, category: 'Mouse' }
      ]);
    }

    function importClick() {
      importExcel(excelInfo).then(data => {
        importOutput.innerText = JSON.stringify(data, null);
      });
    }

    function downloadTemplateClick() {
      downloadExcelTemplate(excelInfo);
    }
  </script>
</body>

</html>
```