import {createElement} from "../../shared/utils/create-element";

export default class Tooltip {
  public element: HTMLElement | null = null;
  private static instance: Tooltip | null = null;
  private paddingTooltip: number = 10;

  constructor() {
    if(!Tooltip.instance){
      Tooltip.instance = this;
    } else {
      return Tooltip.instance;
    }

    this.element = createElement(this.template);
  }

  private get template() {
    return `<div class="tooltip"></div>`;
  }

  public initialize(): void{
    document.addEventListener('pointerover', this.onPointerOver);
  }

  public render(html: string){
    if(!this.element){
      return;
    }

    this.element.innerHTML = html;
    document.body.append(this.element);
  }

  private onPointerOut = (event: Event) => {
    if(!this.element){
      return;
    }
    this.element.remove();
    document.removeEventListener("pointermove", this.onPointerMove);
  }
  private onPointerOver = (event: Event) => {
    const target = event.target as HTMLElement;
    if(!("tagName" in target)) {
      return;
    }

    const tooltip = target.dataset.tooltip;
    if(!tooltip){
      return;
    }

    this.render(tooltip);
    document.addEventListener("pointermove", this.onPointerMove);
    document.addEventListener("pointerout", this.onPointerOut, {once: true});
  }

  private onPointerMove = ({clientX, clientY}: PointerEvent) => {
    if(!this.element){
      return;
    }
    this.element.style.left = `${clientX + this.paddingTooltip}px`;
    this.element.style.top = `${clientY + this.paddingTooltip}px`;
  }

  public remove(){
    if(!this.element) {
      return;
    }
    this.element.remove();
  }

  public destroy(){
    this.remove();
    if (Tooltip.instance === this) {
      Tooltip.instance = null;
    }
    document.removeEventListener("pointerover", this.onPointerOver);
    document.removeEventListener("pointerout", this.onPointerOut);
    document.removeEventListener("pointermove", this.onPointerMove);
  }

}
