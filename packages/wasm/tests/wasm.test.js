const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test.describe('import-export-wasm', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/examples/direct-browser.html');
        await page.waitForFunction(() => document.body.dataset.ready === 'true');
    });

    test('download template should work correctly', async ({ page }) => {
        // Arrange
        const downloadPath = path.join(__dirname, 'test-download');
        fs.mkdirSync(downloadPath, { recursive: true });
        const downloadFilePath = path.join(downloadPath, 'template.xlsx');

        // Act
        const [download] = await Promise.all([
            page.waitForEvent('download'),
            page.click('#btnDownloadTemplate')
        ]);

        await download.saveAs(downloadFilePath);

        // Assert
        expect(fs.existsSync(downloadFilePath)).toBeTruthy();
    });

    test('export and import should work correctly', async ({ page }) => {
        // Arrange
        const downloadPath = path.join(__dirname, 'test-download');
        fs.mkdirSync(downloadPath, { recursive: true });
        const filePath = path.join(downloadPath, 'TomAndJerry.xlsx');

        // Act - Export
        const [download] = await Promise.all([
            page.waitForEvent('download'),
            page.click('#btnExport')
        ]);

        await download.saveAs(filePath);

        // Assert - Export
        expect(fs.existsSync(filePath)).toBeTruthy();

        // Act - Import
        const [chooseFile] = await Promise.all([
            page.waitForEvent('filechooser'),
            page.click('#btnImport')
        ]);
        await chooseFile.setFiles(filePath);
        await page.waitForSelector('#importOutput');

        // Assert - Import
        const importOutput = await page.textContent('#importOutput');
        expect(importOutput).toBe('[{"name":"Tom","age":"12","category":"Cat","image":""},{"name":"Jerry","age":"13","category":"Mouse","image":""}]');
    });

    test('reports header mismatch errors in the direct wasm example', async ({ page }) => {
        const invalidFilePath = path.resolve(
            __dirname,
            '../src/tests/snapshots/imexport_wasm__tests__tests__export_pokemon_success.snap.xlsx'
        );

        const [chooseFile] = await Promise.all([
            page.waitForEvent('filechooser'),
            page.click('#btnImport')
        ]);
        await chooseFile.setFiles(invalidFilePath);

        await expect(page.locator('#errorOutput')).toContainText('Header mismatch');
    });
});
