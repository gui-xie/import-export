import { newE2EPage } from '@stencil/core/testing';

describe('table-definition', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<table-definition></table-definition>');

    const element = await page.find('table-definition');
    element.setProperty('definition', {
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
    });

    await page.waitForChanges();

    expect(element).toMatchSnapshot();
  });
});
