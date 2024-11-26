import { Component, Prop, State, h } from '@stencil/core';
import { type ExcelDefinition } from '../../declarations/ExcelDefinition';
import { downloadExcelTemplate, download, exportExcel, importExcel, initializeWasm } from '../../utils';

const LANG_RESOURCE = {
  zh: {
    hideDefinition: '隐藏定义',
    showDefinition: '显示定义',
    downloadTemplate: '下载模板',
    exportExcel: '导出Excel',
    importExcel: '导入Excel',
    downloadDefinition: '下载定义',
    preview: '预览',
    dataSource: '数据源',
    hideDataSource: '隐藏数据源',
    showDataSource: '显示数据源',
  },
  en: {
    hideDefinition: 'Hide Definition',
    showDefinition: 'Show Definition',
    downloadTemplate: 'Download Template',
    exportExcel: 'Export Excel',
    importExcel: 'Import Excel',
    downloadDefinition: 'Download Definition',
    preview: 'Preview',
    dataSource: 'Data Source',
    hideDataSource: 'Hide Data Source',
    showDataSource: 'Show Data Source',
  }
};

@Component({
  tag: 'import-export-studio',
  styleUrl: 'import-export-studio.css',
  shadow: true,
})
export class ImportExportStudioComponent {
  @Prop() definition: ExcelDefinition;
  @Prop() culture: 'zh' | 'en' = 'en';
  @Prop() data: any[] = [];
  @State() showDefinition: boolean = true;
  @State() showDataSource: boolean = false;

  componentWillLoad() {
    initializeWasm();
  }

  toggleDefinitionVisibility = () => {
    this.showDefinition = !this.showDefinition;
  };

  toggleDataSourceVisibility = () => {
    this.showDataSource = !this.showDataSource;
  }

  importExcelHandler = async (definition: ExcelDefinition) => {
    const data = await importExcel(definition);
    this.data = data;
  }

  handleDataSourceChange = (e: Event) => {
    const target = e.target as HTMLTextAreaElement;
    try {
      this.data = JSON.parse(target.value);
    }
    catch (e) {
      console.log(e);
    }
  }

  render() {
    const l = LANG_RESOURCE[this.culture];
    return (
      <div class="import-export-studio">
        <div class="operation">
          <button type="text" class="studio-button" onClick={this.toggleDefinitionVisibility}>
            {this.showDefinition ? l.hideDefinition : l.showDefinition}
          </button>
          <button type="text" class="studio-button" onClick={() => downloadDefinition(this.definition)} >
            {l.downloadDefinition}
          </button>
          <button type="text" class="studio-button" onClick={() => downloadExcelTemplate(this.definition)} >
            {l.downloadTemplate}
          </button>
          <button type="text" class="studio-button" onClick={() => exportExcel(this.definition, this.data)} >
            {l.exportExcel}
          </button>
          <button type="text" class="studio-button" onClick={() => this.importExcelHandler(this.definition)} >
            {l.importExcel}
          </button>
          <button type="text" class="studio-button" onClick={() => this.toggleDataSourceVisibility()} >
            {this.showDataSource ? l.hideDataSource : l.showDataSource}
          </button>
        </div>
        <div class="definition">
          {this.showDefinition && (
            <import-export-definition
              definition={this.definition}
              culture={this.culture}
            ></import-export-definition>
          )}
        </div>


        <div class="preview-table">
          <h3>{l.preview}</h3>
          <import-export-table definition={this.definition} data={this.data}></import-export-table>
        </div>

        {this.showDataSource && (
          <div class="data-source">
            <h3>{l.dataSource}</h3>
            <p>{JSON.stringify(this.data, null, 2)}</p>
          </div>
        )}
      </div>
    );

    function downloadDefinition(definition: ExcelDefinition) {
      download(
        JSON.stringify(definition, null, 2),
        `${definition.name}-definition.json`,
        'application/json');
    }
  }
}