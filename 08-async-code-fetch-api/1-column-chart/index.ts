import { fetchJson } from "../../shared/utils/fetch-json";
import { createElement } from "../../shared/utils/create-element";

const BACKEND_URL = 'https://course-js.javascript.ru';

interface Options {
  data?: number[];
  label?: string;
  value?: number;
  link?: string;
  formatHeading?: (item:number) => string;
  url?: string;
  range?: { from: Date; to: Date };
}

export default class ColumnChart {
  public element: HTMLElement | null;
  readonly chartHeight = 50;
  public bodyElement: HTMLDivElement | null;

  constructor(private options: Options = {}) {
    this.element = createElement(this.template);
    this.bodyElement =  this.element.querySelector<HTMLDivElement>('[data-element=body]');

    if (this.options.range) {
      this.update(this.options.range.from, this.options.range.to);
    }
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

  async update(from: Date, to: Date): Promise<Record<string, number> | null>{
    if(!from || !to) {
      return null;
    }

    this.element?.classList.add('column-chart_loading');

    const url = this.options.url
      ? `${BACKEND_URL}/${this.options.url}`
      : BACKEND_URL;
    const result = await fetchJson(`${url}?from=${from.toISOString()}&to=${to.toISOString()}`) as Record<string, number>;
    if(!result) {
      return null;
    }

    const resultData = Object.values(result);
    this.updateElement(resultData);
    return result;
  }

  public updateElement(data: number[]) {
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
    this.bodyElement = null;
    this.options = {};
  }
}
