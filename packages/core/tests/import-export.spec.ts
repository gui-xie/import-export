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
});
