import {createElement} from "../../shared/utils/create-element";

type DoubleSliderSelected = {
  from: number;
  to: number;
};

interface Options {
  min?: number;
  max?: number;
  formatValue?: (value: number) => string;
  selected?: DoubleSliderSelected;
}

export default class DoubleSlider {
  public element: HTMLElement | null;
  public fromElement: HTMLSpanElement | null;
  public toElement: HTMLSpanElement | null;
  public thumbLeft: HTMLSpanElement | null;
  public thumbRight: HTMLSpanElement | null;
  public activeThumb: HTMLSpanElement | null = null;
  public innerElement: HTMLDivElement | null;
  public spanProgress: HTMLSpanElement | null;
  public min: number;
  public max: number;
  public from: number;
  public to: number;
  public shiftX: number = 0;

  constructor(private options: Options = {}) {
    this.min = this.options.min??0;
    this.max = this.options.max??100;
    this.from = this.options.selected?.from??this.min;
    this.to = this.options.selected?.to??this.max;

    this.element = createElement(this.template);
    this.fromElement = this.element.querySelector<HTMLSpanElement>('[data-element="from"]');
    this.toElement = this.element.querySelector<HTMLSpanElement>('[data-element="to"]');
    this.thumbLeft = this.element.querySelector<HTMLSpanElement>('[data-element="thumbLeft"]');
    this.thumbRight = this.element.querySelector<HTMLSpanElement>('[data-element="thumbRight"]');
    this.innerElement = this.element.querySelector<HTMLDivElement>('.range-slider__inner');
    this.spanProgress = this.element.querySelector<HTMLSpanElement>('.range-slider__progress');

    this.initListeners();
  }

  private get template() {
    const interval = (this.max - this.min);
    const leftProc = interval > 0 ? (this.from - this.min) / interval * 100 : 0;
    const rightProc = interval > 0 ? (this.max - this.to) / interval * 100 : 100;
    const valueFrom = this.options.formatValue ? this.options.formatValue(this.from) : this.from;
    const valueTo = this.options.formatValue ? this.options.formatValue(this.to) : this.to;

    return `<div class="range-slider">
              <span data-element="from">${valueFrom}</span>
              <div class="range-slider__inner">
                <span class="range-slider__progress" style="left: ${leftProc}%; right: ${rightProc}%"></span>
                <span data-element="thumbLeft" class="range-slider__thumb-left" style="left: ${leftProc}%"></span>
                <span data-element="thumbRight" class="range-slider__thumb-right" style="right: ${rightProc}%"></span>
              </div>
              <span data-element="to">${valueTo}</span>
            </div>`;
  }

  private initListeners(): void{
    if(!this.element){
      return;
    }
    this.element.addEventListener("pointerdown", this.onDown);
  }

  private onDown = (event: PointerEvent) => {
    const target = event.target as HTMLElement;
    if(!("tagName" in target)) {
      return;
    }

    if(target.dataset.element !== 'thumbLeft' && target.dataset.element !== 'thumbRight'){
      return;
    }
    this.activeThumb = target;
    //тесты не дают пройти такой функции
    //this.activeThumb.setPointerCapture(event.pointerId);
    this.shiftX = this.activeThumb.offsetWidth/2;

    document.addEventListener("pointermove", this.onMove);
    document.addEventListener("pointerup", this.onUp, {once: true});
  }

  private onMove = ({clientX}: PointerEvent) => {
    if( !this.activeThumb || !this.innerElement || !this.thumbRight
        || !this.thumbLeft || !this.spanProgress || !this.fromElement
        || !this.toElement){
      return;
    }
    const inner = this.innerElement.getBoundingClientRect();

    if(this.activeThumb.dataset.element === 'thumbRight'){
      const leftPercent = parseFloat(this.thumbLeft.style.left);
      const percentRight = (inner.right - clientX  + this.shiftX) / inner.width * 100;

      if (percentRight + leftPercent > 100 || percentRight < 0) {
        return;
      }

      this.to = Math.round(this.max - (percentRight / 100) * (this.max - this.min));
      this.toElement.textContent = this.options.formatValue?this.options.formatValue(this.to):`${this.to}`;
      this.activeThumb.style.right = `${percentRight}%`;
      this.spanProgress.style.right = `${percentRight}%`;
    } else if(this.activeThumb.dataset.element === 'thumbLeft'){
      const rightPercent = parseFloat(this.thumbRight.style.right);
      const percentLeft =  (clientX - inner.left  + this.shiftX) / inner.width * 100;

      if (percentLeft + rightPercent > 100 || percentLeft < 0) {
        return;
      }

      this.from = Math.round(this.min + (percentLeft/ 100) * (this.max - this.min));
      this.fromElement.textContent = this.options.formatValue?this.options.formatValue(this.from):`${this.from}`;
      this.activeThumb.style.left = `${percentLeft}%`;
      this.spanProgress.style.left = `${percentLeft}%`;
    }
  }

  private onUp = () => {
    if(!this.activeThumb || !this.element || !this.thumbLeft || !this.thumbRight){
      return;
    }

    this.element.dispatchEvent(new CustomEvent("range-select", {
      detail: { from: this.from, to: this.to }, bubbles: true
    }));

    this.activeThumb = null;
    document.removeEventListener('pointermove', this.onMove);
  }

  public remove(){
    if(!this.element) return;
    this.element.remove();
  }

  public destroy(){
    if(!this.element) return;
    this.element.removeEventListener("pointerdown", this.onDown);
    document.removeEventListener('pointermove', this.onMove);
    document.removeEventListener('pointerup', this.onUp);
    this.remove();
    this.element = null;
    this.activeThumb = null;
    this.innerElement = null;
    this.thumbRight = null;
    this.thumbLeft = null;
    this.spanProgress = null;
    this.fromElement = null;
    this.toElement = null;
  }
}
