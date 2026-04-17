import { __testing__ } from '../../dist/index.js';

const { normalizeDefinition, normalizeDynamicImportOptions } = __testing__;

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

    expect(result).toEqual({
      name: 'Demo Export',
      sheetName: 'Sheet A',
      columns: [
        { key: 'parent', name: 'Parent', dataType: 'text', dataGroup: 'group-a' },
        { key: 'child', name: 'Child', dataType: 'number', parent: 'parent', dataGroupParent: 'group-a' },
      ],
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

  test('normalizes dynamic import options and validates header row', () => {
    expect(normalizeDynamicImportOptions({
      sheetName: '  sheet1  ',
      headerRow: 2,
    })).toEqual({
      sheetName: 'sheet1',
      headerRow: 2,
    });

    expect(() => normalizeDynamicImportOptions({ headerRow: 0 })).toThrow(
      "Dynamic import option 'headerRow' must be an integer greater than or equal to 1."
    );
  });
});
