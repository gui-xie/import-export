import { Component, Prop, h } from '@stencil/core';
import { ExcelDefinition } from '../../declarations/ExcelDefintion';

@Component({
  tag: 'table-definition',
  styleUrl: 'table-definition.css',
  shadow: true,
})
export class TableDefinition {
  @Prop() definition: ExcelDefinition;

  render() {
    return this.definition ? (
      <div class="table-definition">
        <h2 class="definition-name">{this.definition.name}</h2>
        <h3>Sheet: {this.definition.sheetName}</h3>
        {this.definition.author && <p>Author: {this.definition.author}</p>}
        <table>
          <thead>
            <tr>
              <th>Key</th>
              <th>Name</th>
              <th>Width</th>
              <th>Note</th>
              <th>Data Type</th>
              <th>Allowed Values</th>
            </tr>
          </thead>
          <tbody>
            {this.definition.columns.map(column => (
              <tr>
                <td>{column.key}</td>
                <td>{column.name}</td>
                <td>{column.width ?? 'N/A'}</td>
                <td>{column.note ?? 'N/A'}</td>
                <td>{column.dataType ?? 'N/A'}</td>
                <td>{column.allowedValues?.join(', ') ?? 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : <div class="table-definition">No definition provided</div>;
  }
}