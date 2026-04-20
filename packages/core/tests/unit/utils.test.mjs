import { testUtils } from '../../dist/index.js';

const {
  normalizeDefinition,
  normalizeDynamicImportOptions,
  sanitizeTextCellValue,
  defaultMaxFileSizeBytes,
} = testUtils;

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
    expect(() => normalizeDefinition({
      name: 'Broken',
      columns: [
        { key: 'child', name: 'Child', parent: 'parent' },
        { key: 'parent', name: 'Parent' },
      ],
    })).toThrow("Column 'child' references parent 'parent'");
  });

  test('rejects unsupported data types before reaching browser e2e', () => {
    expect(() => normalizeDefinition({
      name: 'Broken',
      columns: [{ key: 'name', name: 'Name', dataType: 'string' }],
    })).toThrow("Invalid dataType 'string'");
  });

  test('applies defaults and guards for file size and formula escaping', () => {
    const normalized = normalizeDefinition({
      name: 'Defaulted',
      columns: [{ key: 'name', name: 'Name' }],
    });

    expect(normalized.maxFileSizeBytes).toBe(defaultMaxFileSizeBytes);
    expect(normalized.escapeFormulas).toBe(true);

    expect(() => normalizeDefinition({
      name: 'InvalidSize',
      maxFileSizeBytes: 0,
      columns: [{ key: 'name', name: 'Name' }],
    })).toThrow('Invalid maxFileSizeBytes');

    expect(() => normalizeDefinition({
      name: 'InvalidEscape',
      // @ts-expect-error
      escapeFormulas: 'yes',
      columns: [{ key: 'name', name: 'Name' }],
    })).toThrow('Invalid escapeFormulas');
  });

  test('normalizes dynamic import options and validates header row', () => {
    expect(normalizeDynamicImportOptions({
      sheetName: '  sheet1  ',
      headerRow: 2,
    })).toEqual({
      sheetName: 'sheet1',
      headerRow: 2,
      maxFileSizeBytes: defaultMaxFileSizeBytes,
    });

    expect(() => normalizeDynamicImportOptions({ headerRow: 0 })).toThrow(
      "Dynamic import option 'headerRow' must be an integer greater than or equal to 1."
    );

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
