import { initSync } from '@senlinz/import-export-wasm';
import imexportWasm from '@senlinz/import-export-wasm/pkg/imexport_wasm_bg.wasm';
import { gunzipSync } from 'fflate';
import { WasmInitError, getErrorMessage } from './errors.js';

type WasmInitializationInputKind = 'source' | 'bytes' | 'module';

interface InitializeWasmOptions {
  /**
   * Gzipped base64-encoded WASM source text.
   */
  source?: string;
  /**
   * Raw WebAssembly bytes loaded by the caller.
   */
  bytes?: BufferSource;
  /**
   * A precompiled WebAssembly module loaded by the caller.
   */
  module?: WebAssembly.Module;
}

type RuntimeState =
  | {
    kind: 'bundled';
  }
  | {
    kind: 'custom';
    inputKind: WasmInitializationInputKind;
    token: unknown;
  };

const bundledWasmSource = imexportWasm;
let runtimeState: RuntimeState | null = null;

function decodeBase64(value: string): Uint8Array {
  if (typeof atob === 'function') {
    return Uint8Array.from(atob(value), char => char.charCodeAt(0));
  }
  if (typeof Buffer !== 'undefined') {
    return Uint8Array.from(Buffer.from(value, 'base64'));
  }
  throw new WasmInitError('WASM initialization requires a base64 decoder such as atob or Buffer.');
}

function decodeEmbeddedWasm(wasmSource: string): Uint8Array {
  const normalizedSource = wasmSource.trim();
  if (!normalizedSource) {
    throw new WasmInitError('Invalid WASM source provided to initializeWasm({ source }). Expected a non-empty gzipped base64 string.');
  }
  try {
    return gunzipSync(decodeBase64(normalizedSource));
  } catch (error) {
    throw new WasmInitError(
      `Invalid WASM source provided to initializeWasm({ source }). Expected a gzipped base64 string. ${getErrorMessage(error)}`,
      { cause: error }
    );
  }
}

function isBufferSource(value: unknown): value is BufferSource {
  return value instanceof ArrayBuffer || ArrayBuffer.isView(value);
}

function getByteLength(value: BufferSource): number {
  return value.byteLength;
}

function getProvidedInputKind(options: InitializeWasmOptions): WasmInitializationInputKind[] {
  const provided: WasmInitializationInputKind[] = [];
  if (options.source !== undefined) {
    provided.push('source');
  }
  if (options.bytes !== undefined) {
    provided.push('bytes');
  }
  if (options.module !== undefined) {
    provided.push('module');
  }
  return provided;
}

function normalizeCustomInitialization(options: InitializeWasmOptions) {
  const provided = getProvidedInputKind(options);
  if (provided.length === 0) {
    throw new WasmInitError('initializeWasm(options) requires exactly one of source, bytes, or module.');
  }
  if (provided.length > 1) {
    throw new WasmInitError(
      `initializeWasm(options) accepts exactly one input source. Received: ${provided.join(', ')}.`
    );
  }
  if (provided[0] === 'source') {
    return {
      inputKind: 'source' as const,
      module: decodeEmbeddedWasm(options.source!),
      token: options.source!,
    };
  }
  if (provided[0] === 'bytes') {
    const bytes = options.bytes;
    if (!bytes || !isBufferSource(bytes)) {
      throw new WasmInitError('Invalid WASM bytes provided to initializeWasm({ bytes }). Expected an ArrayBuffer or typed array.');
    }
    if (getByteLength(bytes) === 0) {
      throw new WasmInitError('Invalid WASM bytes provided to initializeWasm({ bytes }). Expected a non-empty ArrayBuffer or typed array.');
    }
    return {
      inputKind: 'bytes' as const,
      module: bytes,
      token: bytes,
    };
  }
  if (!(options.module instanceof WebAssembly.Module)) {
    throw new WasmInitError('Invalid WASM module provided to initializeWasm({ module }). Expected a WebAssembly.Module instance.');
  }
  return {
    inputKind: 'module' as const,
    module: options.module,
    token: options.module,
  };
}

function initializeRuntime(module: BufferSource | WebAssembly.Module, nextState: RuntimeState) {
  try {
    initSync({ module });
  } catch (error) {
    if (nextState.kind === 'custom') {
      throw new WasmInitError(
        `Failed to initialize the Excel WASM runtime from custom ${nextState.inputKind}. ${getErrorMessage(error)}`,
        { cause: error }
      );
    }
    throw new WasmInitError(`Failed to initialize the Excel WASM runtime. ${getErrorMessage(error)}`, { cause: error });
  }
  runtimeState = nextState;
}

function ensureWasmInitialized() {
  if (runtimeState) {
    return;
  }
  initializeRuntime(decodeEmbeddedWasm(bundledWasmSource), { kind: 'bundled' });
}

function initializeWasm(options?: InitializeWasmOptions) {
  if (!options) {
    ensureWasmInitialized();
    return;
  }

  const normalized = normalizeCustomInitialization(options);
  if (!runtimeState) {
    initializeRuntime(normalized.module, {
      kind: 'custom',
      inputKind: normalized.inputKind,
      token: normalized.token,
    });
    return;
  }

  if (runtimeState.kind === 'bundled') {
    throw new WasmInitError('The Excel WASM runtime is already using the bundled module. Call initializeWasm(...) before using other APIs to provide custom WASM.');
  }

  if (runtimeState.inputKind === normalized.inputKind && runtimeState.token === normalized.token) {
    return;
  }

  throw new WasmInitError(
    `The Excel WASM runtime is already initialized with custom ${runtimeState.inputKind} input and cannot be reinitialized with different ${normalized.inputKind} input in the same page/context. Refresh the page or create a new context to initialize with different WASM input.`
  );
}

export {
  bundledWasmSource,
  ensureWasmInitialized,
  initializeWasm,
};

export type {
  InitializeWasmOptions,
  WasmInitializationInputKind,
};
