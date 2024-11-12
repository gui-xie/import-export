import { Component, Prop, State, h, Event, EventEmitter } from '@stencil/core';

const LANG_RESOURCE = {
  zh: {
    tooltip: '双击编辑',
  },
  en: {
    tooltip: 'Double click to edit',
  }
};

@Component({
  tag: 'editable-cell',
  styleUrl: 'editable-cell.css',
  shadow: true,
})
export class EditableCellComponent {
  @Prop() culture: 'zh' | 'en' = 'en';
  @Prop() type: 'text' | 'datetime-local' = 'text';
  @Prop() value: string | Date;

  @State() inputValue: string;

  @Event() valueChange: EventEmitter<string>;

  inputElement: HTMLInputElement;
  contentELement: HTMLElement;

  componentWillLoad() {
    if (this.value instanceof Date) {
      this.inputValue = this.value.toISOString().slice(0, 10);
    } else {
      this.inputValue = this.value;
    }
  }

  dblHandler = (_: MouseEvent) => {
    this.showEditor();
  }

  showEditor = () => {
    this.contentELement.style.display = 'none';
    this.inputElement.style.display = 'block';
    this.inputElement.focus();
  }

  hideEditor = () => {
    this.contentELement.style.display = 'block';
    this.inputElement.style.display = 'none';
  }

  keyUpHandler = (event: KeyboardEvent) => {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      this.completeInput();
      return;
    }
    const target = event.target as HTMLInputElement;
    this.inputValue = target.value;
  }

  changeHandler = (e: Event) => {
    if (e.target instanceof HTMLInputElement) {
      this.inputValue = e.target.value;
    }
    this.completeInput();
  }

  completeInput = () => {
    this.contentELement.innerText = this.inputValue;
    this.hideEditor();
    this.valueChange.emit(this.inputValue);
  }

  render() {
    return (
      <div class="editable-cell-container"
        onDblClick={this.dblHandler}
        title={LANG_RESOURCE[this.culture].tooltip}>
        <span class="value"
          ref={(el) => this.contentELement = el as HTMLElement}
        >
          {this.value}</span>
        <input
          type={this.type}
          class="cell-editor"
          value={this.inputValue}
          onKeyUp={this.keyUpHandler}
          onChange={this.changeHandler}
          ref={(el) => this.inputElement = el as HTMLInputElement}
        />
      </div>
    );
  }
}