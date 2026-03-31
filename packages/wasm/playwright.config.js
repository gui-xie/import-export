export default {
    use: {
        headless: true,
        baseURL: 'http://localhost:8080',
    },
    testDir: 'tests',
    snapshotDir: 'tests/snapshots',
    webServer: {
        command: 'wasm-pack build --release --target web -d tests/dist && node ./scripts/finalize-pkg.mjs tests/dist && npx serve -l 8080 .',
        port: 8080,
        timeout: 120 * 1000
    },
};
