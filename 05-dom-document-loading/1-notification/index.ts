import { createElement } from "../../shared/utils/create-element";

interface Options {
  duration?: number;
  type?:'success' | 'error';
}

export default class NotificationMessage {
  static activeNotification: NotificationMessage | null = null;
  public element: HTMLElement | null;
  private timerId: number = 0;
  private options: Required<Options>;

  constructor(private message: string, options: Options = {}) {
    this.options = { duration: 2000, type: 'success', ...options };

    if (NotificationMessage.activeNotification) {
      NotificationMessage.activeNotification.remove();
    }
    this.element = createElement(this.template);
    NotificationMessage.activeNotification = this;
  }

  private get template() {
    return `<div class="notification ${this.options.type}" style="--value:${this.options.duration/1000}s">
              <div class="timer"></div>
              <div class="inner-wrapper">
                <div class="notification-header">${this.options.type}</div>
                <div class="notification-body">
                  ${this.message}
                </div>
              </div>
            </div>`;
  }

  show(target?: HTMLElement){
    if(!this.element) return;

    if (NotificationMessage.activeNotification) {
      NotificationMessage.activeNotification.remove();
    }
    target = target ?? document.body;
    NotificationMessage.activeNotification = this;

    target.append(this.element);

    this.timerId = setTimeout(()=>{
       this.remove();
    }, this.options.duration);
  }

  public remove() {
    if(!this.element) return;
    this.element.remove();
  }

  public destroy() {
    this.remove();
    if (NotificationMessage.activeNotification === this) {
      NotificationMessage.activeNotification = null;
    }
    this.element = null;
    clearTimeout(this.timerId);
  }
}
