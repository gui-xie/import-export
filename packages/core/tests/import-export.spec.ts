import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { getXlsxFileHash } from './utils/xlsxUtils';
import { cleanupFiles, cleanupDirectories } from './utils/cleanupUtils';

test.describe('import-export', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('download template should work correctly', async ({ page }) => {
    // Arrange
    const downloadPath = fs.mkdtempSync(path.join(os.tmpdir(), 'senlinz-import-export-download'));
    const fileName = 'TomAndJerry.xlsx';
    const downloadFilePath = path.join(downloadPath, fileName);

    try {
      // Act
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.click('#btnDownloadTemplate'),
      ]);
      await download.saveAs(downloadFilePath);

      // Assert
      expect(fs.existsSync(downloadFilePath)).toBeTruthy();
      expect(getXlsxFileHash(downloadFilePath)).toMatchSnapshot();
    } finally {
      // Clean up
      cleanupFiles([downloadFilePath]);
      cleanupDirectories([downloadPath]);
    }
  });
});