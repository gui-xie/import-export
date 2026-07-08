import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const downloadPath = path.join(__dirname, 'test-download');

test.describe('import-export core', () => {
  test.afterEach(() => {
    fs.rmSync(downloadPath, { recursive: true, force: true });
  });

  test('can retry import after a failed import', async ({ page }) => {
    await page.goto('/examples/basic-browser.html');
    await page.waitForFunction(() => document.body.dataset.ready === 'true');
    fs.mkdirSync(downloadPath, { recursive: true });
    const validFilePath = path.join(downloadPath, 'TomAndJerry.xlsx');
    const invalidFilePath = path.resolve(__dirname, '../../wasm/src/tests/snapshots/imexport_wasm__tests__tests__export_pokemon_success.snap.xlsx');

    const [download] = await Promise.all([page.waitForEvent('download'), page.click('#btnExport')]);
    await download.saveAs(validFilePath);

    const [invalidChooser] = await Promise.all([page.waitForEvent('filechooser'), page.click('#btnImport')]);
    await invalidChooser.setFiles(invalidFilePath);
    await expect(page.locator('#importError')).toContainText('Header mismatch');

    const [validChooser] = await Promise.all([page.waitForEvent('filechooser'), page.click('#btnImport')]);
    await validChooser.setFiles(validFilePath);
    await expect(page.locator('#importOutput')).toHaveText(
      '[{"name":"Tom","age":12,"birthday":"2024-11-01 00:00:00","category":"Cat","image":""},{"name":"Jerry","age":null,"birthday":null,"category":"Mouse","image":""}]',
    );
    await expect(page.locator('#importError')).toHaveText('');
  });

  test('reports cancelled browser imports and allows retry', async ({ page }) => {
    await page.goto('/examples/basic-browser.html');
    await page.waitForFunction(() => document.body.dataset.ready === 'true');
    fs.mkdirSync(downloadPath, { recursive: true });
    const validFilePath = path.join(downloadPath, 'TomAndJerry.xlsx');

    const [download] = await Promise.all([page.waitForEvent('download'), page.click('#btnExport')]);
    await download.saveAs(validFilePath);

    const [cancelChooser] = await Promise.all([page.waitForEvent('filechooser'), page.click('#btnImport')]);
    await cancelChooser.setFiles([]);
    await expect(page.locator('#importError')).toHaveText('File selection cancelled.');
    await expect(page.locator('#importOutput')).toHaveText('');

    const [validChooser] = await Promise.all([page.waitForEvent('filechooser'), page.click('#btnImport')]);
    await validChooser.setFiles(validFilePath);
    await expect(page.locator('#importOutput')).toHaveText(
      '[{"name":"Tom","age":12,"birthday":"2024-11-01 00:00:00","category":"Cat","image":""},{"name":"Jerry","age":null,"birthday":null,"category":"Mouse","image":""}]',
    );
    await expect(page.locator('#importError')).toHaveText('');
  });

  test('validates malformed definitions in the browser API', async ({ page }) => {
    await page.goto('/examples/definition-errors.html');

    await page.click('#btnExport');
    await expect(page.locator('#errorOutput')).toContainText("Invalid dataType 'unsupported'");

    const duplicateKeyError = await page.evaluate(async () => {
      const { toExcel } = await import('../dist/index.js');
      try {
        await toExcel(
          {
            name: 'DuplicateKeys',
            columns: [
              { key: 'name', name: 'Name', dataType: 'text' },
              { key: 'name', name: 'Alias', dataType: 'text' },
            ],
          },
          [{ name: 'Tom' }],
        );
        return '';
      } catch (error) {
        return error instanceof Error ? error.message : String(error);
      }
    });

    expect(duplicateKeyError).toContain("Duplicate column key 'name'");

    const stringAliasError = await page.evaluate(async () => {
      const { toExcel } = await import('../dist/index.js');
      try {
        await toExcel(
          {
            name: 'StringAlias',
            columns: [{ key: 'name', name: 'Name', dataType: 'string' }],
          },
          [{ name: 'Tom' }],
        );
        return '';
      } catch (error) {
        return error instanceof Error ? error.message : String(error);
      }
    });

    expect(stringAliasError).toContain("Invalid dataType 'string'");
  });

  test('exports the grouped example without browser-side errors', async ({ page }) => {
    await page.goto('/examples/grouped-export.html');
    fs.mkdirSync(downloadPath, { recursive: true });
    const filePath = path.join(downloadPath, 'Pokemon.xlsx');

    const [download] = await Promise.all([page.waitForEvent('download'), page.click('#btnExport')]);
    await download.saveAs(filePath);

    expect(fs.existsSync(filePath)).toBeTruthy();
    await expect(page.locator('#exportError')).toHaveText('');
  });

  test('supports dynamic import without a predefined schema', async ({ page }) => {
    await page.goto('/examples/basic-browser.html');

    const result = await page.evaluate(async () => {
      const mod = await import('../dist/index.js');
      const workbook = await mod.toExcel(
        {
          name: 'DynamicImport',
          columns: [
            { key: 'name', name: 'Name', dataType: 'text' },
            { key: 'age', name: 'Age', dataType: 'number' },
            { key: 'category', name: 'Category', dataType: 'text' },
          ],
        },
        [
          { name: 'Tom', age: 12, category: 'Cat' },
          { name: 'Jerry', age: null, category: 'Mouse' },
        ],
      );

      return mod.fromExcelDynamic(workbook);
    });

    expect(result).toEqual({
      sheetName: 'sheet1',
      headers: ['Name', 'Age', 'Category'],
      rows: [
        { Name: 'Tom', Age: '12', Category: 'Cat' },
        { Name: 'Jerry', Age: '', Category: 'Mouse' },
      ],
    });
  });

  test('supports browser-based dynamic import without a predefined schema', async ({ page }) => {
    await page.goto('/examples/basic-browser.html');
    fs.mkdirSync(downloadPath, { recursive: true });
    const filePath = path.join(downloadPath, 'DynamicImportUpload.xlsx');

    const [download] = await Promise.all([page.waitForEvent('download'), page.click('#btnExport')]);
    await download.saveAs(filePath);

    const [chooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.evaluate(async () => {
        const mod = await import('../dist/index.js');
        (window as typeof window & { dynamicImportPromise?: Promise<unknown> }).dynamicImportPromise = mod.importExcelDynamic({
          sheetName: 'sheet1',
          headerRow: 1,
        });
      }),
    ]);
    await chooser.setFiles(filePath);

    const result = await page.evaluate(async () => {
      const promise = (window as typeof window & { dynamicImportPromise?: Promise<unknown> }).dynamicImportPromise;
      if (!promise) {
        throw new Error('Dynamic import promise was not created.');
      }
      return promise;
    });

    expect(result).toEqual({
      sheetName: 'sheet1',
      headers: ['Name', 'Age', 'Birthday', 'Category', 'Image'],
      rows: [
        { Name: 'Tom', Age: '12', Birthday: '2024-11-01 00:00:00', Category: 'Cat', Image: '' },
        { Name: 'Jerry', Age: '', Birthday: '', Category: 'Mouse', Image: '' },
      ],
    });
  });

  test('keeps the browser API stable while hiding internal WASM initialization details', async ({ page }) => {
    await page.goto('/examples/basic-browser.html');

    const result = await page.evaluate(async () => {
      const mod = await import('../dist/index.js');
      const exportNames = ['importExcel', 'importExcelDynamic', 'exportExcel', 'fromExcel', 'fromExcelDynamic', 'toExcel', 'downloadExcelTemplate', 'generateExcelTemplate'];
      const template = await mod.generateExcelTemplate({
        name: 'CompatibilityCheck',
        columns: [{ key: 'name', name: 'Name', dataType: 'text' }],
      });

      return {
        exportPresence: exportNames.map(name => [name, typeof mod[name as keyof typeof mod] !== 'undefined']),
        removedExports: [
          typeof mod.initializeWasm === 'undefined',
          typeof mod.bundledWasmSource === 'undefined',
          typeof mod.ensureWasmInitialized === 'undefined',
          typeof mod.configureWasm === 'undefined',
          typeof mod.configureViteWasm === 'undefined',
        ],
        templateHeader: Array.from(template.slice(0, 4)),
        templateLength: template.length,
      };
    });

    expect(result.exportPresence).toEqual([
      ['importExcel', true],
      ['importExcelDynamic', true],
      ['exportExcel', true],
      ['fromExcel', true],
      ['fromExcelDynamic', true],
      ['toExcel', true],
      ['downloadExcelTemplate', true],
      ['generateExcelTemplate', true],
    ]);
    expect(result.removedExports).toEqual([true, true, true, true, true]);
    expect(result.templateHeader).toEqual([80, 75, 3, 4]);
    expect(result.templateLength).toBeGreaterThan(0);
  });

  test('initializes when synchronous WebAssembly compilation is blocked on the main thread', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(WebAssembly, 'Module', {
        configurable: true,
        value: function BlockedWebAssemblyModule() {
          throw new Error('WebAssembly Compile is not allowed in the main thread.');
        },
      });
      Object.defineProperty(WebAssembly, 'compile', {
        configurable: true,
        value: () => Promise.reject(new Error('WebAssembly.compile is not allowed in the main thread.')),
      });
    });

    await page.goto('/examples/basic-browser.html');
    await page.waitForFunction(() => document.body.dataset.ready === 'true');

    const result = await page.evaluate(async () => {
      const mod = await import('../dist/index.js');
      const template = await mod.generateExcelTemplate({
        name: 'NoSyncCompile',
        columns: [{ key: 'name', name: 'Name', dataType: 'text' }],
      });

      return {
        templateHeader: Array.from(template.slice(0, 4)),
        templateLength: template.length,
      };
    });

    expect(result.templateHeader).toEqual([80, 75, 3, 4]);
    expect(result.templateLength).toBeGreaterThan(0);
  });
});
