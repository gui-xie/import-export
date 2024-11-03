import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('import-export', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('download template should work correctly', async ({ page }) => {
    // Arrange
    const downloadFolder = fs.mkdtempSync(path.join(__dirname, 'downloaded'));

    try {
      // Act
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.click('#btnDownloadTemplate'),
      ]);
      const fileName = `template-${download.suggestedFilename()}`;
      const downloadFilePath = path.join(downloadFolder, fileName);
      await download.saveAs(downloadFilePath);
      const stream = fs.readFileSync(downloadFilePath);

      // Assert
      expect(stream).toMatchSnapshot(fileName);

    } finally {
      fs.rmSync(downloadFolder, { recursive: true });
    }
  });

  test('export and import should work correctly', async ({ page }) => {
    // Arrange
    const downloadFolder = fs.mkdtempSync(path.join(__dirname, 'downloaded'));
    const filePath = path.join(downloadFolder, 'TomAndJerry.xlsx');

    try {
      // Act - Export
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.click('#btnExport')
      ]);

      await download.saveAs(filePath);

      // Assert - Export
      expect(fs.existsSync(filePath)).toBeTruthy();

      // Act - Import
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        page.click('#btnImport')
      ]);

      await fileChooser.setFiles(filePath);
      await page.waitForSelector('#importOutput');

      // Assert - Import
      const importOutput = await page.textContent('#importOutput');
      expect(importOutput).toBe('[{"name":"Tom","age":12,"category":"Cat"},{"name":"Jerry","age":13,"category":"Mouse"}]');
    } finally {
      fs.rmSync(downloadFolder, { recursive: true });
    }
  });
});