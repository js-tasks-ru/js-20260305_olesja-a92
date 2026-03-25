import { createElement } from "../../shared/utils/create-element";

interface Options {
  data?: number[];
  label?: string;
  value?: number;
  link?: string;
  formatHeading?: (item:number) => string;
}

export default class ColumnChart {
  public element: HTMLElement | null;
  readonly chartHeight = 50;
  public bodyElement: HTMLDivElement | null;

  constructor(private options: Options = {}) {
    this.element = createElement(this.template);
    this.bodyElement =  this.element.querySelector<HTMLDivElement>('[data-element=body]');
  }

  private get template() {
    const link =  this.options.link ? `<a href="${this.options.link}" class="column-chart__link">View all</a>` : '';
    const valueFormat = this.options.value !== undefined? this.options.formatHeading?.(this.options.value) ?? this.options.value : '';
    const dataDivs = this.renderData(this.options.data);
    const columnClass = !this.options.data || this.options.data.length === 0 ? 'column-chart_loading' : '';

    return `<div class="column-chart ${columnClass}" style="--chart-height: ${this.chartHeight}">
                   <div class="column-chart__title">
                        Total ${this.options.label}
                        ${link}
                  </div>
                  <div class="column-chart__container">
                      <div data-element="header" class="column-chart__header">${valueFormat}</div>
                      <div data-element="body" class="column-chart__chart">
                        ${dataDivs}
                      </div>
                  </div>
                </div>`;
  }

  private renderData(data: number[] | undefined){
      if(!data || data.length === 0) return '';

      const maxValue = Math.max(0, ...data);
      const scale = maxValue ? this.chartHeight / maxValue : 0;
      return data.map(
        (item) => {
          const value = Math.floor(item * scale);
          const tooltip = maxValue ? (item / maxValue * 100).toFixed(0)  : 0;
          return `<div style="--value: ${value}" data-tooltip="${tooltip}%"></div>`
        }
      ).join('');
  }

  public update(data: number[]) {
      if(!this.element) return;
      if(!this.bodyElement) return;

      this.options.data = data;
      this.bodyElement.innerHTML = this.renderData(data);
      this.element.classList.toggle("column-chart_loading", !data || data.length === 0);
  }

  public remove() {
    if(this.element) this.element.remove();
  }

  public destroy() {
      this.remove();
      this.element = null;
      this.options = {}
  }
}
