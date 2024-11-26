import { Component, Prop, h } from '@stencil/core';
import { ExcelDefinition } from '../../declarations/ExcelDefinition';

const LANG_RESOURCE = {
  zh: {
    excelName: 'Excel名称',
    sheetName: '表名',
    author: '作者',
    createTime: '创建时间',
    key: '键',
    name: '名称',
    width: '宽度',
    note: '备注',
    dataType: '数据类型',
    allowedValues: '允许值',
    noDefinition: '未提供定义',
  },
  en: {
    excelName: 'Excel Name',
    sheetName: 'Sheet Name',
    author: 'Author',
    createTime: 'Created Time',
    key: 'Key',
    name: 'Name',
    width: 'Width',
    note: 'Note',
    dataType: 'Data Type',
    allowedValues: 'Allowed Values',
    noDefinition: 'No definition provided',
  }
};

@Component({
  tag: 'import-export-definition',
  styleUrl: 'import-export-definition.css',
  shadow: true,
})
export class ImportExportDefinitionComponent {
  @Prop() definition: ExcelDefinition;
  @Prop() culture: 'zh' | 'en' = 'en';
  @Prop() cultureResources?: Record<string, Record<string, string>>;

  render() {
    const l = this.cultureResources?.[this.culture] ?? LANG_RESOURCE[this.culture];
    return this.definition ? (
      <div class="table-definition">
        <div class="definition-details">
          <div class="detail-item">
            <span class="label">{l.excelName}</span>
            <span class="value">
              <editable-cell value={this.definition.name}
                onValueChange={e => this.definition.name = e.detail}
              ></editable-cell>
            </span>
          </div>
          <div class="detail-item">
            <span class="label">{l.sheetName}</span>
            <span class="value">
              <editable-cell
                value={this.definition.sheetName}
                onValueChange={e => this.definition.sheetName = e.detail}
              ></editable-cell>
            </span>
          </div>
          <div class="detail-item">
            <span class="label">{l.author}</span>
            <span class="value">
              <editable-cell
                value={this.definition.author}
                onValueChange={e => this.definition.author = e.detail}
              ></editable-cell>
            </span>
          </div>
          <div class="detail-item">
            <span class="label">{l.createTime}</span>
            <span class="value">
              <editable-cell
                value={this.definition.createTime}
                type="datetime-local"
                onValueChange={e => this.definition.createTime = e.detail}
              ></editable-cell>
            </span>
          </div>
        </div>
        <table class="definition-table">
          <thead>
            <tr>
              <th>{l.key}</th>
              <th>{l.name}</th>
              <th>{l.width}</th>
              <th>{l.note}</th>
              <th>{l.dataType}</th>
              <th>{l.allowedValues}</th>
            </tr>
          </thead>
          <tbody>
            {this.definition.columns.map(column => (
              <tr>
                <td>
                  <editable-cell
                    value={column.key}
                    onValueChange={e => column.key = e.detail}
                  ></editable-cell>
                </td>
                <td>
                  <editable-cell
                    value={column.name}
                    onValueChange={e => column.name = e.detail}
                  ></editable-cell>
                </td>
                <td>
                  <editable-cell
                    value={column.width?.toString()}
                    onValueChange={e => column.width = parseInt(e.detail)}
                  ></editable-cell>
                </td>
                <td>
                  <editable-cell
                    value={column.note}
                    onValueChange={e => column.note = e.detail}
                  ></editable-cell>
                </td>
                <td>{column.dataType}</td>
                <td>
                  <editable-cell
                    value={column.allowedValues?.join(', ') ?? ''}
                    onValueChange={e => column.allowedValues = e.detail.split(',')}
                  ></editable-cell>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div class="no-definition">{l.noDefinition}</div>
    );
  }
}