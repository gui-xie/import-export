import { Component, Prop, h } from '@stencil/core';
import { ExcelDefinition } from '../../declarations/ExcelDefintion';

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

  render() {
    const l = LANG_RESOURCE[this.culture];
    return this.definition ? (
      <div class="table-definition">
        <div class="definition-details">
          <div class="detail-item">
            <span class="label">{l.excelName}</span>
            <span class="value">{this.definition.name}</span>
          </div>
          <div class="detail-item">
            <span class="label">{l.sheetName}</span>
            <span class="value">{this.definition.sheetName}</span>
          </div>
          <div class="detail-item">
            <span class="label">{l.author}</span>
            <span class="value">{this.definition.author}</span>
          </div>
          <div class="detail-item">
            <span class="label">{l.createTime}</span>
            <span class="value">{this.definition.createTime}</span>
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
                <td>{column.key}</td>
                <td>{column.name}</td>
                <td>{column.width ?? ''}</td>
                <td>{column.note ?? ''}</td>
                <td>{column.dataType}</td>
                <td>{column.allowedValues?.join(', ') ?? ''}</td>
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