import { test, expect } from '@playwright/test';
import { cleanupFiles, cleanupDirectories } from './cleanupUtils';
import fs from 'fs';
import path from 'path';
import os from 'os';

test.describe('cleanupUtils', () => {
    let tempDir: string;
    let tempFile: string;

    test.beforeEach(() => {
        // Create a temporary directory and file for testing
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-cleanup-'));
        tempFile = path.join(tempDir, 'tempFile.txt');
        fs.writeFileSync(tempFile, 'Temporary file content');
    });

    test.afterEach(() => {
        // Ensure the temporary directory is cleaned up after each test
        if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
        }
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true });
        }
    });

    test('cleanupFiles should delete specified files', () => {
        // Verify the file exists before cleanup
        expect(fs.existsSync(tempFile)).toBeTruthy();

        // Call the cleanupFiles function
        cleanupFiles([tempFile]);

        // Verify the file has been deleted
        expect(fs.existsSync(tempFile)).toBeFalsy();
    });

    test('cleanupDirectories should delete specified directories', () => {
        // Verify the directory exists before cleanup
        expect(fs.existsSync(tempDir)).toBeTruthy();

        // Call the cleanupDirectories function
        cleanupDirectories([tempDir]);

        // Verify the directory has been deleted
        expect(fs.existsSync(tempDir)).toBeFalsy();
    });
});