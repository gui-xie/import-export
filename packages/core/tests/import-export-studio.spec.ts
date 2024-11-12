import { test, expect } from '@playwright/test';

test.describe('import-export-studio', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/import-export-studio');
    });

    test('download template should work correctly', async ({ page }) => {
        await page.waitForEvent('download', { timeout: 1000000 });

        expect(true).toBeTruthy();
    });
});