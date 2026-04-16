import { fetchJson } from "../../shared/utils/fetch-json";
import {createElement} from "../../shared/utils/create-element";

const BACKEND_URL = 'https://course-js.javascript.ru';

type SortOrder = 'asc' | 'desc';

type SortableTableData = Record<string, unknown>;

type SortableTableSort = {
  id: string;
  order: SortOrder;
};

interface SortableTableHeader {
  id: string;
  title: string;
  sortable?: boolean;
  sortType?: 'string' | 'number' | 'custom';
  template?: (value: unknown) => string;
  customSorting?: (a: SortableTableData, b: SortableTableData) => number;
}

interface Options {
  url?: string;
  data?: SortableTableData[];
  sorted?: SortableTableSort;
  isSortLocally?: boolean;
  step?: number;
  start?: number;
  end?: number;
}

export default class SortableTable {
  public element: HTMLElement | null;
  public bodyElement: HTMLDivElement | null;
  public headerElement: HTMLDivElement | null;
  public arrowElement: HTMLElement | null;
  private start = 0;
  private end = 30;
  private step = 30;
  private isLoading = false;
  private hasMoreData = true;
  private currentField: string = '';
  private currentOrder: SortOrder = 'asc';

  constructor(private headersConfig: SortableTableHeader[] = [], private options: Options = {}) {
    this.element = createElement(this.template);
    this.bodyElement =  this.element.querySelector<HTMLDivElement>('[data-element="body"]');
    this.headerElement =  this.element.querySelector<HTMLDivElement>('[data-element="header"]');
    this.arrowElement = createElement(`<span data-element="arrow" class="sortable-table__sort-arrow">
                                                <span class="sort-arrow"></span>
                                            </span>`);
    if(typeof this.options.isSortLocally === 'undefined') {
      this.options.isSortLocally = false;
    }

    this.render();

    this.headerElement?.addEventListener("pointerdown", this.onClick);
    window.addEventListener("scroll", this.onScroll);
  }

  private get template() {
    const headerContent =  this.renderHeader();

    return `<div class="sortable-table">
                <div data-element="header" class="sortable-table__header sortable-table__row">
                  ${headerContent}
                </div>
                <div data-element="body" class="sortable-table__body">

                </div>
                <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
                <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
                   <div>
                     <p>No products satisfies your filter criteria</p>
                     <button type="button" class="button-primary-outline">Reset all filters</button>
                   </div>
                </div>
            </div>`;
  }

  private renderRows(data: SortableTableData[]){
    return data?.map((dataItem)=>{
      const columnItem =  this.headersConfig?.map((configItem)=>{
        if(dataItem[configItem.id]) {
          return configItem.template?
            configItem.template(dataItem[configItem.id]):
            `<div class="sortable-table__cell">${dataItem[configItem.id]}</div>`;
        }
      }).join('');

      return `<a href="/products/${dataItem.id}" class="sortable-table__row">${columnItem}</a>`
    }).join('');
  }

  private renderHeader(){
    return this.headersConfig?.map((configItem)=>{
      return `<div
                class="sortable-table__cell"
                data-id="${configItem.id}"
                data-sortable="${configItem.sortable??false}">
                    ${configItem.title}
              </div>`;
    }).join('');
  }

  private async loadData(field: string, order: SortOrder, start = 0, end = 30) {
    const url = this.options.url
      ? `${BACKEND_URL}/${this.options.url}`
      : BACKEND_URL;

    return await fetchJson(`${url}?_sort=${field}&_order=${order}&_start=${start}&_end=${end}`) as SortableTableData[];
  }

  public async render() {
    if(!this.element || !this.bodyElement){
      return;
    }

    this.element.classList.add('sortable-table_loading');

    const field = this.options.sorted?.id ?? '';
    const order = this.options.sorted?.order ?? 'asc';
    this.currentField = field;
    this.currentOrder = order;
    try {
      const data = await this.loadData(field, order);
      const placeholder = this.element.querySelector('[data-element="emptyPlaceholder"]');
      if (placeholder) {
        (placeholder as HTMLElement).style.display = !data || data.length === 0 ? 'block' : 'none';
      }
      this.options.data = data;
      this.updateTable(data, field, order, false);
      this.start = 0;
      this.end = this.step;
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      this.element.classList.remove('sortable-table_loading');
    }
  }

