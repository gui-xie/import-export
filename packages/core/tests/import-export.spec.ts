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
    fs.mkdirSync(downloadPath, { recursive: true });
    const validFilePath = path.join(downloadPath, 'TomAndJerry.xlsx');
    const invalidFilePath = path.resolve(
      __dirname,
      '../../wasm/src/tests/snapshots/imexport_wasm__tests__tests__export_pokemon_success.snap.xlsx'
    );

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('#btnExport')
    ]);
    await download.saveAs(validFilePath);

    const [invalidChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.click('#btnImport')
    ]);
    await invalidChooser.setFiles(invalidFilePath);
    await expect(page.locator('#importError')).toContainText('Header mismatch');

    const [validChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.click('#btnImport')
    ]);
    await validChooser.setFiles(validFilePath);
    await expect(page.locator('#importOutput')).toHaveText(
      '[{"name":"Tom","age":12,"birthday":"2024-11-01 00:00:00","category":"Cat","image":""},{"name":"Jerry","age":null,"birthday":null,"category":"Mouse","image":""}]'
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
        await toExcel({
          name: 'DuplicateKeys',
          columns: [
            { key: 'name', name: 'Name', dataType: 'text' },
            { key: 'name', name: 'Alias', dataType: 'text' }
          ]
        }, [{ name: 'Tom' }]);
        return '';
      } catch (error) {
        return error instanceof Error ? error.message : String(error);
      }
    });

    expect(duplicateKeyError).toContain("Duplicate column key 'name'");

    const stringAliasError = await page.evaluate(async () => {
      const { toExcel } = await import('../dist/index.js');
      try {
        await toExcel({
          name: 'StringAlias',
          columns: [
            { key: 'name', name: 'Name', dataType: 'string' }
          ]
        }, [{ name: 'Tom' }]);
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

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('#btnExport')
    ]);
    await download.saveAs(filePath);

    expect(fs.existsSync(filePath)).toBeTruthy();
    await expect(page.locator('#exportError')).toHaveText('');
  });

  test('supports manual WASM initialization before using the browser API', async ({ page }) => {
    await page.goto('/examples/manual-wasm-browser.html');
    await page.waitForFunction(() => document.body.dataset.ready === 'true');
    await expect(page.locator('#statusOutput')).toHaveText('Manual WASM initialization completed.');

    fs.mkdirSync(downloadPath, { recursive: true });
    const validFilePath = path.join(downloadPath, 'TomAndJerry-manual.xlsx');

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('#btnExport')
    ]);
    await download.saveAs(validFilePath);

    const [chooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.click('#btnImport')
    ]);
    await chooser.setFiles(validFilePath);

    await expect(page.locator('#importOutput')).toHaveText(
      '[{"name":"Tom","age":12,"birthday":"2024-11-01 00:00:00","category":"Cat","image":""},{"name":"Jerry","age":null,"birthday":null,"category":"Mouse","image":""}]'
    );
    await expect(page.locator('#importError')).toHaveText('');
  });

  test('keeps existing exports stable and reports invalid manual initialization input clearly', async ({ page }) => {
    await page.goto('/examples/basic-browser.html');

    const result = await page.evaluate(async () => {
      const mod = await import('../dist/index.js');
      const exportNames = [
        'importExcel',
        'exportExcel',
        'fromExcel',
        'toExcel',
        'downloadExcelTemplate',
        'generateExcelTemplate',
        'initializeWasm',
        'bundledWasmSource'
      ];
      let invalidSourceError = '';
      try {
        mod.initializeWasm({ source: 'definitely-not-valid-gzip' });
      } catch (error) {
        invalidSourceError = error instanceof Error ? error.message : String(error);
      }

      const template = await mod.generateExcelTemplate({
        name: 'CompatibilityCheck',
        columns: [
          { key: 'name', name: 'Name', dataType: 'text' }
        ]
      });

      return {
        bundledWasmSourceType: typeof mod.bundledWasmSource,
        exportPresence: exportNames.map(name => [name, typeof mod[name as keyof typeof mod] !== 'undefined']),
        invalidSourceError,
        templateLength: template.length,
      };
    });

    expect(result.bundledWasmSourceType).toBe('string');
    expect(result.exportPresence).toEqual([
      ['importExcel', true],
      ['exportExcel', true],
      ['fromExcel', true],
      ['toExcel', true],
      ['downloadExcelTemplate', true],
      ['generateExcelTemplate', true],
      ['initializeWasm', true],
      ['bundledWasmSource', true]
    ]);
    expect(result.invalidSourceError).toContain('Invalid WASM source provided to initializeWasm({ source })');
    expect(result.templateLength).toBeGreaterThan(0);
  });
});
