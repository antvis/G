
import * as Util from '@antv/util';

class Event {
  x: number = 0;
  y: number = 0;
  clientX: number = 0;
  clientY: number = 0;
  cfg: {
    [key: string]: any;
  } = {};
  type: string;
  target: any;
  currentTarget: any;
  bubbles: boolean = false;
  cancelable: boolean = false;
  timeStamp: number = (new Date()).getTime(); // 时间戳
  defaultPrevented: boolean = false;
  propagationStopped: boolean = false; // 阻止冒泡
  event: any;
  constructor(type: string, event: any, bubbles?: boolean, cancelable?: boolean) {
    this.type = type; // 事件类型
    this.event = event;
    this.bubbles = !!bubbles;
    this.cancelable = !!cancelable;
  }

  preventDefault() {
    this.defaultPrevented = this.cancelable && true;
  }

  stopPropagation() {
    this.propagationStopped = true;
  }

  remove() {
    this.cfg.removed = true;
  }

  clone() {
    return Util.clone(this);
  }

  toString() {
    return `[Event (type=${this.type})]`;
  }
}

export default Event;
