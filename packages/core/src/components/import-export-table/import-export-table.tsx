import { Component, Prop, h } from '@stencil/core';
import { type ExcelDefinition } from '../../declarations/ExcelDefinition';

@Component({
  tag: 'import-export-table',
  styleUrl: 'import-export-table.css',
  shadow: true,
})
export class ImportExportTableComponent {
  @Prop() definition: ExcelDefinition;
  @Prop() data: any[] = [];

  render() {
    if (!this.definition) return null;
    return (
      <div class="import-export-table">
        {this.data && (
          <table class="data-table">
            <thead>
              <tr>
                {this.definition.columns.map(column => (
                  <th>{column.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {this.data.map(item => (
                <tr>
                  {this.definition.columns.map(column => (
                    <td>{item[column.key]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }
}