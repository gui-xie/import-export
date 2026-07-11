import { jest } from '@jest/globals';
import { testUtils } from '../../dist/index.js';
import { readBuiltWasmArrayBuffer } from './wasm-bytes.mjs';

const { normalizeDefinition } = testUtils;

/**
 * Feature: repository-improvements
 * Error handling unit tests
 * Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6
 */

// ─── Requirement 7.5: normalizeDefinition with zero columns ───
describe('normalizeDefinition with zero columns', () => {
  test('throws a descriptive error when columns array is empty', () => {
    expect(() => normalizeDefinition({ name: 'Test', columns: [] })).toThrow('must include at least one column');
  });
});

// ─── Requirement 7.6: normalizeDefinition with empty name ───
describe('normalizeDefinition with empty name', () => {
  test('throws a descriptive error when name is empty string', () => {
    expect(() => normalizeDefinition({ name: '', columns: [{ key: 'a', name: 'A' }] })).toThrow('must include a non-empty name');
  });

  test('throws a descriptive error when name is only whitespace', () => {
    expect(() => normalizeDefinition({ name: '   ', columns: [{ key: 'a', name: 'A' }] })).toThrow('must include a non-empty name');
  });
});

// ─── Requirement 7.1: WASM fetch returns non-OK HTTP status ───
describe('WASM fetch returns non-OK HTTP status', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    jest.resetModules();
    jest.useFakeTimers();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.useRealTimers();
  });

  async function drainTimersAndMicrotasks(maxIterations = 20) {
    for (let i = 0; i < maxIterations; i++) {
      jest.advanceTimersByTime(10000);
      await Promise.resolve();
    }
  }

  test('throws a descriptive error containing the HTTP status code', async () => {
    globalThis.fetch = jest.fn(async () => ({
      ok: false,
      status: 500,
    }));

    const mod = await import('../../dist/index.js');

    const initPromise = mod.toExcel({ name: 'Test', columns: [{ key: 'a', name: 'A' }] }, [{ a: 'hello' }]);

    await drainTimersAndMicrotasks();

    await expect(initPromise).rejects.toThrow(/HTTP 500/);
  });
});

// ─── Requirement 7.2: fromExcel with zero-length Uint8Array ───
describe('fromExcel with zero-length Uint8Array', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    jest.resetModules();
    jest.useFakeTimers();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.useRealTimers();
  });

  test('throws a descriptive error when given an empty buffer', async () => {
    // Mock fetch to succeed so WASM init passes.
    globalThis.fetch = jest.fn(async () => ({
      ok: true,
      arrayBuffer: async () => readBuiltWasmArrayBuffer(),
    }));

    const mod = await import('../../dist/index.js');

    const emptyBuffer = new Uint8Array(0);
    const promise = mod.fromExcel({ name: 'Test', columns: [{ key: 'a', name: 'A' }] }, emptyBuffer);

    // The real WASM importer should reject an empty workbook buffer.
    await expect(promise).rejects.toThrow();
  });
});

// ─── Requirement 7.3: fromExcel with random non-XLSX bytes ───
describe('fromExcel with random non-XLSX bytes', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    jest.resetModules();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.useRealTimers();
  });

  test('throws a descriptive error when given random non-XLSX bytes', async () => {
    globalThis.fetch = jest.fn(async () => ({
      ok: true,
      arrayBuffer: async () => readBuiltWasmArrayBuffer(),
    }));

    const mod = await import('../../dist/index.js');

    const randomBytes = new Uint8Array([0xde, 0xad, 0xbe, 0xef, 0x01, 0x02, 0x03, 0x04]);
    const promise = mod.fromExcel({ name: 'Test', columns: [{ key: 'a', name: 'A' }] }, randomBytes);

    await expect(promise).rejects.toThrow();
  });
});

// ─── Requirement 7.4: Image fetcher returns empty Uint8Array ───
describe('Image fetcher returns empty Uint8Array', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    jest.resetModules();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.useRealTimers();
  });

  test('throws a descriptive error when imageFetcher returns empty data', async () => {
    globalThis.fetch = jest.fn(async () => ({
      ok: true,
      arrayBuffer: async () => readBuiltWasmArrayBuffer(),
    }));

    const mod = await import('../../dist/index.js');

    const definition = {
      name: 'ImageTest',
      columns: [{ key: 'img', name: 'Image', dataType: 'image' }],
      imageFetcher: async () => new Uint8Array(0),
    };

    const promise = mod.toExcel(definition, [{ img: 'https://example.com/image.png' }]);

    await expect(promise).rejects.toThrow(/Image fetcher returned empty data/);
  });
});

describe('localized WASM errors', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    jest.resetModules();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test('localizes header mismatch errors and preserves parsed params', async () => {
    globalThis.fetch = jest.fn(async () => ({
      ok: true,
      arrayBuffer: async () => readBuiltWasmArrayBuffer(),
    }));

    const mod = await import('../../dist/index.js');
    const workbook = await mod.generateExcelTemplate({
      name: 'HeaderSource',
      columns: [{ key: 'name', name: 'Name' }],
    });

    let caughtError;
    try {
      await mod.fromExcel(
        {
          name: 'HeaderTarget',
          locale: 'zh',
          columns: [{ key: 'name', name: '姓名' }],
        },
        workbook,
      );
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toBeDefined();
    expect(caughtError.code).toBe('HEADER_MISMATCH');
    expect(caughtError.params).toMatchObject({
      expected: '姓名',
      actual: 'Name',
      sheetName: 'sheet1',
    });
    expect(caughtError.message).toContain('表头不匹配');
    expect(caughtError.message).toContain("期望 '姓名'");
  });

  test('customizes parsed WASM error messages with params', async () => {
    globalThis.fetch = jest.fn(async () => ({
      ok: true,
      arrayBuffer: async () => readBuiltWasmArrayBuffer(),
    }));

    const mod = await import('../../dist/index.js');
    const workbook = await mod.generateExcelTemplate({
      name: 'HeaderSource',
      columns: [{ key: 'name', name: 'Name' }],
    });

    await expect(
      mod.fromExcel(
        {
          name: 'HeaderTarget',
          columns: [{ key: 'name', name: '姓名' }],
          errorMessages: {
            HEADER_MISMATCH: ({ params }) => `bad header ${params.cell}: ${params.expected} != ${params.actual}`,
          },
        },
        workbook,
      ),
    ).rejects.toThrow('bad header A1: 姓名 != Name');
  });
});
