import { newSpecPage } from '@stencil/core/testing';
import { TableDefinition } from '../table-definition';

describe('table-definition', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [TableDefinition],
      html: `<table-definition></table-definition>`,
    });
    const tableDefinition = page.body.querySelector('table-definition');
    tableDefinition.definition = {
      name: 'TomAndJerry',
      sheetName: 'Sheet1',
      columns: [
        {
          key: 'name',
          name: 'Name',
        },
        {
          key: 'birth',
          name: 'Birth',
        },
      ],
    };

    await page.waitForChanges();

    expect(tableDefinition).toMatchSnapshot();
  });
});
