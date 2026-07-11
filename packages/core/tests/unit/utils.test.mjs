import { testUtils, ValidationError } from '../../dist/index.js';
import fc from 'fast-check';

const { normalizeDefinition, normalizeDynamicImportOptions, sanitizeTextCellValue, defaultMaxFileSizeBytes } = testUtils;

describe('core normalization helpers', () => {
  test('normalizes schema strings for pure definition logic', () => {
    const result = normalizeDefinition({
      name: '  Demo Export  ',
      sheetName: '  Sheet A  ',
      columns: [
        { key: ' parent ', name: ' Parent ', dataType: ' TEXT ', dataGroup: ' group-a ' },
        { key: ' child ', name: ' Child ', dataType: ' Number ', parent: ' parent ', dataGroupParent: ' group-a ' },
      ],
    });

    expect(result).toMatchObject({
      name: 'Demo Export',
      sheetName: 'Sheet A',
      columns: [
        { key: 'parent', name: 'Parent', dataType: 'text', dataGroup: 'group-a' },
        { key: 'child', name: 'Child', dataType: 'number', parent: 'parent', dataGroupParent: 'group-a' },
      ],
      escapeFormulas: true,
      maxFileSizeBytes: defaultMaxFileSizeBytes,
    });
  });

  test('rejects child columns declared before their parent', () => {
    expect(() =>
      normalizeDefinition({
        name: 'Broken',
        columns: [
          { key: 'child', name: 'Child', parent: 'parent' },
          { key: 'parent', name: 'Parent' },
        ],
      }),
    ).toThrow("Column 'child' references parent 'parent'");
  });

  test('rejects unsupported data types before reaching browser e2e', () => {
    expect(() =>
      normalizeDefinition({
        name: 'Broken',
        columns: [{ key: 'name', name: 'Name', dataType: 'string' }],
      }),
    ).toThrow("Invalid dataType 'string'");
  });

  test('localizes validation errors to Chinese and preserves code params', () => {
    let caughtError;

    try {
      normalizeDefinition({
        name: 'Broken',
        locale: 'zh-CN',
        columns: [{ key: 'name', name: 'Name', dataType: 'string' }],
      });
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toBeInstanceOf(ValidationError);
    expect(caughtError.name).toBe('ValidationError');
    expect(caughtError.code).toBe('INVALID_DATA_TYPE');
    expect(caughtError.params).toMatchObject({
      columnKey: 'name',
      dataType: 'string',
    });
    expect(caughtError.message).toContain("列 'name' 的 dataType 'string' 无效");
  });

  test('uses custom function messages with error params', () => {
    expect(() =>
      normalizeDefinition({
        name: 'CustomMessages',
        columns: [
          { key: 'name', name: 'Name' },
          { key: 'name', name: 'Alias' },
        ],
        errorMessages: {
          DUPLICATE_COLUMN_KEY: ({ params }) => `custom duplicate ${params.columnKey} in ${params.definitionName}`,
        },
      }),
    ).toThrow('custom duplicate name in CustomMessages');
  });

  test('uses custom string templates and falls back for uncovered codes', () => {
    expect(() =>
      normalizeDefinition({
        name: 'EmptyColumns',
        columns: [],
        messages: {
          DEFINITION_COLUMNS_REQUIRED: 'Need at least one column for {definitionName}.',
        },
      }),
    ).toThrow('Need at least one column for EmptyColumns.');

    expect(() =>
      normalizeDefinition({
        name: 'StillDefault',
        locale: 'zh',
        columns: [{ key: 'name', name: 'Name', dataType: 'bad' }],
        messages: {
          DEFINITION_COLUMNS_REQUIRED: 'unused',
        },
      }),
    ).toThrow("列 'name' 的 dataType 'bad' 无效");
  });

  test('applies defaults and guards for file size and formula escaping', () => {
    const normalized = normalizeDefinition({
      name: 'Defaulted',
      columns: [{ key: 'name', name: 'Name' }],
    });

    expect(normalized.maxFileSizeBytes).toBe(defaultMaxFileSizeBytes);
    expect(normalized.escapeFormulas).toBe(true);

    expect(() =>
      normalizeDefinition({
        name: 'InvalidSize',
        maxFileSizeBytes: 0,
        columns: [{ key: 'name', name: 'Name' }],
      }),
    ).toThrow('Invalid maxFileSizeBytes');

    expect(() =>
      normalizeDefinition({
        name: 'InvalidEscape',
        // @ts-expect-error
        escapeFormulas: 'yes',
        columns: [{ key: 'name', name: 'Name' }],
      }),
    ).toThrow('Invalid escapeFormulas');
  });

  test('normalizes dynamic import options and validates header row', () => {
    expect(
      normalizeDynamicImportOptions({
        sheetName: '  sheet1  ',
        headerRow: 2,
      }),
    ).toEqual({
      sheetName: 'sheet1',
      headerRow: 2,
      maxFileSizeBytes: defaultMaxFileSizeBytes,
    });

    expect(() => normalizeDynamicImportOptions({ headerRow: 0 })).toThrow("Dynamic import option 'headerRow' must be an integer greater than or equal to 1.");

    expect(normalizeDynamicImportOptions({ maxFileSizeBytes: 1024 })).toMatchObject({
      maxFileSizeBytes: 1024,
    });
  });

  test('sanitizes formula-like text values when escape is enabled', () => {
    expect(sanitizeTextCellValue('=CMD()', true)).toBe("'=CMD()");
    expect(sanitizeTextCellValue('+SUM(A1:A2)', true)).toBe("'+SUM(A1:A2)");
    expect(sanitizeTextCellValue('\tSUM', true)).toBe("'\tSUM");
    expect(sanitizeTextCellValue('plain', true)).toBe('plain');
    expect(sanitizeTextCellValue('=KEEP', false)).toBe('=KEEP');
  });
});

/**
 * Feature: repository-improvements
 * Property 1: Formula prefix characters are escaped
 * Validates: Requirements 3.1, 3.2, 3.3
 */
describe('Property 1: Formula prefix characters are escaped', () => {
  const FORMULA_PREFIX_CHARS = ['=', '+', '-', '@', '\t', '\r', '\n', '|', ';'];

  test('sanitizeTextCellValue escapes any non-empty string starting with a formula prefix character', () => {
    const prefixArb = fc.constantFrom(...FORMULA_PREFIX_CHARS);
    const suffixArb = fc.string({ minLength: 0 });

    fc.assert(
      fc.property(prefixArb, suffixArb, (prefix, suffix) => {
        const value = prefix + suffix;
        const result = sanitizeTextCellValue(value, true);
        expect(result).toBe("'" + value);
      }),
      { numRuns: 100 },
    );
  });
});

/**
 * Feature: repository-improvements
 * Property 2: Escape bypass preserves identity
 * Validates: Requirements 3.4
 */
describe('Property 2: Escape bypass preserves identity', () => {
  test('sanitizeTextCellValue returns the original value unchanged when escapeFormulas is false', () => {
    fc.assert(
      fc.property(fc.string(), value => {
        const result = sanitizeTextCellValue(value, false);
        expect(result).toBe(value);
      }),
      { numRuns: 100 },
    );
  });
});

/**
 * Feature: repository-improvements
 * Unit tests for new formula prefix edge cases (pipe and semicolon)
 * Validates: Requirements 3.1, 3.2, 3.3
 */
describe('Formula prefix edge cases for pipe and semicolon', () => {
  test('sanitizeTextCellValue escapes pipe-prefixed values when escape is enabled', () => {
    expect(sanitizeTextCellValue('|cmd', true)).toBe("'|cmd");
  });

  test('sanitizeTextCellValue escapes semicolon-prefixed values when escape is enabled', () => {
    expect(sanitizeTextCellValue(';cmd', true)).toBe("';cmd");
  });

  test('sanitizeTextCellValue returns empty string unchanged when escape is enabled', () => {
    expect(sanitizeTextCellValue('', true)).toBe('');
  });
});
