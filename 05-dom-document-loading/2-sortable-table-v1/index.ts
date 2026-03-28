import {createElement} from "../../shared/utils/create-element";

type SortOrder = 'asc' | 'desc';

type SortableTableData = Record<string, string | number>;

interface SortableTableHeader {
  id: string;
  title: string;
  sortable?: boolean;
  sortType?: 'string' | 'number';
  template?: (value: string | number) => string;
}

export default class SortableTable {
  public element: HTMLElement | null;
  public bodyElement: HTMLDivElement | null;
  public headerElement: HTMLDivElement | null;

  constructor(private headersConfig: SortableTableHeader[] = [],private data: SortableTableData[] = []) {
    this.element = createElement(this.template);
    this.bodyElement =  this.element.querySelector<HTMLDivElement>('[data-element="body"]');
    this.headerElement =  this.element.querySelector<HTMLDivElement>('[data-element="header"]');
  }

  private get template() {
    const headerContent =  this.renderHeader();
    const bodyContent = this.renderRows();

    return `<div class="sortable-table">
                <div data-element="header" class="sortable-table__header sortable-table__row">
                  ${headerContent}
                </div>
                <div data-element="body" class="sortable-table__body">
                       ${bodyContent}
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

  private renderRows(){
    return this.data?.map((dataItem)=>{
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

  public sort(field: string, order: SortOrder){
      if(!this.element) return;
      if(!this.bodyElement) return;
      if(!this.headerElement) return;

      const directions = { asc: 1, desc: -1 };
      const column = this.headersConfig.find(item => item.id === field && item.sortable === true);
      if(!column) return;

      this.data.sort((rowA,rowB) => {
        if(typeof rowA[field] === 'undefined' || typeof rowB[field]  === 'undefined') return 0;

        if(column['sortType'] === 'string') {
          return (rowA[field] as string).localeCompare((rowB[field] as string), ["ru", "en"], {caseFirst: "upper"}) * directions[order];
        } else if (column['sortType'] === 'number'){
          return ((rowA[field] as number) - (rowB[field] as number)) * directions[order];
        } else return 0;
      });

      this.bodyElement.innerHTML = this.renderRows();
      this.headerElement.querySelectorAll('[data-order]')?.forEach(el => el.removeAttribute('data-order'))
      this.headerElement.querySelector<HTMLDivElement>(`[data-id="${field}"]`)?.setAttribute('data-order',order);
  }

  public remove(){
    if(!this.element) return;
    this.element.remove();
  }

  public destroy(){
    this.remove();
    this.element = null;
  }
}
