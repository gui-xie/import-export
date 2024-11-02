import fs from 'fs';

export function cleanupFiles(filePaths: string[]): void {
    filePaths.forEach(filePath => {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    });
}

export function cleanupDirectories(dirPaths: string[]): void {
    dirPaths.forEach(dirPath => {
        if (fs.existsSync(dirPath)) {
            fs.rmSync(dirPath, { recursive: true });
        }
    });
}