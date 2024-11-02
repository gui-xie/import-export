import { unzipSync } from 'fflate';
import * as crypto from 'crypto';
import fs from 'fs';

export function getXlsxFileHash(filePath: string): string {
    const unzipFile = unzipSync(fs.readFileSync(filePath));
    const fileHash = Object.keys(unzipFile).reduce((acc, key) => {
        const hash = key.includes('docProps/core.xml')
            ? 'ignore'
            : crypto.createHash('sha256').update(unzipFile[key]).digest('hex');
        return `${acc}${key}\n${hash}\n`;
    }, '');
    return fileHash;
}