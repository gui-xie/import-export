import {
  Component,
  Prop,
  h,
  Fragment,
  Event,
  Method
} from '@stencil/core';
import initAsync, {
  createTemplate,
  importData,
  exportData,
  ExcelInfo,
  ExcelColumnInfo,
  ExcelData,
  ExcelRowData,
  ExcelColumnData
} from '@senlin/import-export-wasm';
import imexportWasm from '@senlin/import-export-wasm/pkg/imexport_wasm_bg.wasm';
import { gunzipSync } from 'fflate';
import { EventEmitter } from 'stream';

@Component({
  tag: 'imexport-table',
  styleUrl: 'imexport-table.css',
  shadow: true,
})
export class ImexportTableComponent {
  @Prop()
  info: {
    name: string,
    sheetName: string,
    columns: { key: string, name: string }[]
  } = {
      name: 'senlin',
      sheetName: 'senlin_sheet',
      columns: [
        { key: 'name', name: 'Name' },
        { key: 'age', name: 'Age' }
      ]
    }

  @Event() imported: EventEmitter<any>;

  @Method()
  async importExcel(options?: {
    buffer?: Uint8Array
  }) {
    const info = this.getInfo();
    if (!!options.buffer) {
      const items = this.importBufferData(info, options.buffer);
      this.imported.emit(items);
    } else {
      this.fileInput.click();
    }
    return Promise.resolve();
  }

  @Method()
  async exportExcelTemplate() {
    this.exportTemplateHandler();
  }

  @Method()
  async epxortExcel(data: any[]) {
    const info = this.getInfo();
    const rows = data.map(item => {
      const columns = info.columns.map(column => {
        const val = item[column.key];
        return new ExcelColumnData(
          column.key,
          (val === undefined || val === null) ? '' : val.toString()
        );
      });
      const row = new ExcelRowData(columns);
      return row;
    });
    const excelData = new ExcelData(rows);
    this.setDownloadLink(info.name);
    const buffer = exportData(info, excelData);
    this.download(buffer);
  }

  fileInput!: HTMLInputElement;
  linkInput!: HTMLAnchorElement;

  async componentWillLoad() {
    const wasm = gunzipSync(Uint8Array.from(atob(imexportWasm as any), c => c.charCodeAt(0)));
    await initAsync(wasm);
  }

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

  private exportTemplateHandler() {
    const info = this.getInfo();

    this.setDownloadLink(info.name);
    const excelTemplate = createTemplate(info);
    this.download(excelTemplate);
  }

  private getInfo(): ExcelInfo {
    return new ExcelInfo(
      this.info.name,
      this.info.sheetName,
      this.info.columns.map(c => new ExcelColumnInfo(c.key, c.name))
    );
  }

  private getItems(data: ExcelData) {
    const result = [] as any;
    for (const row of data.rows) {
      const item = {} as any;
      for (const column of row.columns) {
        item[column.key] = column.value;
      }
      result.push(item);
    }
    return result;
  }

  private onFileChange(event: Event) {
    var info = this.getInfo();
    const file = (event.target as HTMLInputElement).files[0];
    const reader = new FileReader();
    reader.onload = async () => {
      const buffer = new Uint8Array(reader.result as ArrayBuffer);
      const items = this.importBufferData(info, buffer);
      this.imported.emit(items);
    };
    reader.readAsArrayBuffer(file);
  }

  private importBufferData(info: ExcelInfo, buffer: Uint8Array) {
    const data = importData(info, buffer);
    const items = this.getItems(data);
    return items;
  }

  render() {
    return (<>
      <button
        onClick={_ => this.exportTemplateHandler()}>Create Template</button><br />
      <input type="file"
        onChange={event => this.onFileChange(event)}
        ref={(el) => this.fileInput = el as HTMLInputElement} />
      <a ref={(el) => this.linkInput = el as HTMLAnchorElement}></a>
    </>);
  }
}

