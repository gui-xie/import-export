import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('import-export core', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/index.html');
  });

  test('can retry import after a failed import', async ({ page }) => {
    const downloadPath = path.join(__dirname, 'test-download');
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
      '[{"name":"Tom","age":"12","category":"Cat"},{"name":"Jerry","age":"13","category":"Mouse"}]'
    );
    await expect(page.locator('#importError')).toHaveText('');
  });
});
