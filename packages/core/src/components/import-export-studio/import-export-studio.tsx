import { Component, Prop, State, h } from '@stencil/core';
import { type ExcelDefinition } from '../../declarations/ExcelDefinition';
import { downloadExcelTemplate, download, initializeWasm } from '../../utils';

const LANG_RESOURCE = {
  zh: {
    hideDefinition: '隐藏定义',
    showDefinition: '显示定义',
    downloadTemplate: '下载模板',
    downloadDefinition: '下载定义',
  },
  en: {
    hideDefinition: 'Hide Definition',
    showDefinition: 'Show Definition',
    downloadTemplate: 'Download Template',
    downloadDefinition: 'Download Definition',
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

  componentWillLoad() {
    initializeWasm();
  }

  toggleDefinitionVisibility = () => {
    this.showDefinition = !this.showDefinition;
  };

  render() {
    const l = LANG_RESOURCE[this.culture];
    return (
      <div class="import-export-studio">
        <div class="operation">
          <button type="text" class="studio-button" onClick={this.toggleDefinitionVisibility}>
            {this.showDefinition ? l.hideDefinition : l.showDefinition}
          </button>
          <button type="text" class="studio-button" onClick={() => downloadExcelTemplate(this.definition)} >
            {l.downloadTemplate}
          </button>
          {this.showDefinition && (
            <button type="text" class="studio-button" onClick={() => downloadDefinition(this.definition)} >
              {l.downloadDefinition}
            </button>
          )}
        </div>
        <div class="definition">
          {this.showDefinition && (
            <import-export-definition
              definition={this.definition}
              culture={this.culture}
            ></import-export-definition>
          )}
        </div>
        <import-export-table definition={this.definition} data={this.data}></import-export-table>
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