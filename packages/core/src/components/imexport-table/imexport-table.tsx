import {
  Component,
  Prop,
  h,
  Fragment,
  Event
} from '@stencil/core';
import { EventEmitter } from 'stream';
import { type ExcelDefinition } from '../../declarations/ExcelDefintion';
import { fromExcel, toExcel, initializeWasm, downloadExcelTemplate } from '../../utils/utils';

@Component({
  tag: 'imexport-table',
  styleUrl: 'imexport-table.css',
  shadow: true,
})
export class ImexportTableComponent {
  @Prop()
  info: ExcelDefinition;

  @Event() imported: EventEmitter<any>;

  async importExcel(options?: {
    buffer?: Uint8Array
  }) {
    if (!!options?.buffer) {
      const items = await fromExcel(this.info, options.buffer);
      this.imported.emit(items);
    } else {
      this.fileInput.click();
    }
  }

  async downloadExcelTemplate() {
    downloadExcelTemplate(this.info);
  }

  async exportExcel(data: any[]) {
    this.setDownloadLink(this.info.name);
    const buffer = await toExcel(this.info, data);
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

  private onFileChange(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    const reader = new FileReader();
    reader.onload = async () => {
      const buffer = new Uint8Array(reader.result as ArrayBuffer);
      const items = await fromExcel(this.info, buffer);
      this.imported.emit(items);
    };
    reader.readAsArrayBuffer(file);
  }

  private exportDataToExcel() {
    // this.exportExcel(this.data);
  }

  render() {
    return (<>
      <table-definition definition={this.info} ></table-definition>
      <button
        onClick={this.downloadExcelTemplate}>Download Template</button><br />
      <button
        onClick={this.exportDataToExcel}>Export Excel</button><br />
      <input type="file"
        accept='.xlsx,.xls,.xlsm,.xlsb,.xla,.xlam,.ods'
        onChange={this.onFileChange}
        ref={(el) => this.fileInput = el as HTMLInputElement} />
    </>);
  }
}