  private updateTable(data: SortableTableData[], field: string, order: SortOrder, append = false) {
    if (!this.bodyElement || !this.headerElement || !this.arrowElement) return;

    if (append) {
      this.bodyElement.insertAdjacentHTML('beforeend', this.renderRows(data));
    } else {
      this.bodyElement.innerHTML = this.renderRows(data);
    }

    this.headerElement.querySelectorAll('[data-order]').forEach(el => {
      el.removeAttribute('data-order');
      el.querySelector('[data-element="arrow"]')?.remove();
    });
    this.headerElement.querySelector<HTMLDivElement>(`[data-id="${field}"]`)?.setAttribute('data-order', order);
    this.headerElement.querySelector<HTMLDivElement>(`[data-id="${field}"]`)?.append(this.arrowElement);
  }

  public sort (field: string, order: SortOrder) {
    this.currentField = field;
    this.currentOrder = order;
    if (this.options.isSortLocally) {
      this.sortOnClient(field, order);
    } else {
      this.sortOnServer(field, order);
    }
  }

  public async sortOnServer(field: string, order: SortOrder) {
    if(!this.element
      || !this.bodyElement
      || !this.headerElement
      || !this.arrowElement) {
        return;
    }

    this.hasMoreData = true;
    this.start = 0;
    this.end = this.step;
    this.element.classList.add('sortable-table_loading');
    try{
      const data = await this.loadData(field, order, this.start, this.end);
      this.options.data = data;
      this.updateTable(data, field, order, false);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      this.element.classList.remove('sortable-table_loading');
    }
  }

  public sortOnClient(field: string, order: SortOrder){
    if(!this.element
      || !this.bodyElement
      || !this.headerElement
      || !this.arrowElement
      || !this.options.data) {
        return;
    }


    const directions = { asc: 1, desc: -1 };
    const column = this.headersConfig.find(item => item.id === field && item.sortable === true);
    if(!column) {
      return;
    }

    const customSorting = column.customSorting;

    this.options.data = [...this.options.data].sort((rowA, rowB) => {
      if (typeof rowA[field] === 'undefined' || typeof rowB[field] === 'undefined') return 0;

      if (column['sortType'] === 'string') {
        return (rowA[field] as string).localeCompare((rowB[field] as string), ["ru", "en"], {caseFirst: "upper"}) * directions[order];
      } else if (column['sortType'] === 'number') {
        return ((rowA[field] as number) - (rowB[field] as number)) * directions[order];
      } else if(column['sortType'] === 'custom' && customSorting) {
        return customSorting(rowA, rowB) * directions[order];
      } else return 0;
    });

    this.bodyElement.innerHTML = this.renderRows(this.options.data)??'';
    this.headerElement.querySelectorAll('[data-order]')?.forEach(el => {
      el.removeAttribute('data-order');
      el.querySelector('[data-element="arrow"]')?.remove();
    })
    this.headerElement.querySelector<HTMLDivElement>(`[data-id="${field}"]`)?.setAttribute('data-order',order);
    this.headerElement.querySelector<HTMLDivElement>(`[data-id="${field}"]`)?.append(this.arrowElement);
  }

  private onClick = (event: Event) => {
    const target = event.target as HTMLElement;
    if(!("tagName" in target)) {
      return;
    }
    const column = target.closest('[data-id]') as HTMLElement;
    if(!column) {
      return;
    }
    if (column.dataset.sortable === 'false') {
      return;
    }

    const field = column.getAttribute('data-id');
    const order = column.getAttribute('data-order')==='desc'?'asc':'desc';

    if(!field){
      return;
    }

    this.sort(field, order);
  }

  private onScroll = async () => {
    if (this.isLoading || !this.hasMoreData) {
      return;
    }
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    if (scrollTop + clientHeight >= scrollHeight - 100) {
      this.isLoading = true;
      try {
        this.start = this.end;
        this.end = this.end + this.step;
        const data = await this.loadData(this.currentField, this.currentOrder, this.start, this.end);
        if (data.length === 0) {
          this.hasMoreData = false;
          return;
        }
        this.options.data = [...(this.options.data ?? []), ...data];
        this.updateTable(data, this.currentField, this.currentOrder, true);
      } catch (error) {
        console.error('Ошибка загрузки:', error);
      } finally {
        this.isLoading = false;
      }
    }
  }

  public remove(){
    if(!this.element) return;
    this.element.remove();
  }

  public destroy(){
    this.remove();
    this.headerElement?.removeEventListener("pointerdown", this.onClick);
    window.removeEventListener('scroll', this.onScroll)
    this.element = null;
  }
}
