import fs from 'fs';
import { gzipSync } from 'fflate';

const imexportWasmName = 'imexport_wasm_bg.wasm';

export default function imexportWasm() {
    return {
        name: 'imexport-wasm',
        async resolveId(source: string) {
            if (source.endsWith(imexportWasmName)) {
                const resolved = await this.resolve(source, undefined, { skipSelf: true });
                if (resolved) {
                    return resolved.id;
                }
            }
            return null;
        },
        load(id: string) {
            if (id.endsWith(imexportWasmName)) {
                const wasm = fs.readFileSync(id);
                const gzipped = gzipSync(wasm);
                const base64 = Buffer.from(gzipped).toString('base64');
                return `export default '${base64}'`;
            }
            return null;
        }
    }
}