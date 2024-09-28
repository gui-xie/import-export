import {
  Component,
  Prop,
  h,
  Fragment,
  Event,
  Method
} from '@stencil/core';
import { EventEmitter } from 'stream';
import { type ExcelDefinition } from '../../types';
import { fromExcel, toExcel, createExcel, initializeWasm } from '../../utils/utils';
import { ExcelInfo, ExcelColumnInfo, ExcelDataType } from '@senlinz/import-export-wasm';

@Component({
  tag: 'imexport-table',
  styleUrl: 'imexport-table.css',
  shadow: true,
})
export class ImexportTableComponent {
  @Prop()
  info?: ExcelDefinition = {
    name: 'senlin',
    sheetName: 'senlin_sheet',
    columns: [
      { key: 'name', name: 'Name', dataType: ExcelDataType.Text },
      { key: 'age', name: 'Age', dataType: ExcelDataType.Number },
    ]
  }

  @Event() imported: EventEmitter<any>;

  @Method()
  async importExcel(options?: {
    buffer?: Uint8Array
  }) {
    const info = this.getInfo();
    if (!!options?.buffer) {
      const items = await fromExcel(info, options.buffer);
      this.imported.emit(items);
    } else {
      this.fileInput.click();
    }
  }

  @Method()
  async exportExcelTemplate() {
    this.exportTemplateHandler();
  }

  @Method()
  async exportExcel(data: any[]) {
    const info = this.getInfo();
    this.setDownloadLink(info.name);
    const buffer = await toExcel(info, data);
    this.download(buffer);
  }

  componentDidLoad() {
    initializeWasm();
  }

  fileInput!: HTMLInputElement;
  linkInput!: HTMLAnchorElement;

  private setDownloadLink(name: string) {
    this.linkInput.download = `${name}.xlsx`;
  }

  private download(excelTemplate: Uint8Array) {
    const blob = new Blob([excelTemplate],
      {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
    this.linkInput.href = URL.createObjectURL(blob);
    this.linkInput.click();
  }

  private async exportTemplateHandler() {
    const info = this.getInfo();
    this.setDownloadLink(info.name);
    const excelTemplate = await createExcel(info);
    this.download(excelTemplate);
  }

  private getInfo(): ExcelInfo {
    var info = new ExcelInfo(
      this.info.name,
      this.info.sheetName,
      this.info.columns.map(c => {
        const column = new ExcelColumnInfo(c.key, c.name);
        column.data_type = c.dataType;
        column.width = c.width;
        column.note = c.note;
        column.allowed_values = c.allowedValues;
        return column;
      })
    );
    info.author = this.info.author;
    return info;
  }

  private onFileChange(event: Event) {
    var info = this.getInfo();
    const file = (event.target as HTMLInputElement).files[0];
    const reader = new FileReader();
    reader.onload = async () => {
      const buffer = new Uint8Array(reader.result as ArrayBuffer);
      const items = await fromExcel(info, buffer);
      this.imported.emit(items);
    };
    reader.readAsArrayBuffer(file);
  }

  private exportDataToExcel() {
    // this.exportExcel(this.data);
  }

  render() {
    return (<>
      <button
        onClick={_ => this.exportTemplateHandler()}>Download Template</button><br />
      <button
        onClick={_ => this.exportDataToExcel()}>Export Excel</button><br />
      <input type="file"
        accept='.xlsx,.xls,.xlsm,.xlsb,.xla,.xlam,.ods'
        onChange={event => this.onFileChange(event)}
        ref={(el) => this.fileInput = el as HTMLInputElement} />
      <a ref={(el) => this.linkInput = el as HTMLAnchorElement}></a>

    </>);
  }
}

