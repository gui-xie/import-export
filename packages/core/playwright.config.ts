import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
    use: {
        headless: false,
        baseURL: 'http://localhost:8080',
    },
    testDir: 'tests',
    snapshotDir: 'tests/snapshots',
    webServer: {
        command: 'npm run e2e-serve',
        port: 8080,
        timeout: 120 * 1000
    },
};

export default config;