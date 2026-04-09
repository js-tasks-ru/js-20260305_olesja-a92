import { createElement } from "../../shared/utils/create-element";

interface Options {
  from?: Date;
  to?: Date;
}

export default class RangePicker {
  element: HTMLElement | null;
  from: Date | null;
  to: Date| null;
  inputElement: HTMLDivElement | null;
  selectorElement: HTMLDivElement | null;
  private showDateFrom: Date;
  private showDateTo: Date;
  private selectingFrom: boolean = true;
  private DateOptions: Intl.DateTimeFormatOptions = { year: "numeric", month: "2-digit", day: "2-digit" };

  constructor(private options: Options = {}) {
    this.from = this.options.from ?? null;
    this.to = this.options.to ?? null;
    this.showDateFrom = this.options.from ?? new Date();
    this.showDateTo = this.options.to ?? new Date(this.showDateFrom.getFullYear(), this.showDateFrom.getMonth() + 1, 1);
    this.element = createElement(this.template);
    this.inputElement = this.element.querySelector<HTMLDivElement>('[data-element="input"]');
    this.selectorElement = this.element.querySelector<HTMLDivElement>('[data-element="selector"]');
    this.initListeners();
  }

  private get template(){
    const fromDate = this.from?.toLocaleString("ru", this.DateOptions) || '';
    const toDate = this.to?.toLocaleString("ru", this.DateOptions) || '';

    return `<div class="rangepicker">
                <div class="rangepicker__input" data-element="input">
                  <span data-element="from">${fromDate}</span> -
                  <span data-element="to">${toDate}</span>
                </div>
                <div class="rangepicker__selector" data-element="selector"></div>
              </div>`;
  }

  private renderCalendar(date: Date){
    const lastDay = new Date(date.getFullYear(), date.getMonth()+1, 0).getDate();
    const monthName = date.toLocaleString('ru', { month: 'long' });
    let calendarHtml = `<div class="rangepicker__calendar">
                          <div class="rangepicker__month-indicator">
                            <time datetime="December">${monthName}</time>
                          </div>
                          <div class="rangepicker__day-of-week">
                            <div>Пн</div>
                            <div>Вт</div>
                            <div>Ср</div>
                            <div>Чт</div>
                            <div>Пт</div>
                            <div>Сб</div>
                            <div>Вс</div>
                          </div>
                          <div class="rangepicker__date-grid">`;
    const dayOfWeek = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const startFrom = dayOfWeek === 0 ? 7 : dayOfWeek;

    for(let n = 1; n <= lastDay; n++){
      const dayDate = new Date(date.getFullYear(), date.getMonth(), n);
      const dataValue = dayDate.toISOString();
      const styleFrom = n===1 ? `style="--start-from: ${startFrom}"` : '';
      let rangeClass = '';
      if(this.from) {
        rangeClass = this.isSameDay(dayDate, this.from) ? 'rangepicker__selected-from' : rangeClass;
        if (this.from && this.to){
          rangeClass = this.isSameDay(dayDate, this.to) ? 'rangepicker__selected-to' :
            (dayDate > this.from && dayDate < this.to ? 'rangepicker__selected-between' : rangeClass);
        }
      }
      calendarHtml += `<button type="button" class="rangepicker__cell ${rangeClass}" ${styleFrom} data-value="${dataValue}">${n}</button>`;
    }
    calendarHtml += '</div></div>';

    return calendarHtml;
  }

  private initListeners(){
    this.inputElement?.addEventListener("click", this.onClickInput);
    this.selectorElement?.addEventListener("click", this.onClickSelector);
    document.addEventListener("click", this.onClickBody, {capture: true});
  }

  private onClickInput = () => {
    const isOpen = this.element?.classList.toggle('rangepicker_open');
    if (isOpen) {
      this.updateCalendar();
    }
  }

  private onClickBody = (event: Event) => {
    const target = event.target as HTMLButtonElement;
    if(!target){
      return;
    }

    if(!target.closest('.rangepicker')){
      this.element?.classList.remove('rangepicker_open');
    }
  }

  private onClickSelector = (event: Event) => {
    const target = event.target as HTMLElement;
    if(!target){
      return;
    }

    if (target.classList.contains('rangepicker__selector-control-left')) {
      this.onPrevMonth();
      return;
    }
    if (target.classList.contains('rangepicker__selector-control-right')) {
      this.onNextMonth();
      return;
    }
    this.onClickRangePicker(event);
  }

  private onPrevMonth = () => {
    this.showDateFrom = new Date(this.showDateFrom.getFullYear(), this.showDateFrom.getMonth() - 1, 1);
    this.updateCalendar();
  }

  private onNextMonth = () => {
    this.showDateFrom = new Date(this.showDateFrom.getFullYear(), this.showDateFrom.getMonth() + 1, 1);
    this.updateCalendar();
  }

  private onClickRangePicker = (event: Event) => {
    const target = (event.target as HTMLElement).closest('.rangepicker__cell') as HTMLButtonElement;
    if (!target?.dataset.value) {
      return;
    }

    const date = new Date(target.dataset.value);

    if (this.selectingFrom) {
      this.from = date;
      this.to = null;
      this.selectingFrom = false;

      this.element?.querySelectorAll('.rangepicker__cell').forEach(cell => {
        cell.classList.remove(
          'rangepicker__selected-from',
          'rangepicker__selected-to',
          'rangepicker__selected-between'
        );
      });
      target.classList.add('rangepicker__selected-from');
    } else {
      if(!this.from){
        return;
      }

      if (date < this.from) {
        this.to = this.from;
        this.from = date;
      } else {
        this.to = date;
      }
      this.selectingFrom = true;
      this.showDateTo = this.to??this.showDateTo;

      this.element?.dispatchEvent(new CustomEvent("date-select", {
        bubbles: true,
        detail: { from: this.from, to: this.to }
      }));

      const fromDate = this.from?.toLocaleString("ru", this.DateOptions) || '';
      const toDate = this.to?.toLocaleString("ru", this.DateOptions) || '';
      const fromSpan = this.inputElement?.querySelector<HTMLSpanElement>('[data-element="from"]');
      const toSpan = this.inputElement?.querySelector<HTMLSpanElement>('[data-element="to"]');

      if (fromSpan) fromSpan.textContent = fromDate;
      if (toSpan) toSpan.textContent = toDate;

      this.updateCalendar();
      this.element?.classList.toggle('rangepicker_open');
    }
  }

  private updateCalendar() {
    if (!this.selectorElement) {
      return;
    }
    if (!this.selectorElement.querySelector('.rangepicker__selector-arrow')) {
      this.selectorElement.innerHTML = `
            <div class="rangepicker__selector-arrow"></div>
            <div class="rangepicker__selector-control-left"></div>
            <div class="rangepicker__selector-control-right"></div>
        `;
    }
    const nextMonth = new Date(this.showDateFrom.getFullYear(), this.showDateFrom.getMonth() + 1, 1);

    this.selectorElement.querySelectorAll('.rangepicker__calendar').forEach(el => el.remove());
    this.selectorElement.insertAdjacentHTML('beforeend',
      this.renderCalendar(this.showDateFrom) + this.renderCalendar(nextMonth)
    );
  }

  private isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  public remove(){
    if(!this.element) {
      return;
    }
    this.inputElement?.removeEventListener("click", this.onClickInput);
    this.selectorElement?.removeEventListener("click", this.onClickSelector);
    document.removeEventListener("click", this.onClickBody, {capture: true});
    this.element.remove();
  }

  public destroy() {
    this.remove();
    this.element = null;
    this.inputElement = null;
    this.selectorElement  = null;
  }
}
