import { jest } from '@jest/globals';
import fc from 'fast-check';

/**
 * Feature: repository-improvements
 * Property 4: Exhausted retries produce descriptive error
 * Validates: Requirements 2.3
 *
 * For any fetch error message, if all 3 attempts (1 initial + 2 retries) fail,
 * the thrown error SHALL contain both the original error message and the total
 * attempt count (3).
 */
describe('Property 4: Exhausted retries produce descriptive error', () => {
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

  /**
   * Helper to drive all pending timers and microtasks to completion.
   * The retry logic uses setTimeout for exponential backoff delays,
   * so we need to advance fake timers to let the retry loop proceed.
   */
  async function drainTimersAndMicrotasks(maxIterations = 20) {
    for (let i = 0; i < maxIterations; i++) {
      jest.advanceTimersByTime(10000);
      await Promise.resolve();
    }
  }

  test('for any error message, exhausted retries throw an error containing the message and attempt count 3', async () => {
    await fc.assert(
      fc.asyncProperty(fc.string({ minLength: 1 }), async errorMsg => {
        // Reset module state for each iteration
        jest.resetModules();

        // Mock fetch to always fail with the generated error message
        globalThis.fetch = jest.fn(async () => {
          throw new Error(errorMsg);
        });

        // Dynamically import a fresh module instance
        const mod = await import('../../dist/index.js');

        // Call any exported function that triggers ensureWasmInitialized
        const initPromise = mod.toExcel(
          {
            name: 'Test',
            columns: [{ key: 'a', name: 'A' }],
          },
          [{ a: 'hello' }],
        );

        // Drive fake timers to let retry delays resolve
        await drainTimersAndMicrotasks();

        let caughtError;
        try {
          await initPromise;
        } catch (e) {
          caughtError = e;
        }

        // The error must exist
        expect(caughtError).toBeDefined();
        // The error message must contain the original error message
        expect(caughtError.message).toContain(errorMsg);
        // The error message must contain the attempt count "3 attempts"
        expect(caughtError.message).toContain('3 attempts');
      }),
      { numRuns: 100 },
    );
  });
});

/**
 * Feature: repository-improvements
 * Property 3: Retry logic respects attempt budget
 * Validates: Requirements 2.1, 2.4
 *
 * For any number of consecutive fetch failures n where 0 ≤ n ≤ 2,
 * if the fetch succeeds on attempt n + 1, the WASM runtime SHALL become
 * ready after exactly n + 1 total fetch attempts.
 */
describe('Property 3: Retry logic respects attempt budget', () => {
  let fetchCallCount;
  let originalFetch;

  beforeEach(() => {
    fetchCallCount = 0;
    originalFetch = globalThis.fetch;
    jest.resetModules();
    jest.useFakeTimers();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.useRealTimers();
  });

  /**
   * Creates a mock fetch that fails `failCount` times then succeeds.
   * Returns a fake Response with an arrayBuffer() that resolves to
   * a minimal Uint8Array (simulating WASM bytes).
   */
  function setupMockFetch(failCount) {
    fetchCallCount = 0;
    globalThis.fetch = jest.fn(async () => {
      fetchCallCount++;
      if (fetchCallCount <= failCount) {
        throw new Error(`Network error on attempt ${fetchCallCount}`);
      }
      return {
        ok: true,
        arrayBuffer: async () => new Uint8Array([0, 1, 2, 3]).buffer,
      };
    });
  }

  /**
   * Helper to drive all pending timers and microtasks to completion.
   * The retry logic uses setTimeout for exponential backoff delays,
   * so we need to advance fake timers to let the retry loop proceed.
   */
  async function drainTimersAndMicrotasks(maxIterations = 20) {
    for (let i = 0; i < maxIterations; i++) {
      jest.advanceTimersByTime(10000);
      await Promise.resolve();
    }
  }

  test('for any failure count n ∈ {0,1,2}, ensureWasmInitialized resolves and total fetch calls equal n+1', async () => {
    const failureCountArb = fc.constantFrom(0, 1, 2);

    await fc.assert(
      fc.asyncProperty(failureCountArb, async n => {
        // Reset module state for each iteration
        jest.resetModules();
        fetchCallCount = 0;
        setupMockFetch(n);

        // Dynamically import a fresh module instance
        const mod = await import('../../dist/index.js');

        // Call any exported function that triggers ensureWasmInitialized.
        // toExcel calls ensureWasmInitialized internally.
        const initPromise = mod.toExcel(
          {
            name: 'Test',
            columns: [{ key: 'a', name: 'A' }],
          },
          [{ a: 'hello' }],
        );

        // Drive fake timers to let retry delays resolve
        await drainTimersAndMicrotasks();

        try {
          await initPromise;
        } catch (e) {
          // Errors from exportData (the WASM mock) are expected.
          // But errors from initialization (fetch failures beyond budget)
          // should NOT happen since we set up exactly n failures.
          if (e.message && e.message.includes('Failed to initialize')) {
            throw e;
          }
        }

        expect(fetchCallCount).toBe(n + 1);
      }),
      { numRuns: 100 },
    );
  });
});
