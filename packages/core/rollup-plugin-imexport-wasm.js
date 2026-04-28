import fs from 'fs';
import path from 'path';
import { gzipSync } from 'fflate';

const imexportWasmName = 'imexport_wasm_bg.wasm';
const urlSuffix = '?url';

function isImexportWasmRequest(value) {
    return value.endsWith(imexportWasmName) || value.endsWith(`${imexportWasmName}${urlSuffix}`);
}

function stripUrlSuffix(value) {
    return value.endsWith(urlSuffix) ? value.slice(0, -urlSuffix.length) : value;
}

export default function imexportWasm() {
    return {
        name: 'imexport-wasm',
        async resolveId(source, importer) {
            if (isImexportWasmRequest(source)) {
                const resolved = await this.resolve(stripUrlSuffix(source), importer, { skipSelf: true });
                if (resolved) {
                    return source.endsWith(urlSuffix) ? `${resolved.id}${urlSuffix}` : resolved.id;
                }
            }
            return null;
        },
        load(id) {
            if (!isImexportWasmRequest(id)) {
                return null;
            }

            const wasmId = stripUrlSuffix(id);
            const wasm = fs.readFileSync(wasmId);

            if (id.endsWith(urlSuffix)) {
                const referenceId = this.emitFile({
                    type: 'asset',
                    name: path.basename(wasmId),
                    source: wasm
                });
                return `export default import.meta.ROLLUP_FILE_URL_${referenceId};`;
            }

            const gzipped = gzipSync(wasm);
            const base64 = Buffer.from(gzipped).toString('base64');
            return `export default '${base64}'`;
        }
    }
}
