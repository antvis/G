import EventEmitter from '@antv/event-emitter';
import * as Util from '@antv/util';
import Event from '../event';
import {
  ElementCFG
} from '../interface';

const PROPOGATE_EVENTS = [
  'click',
  'mousedown',
  'mouseup',
  'dblclick',
  'contextmenu',
  // 'mouseenter', // 原生 dom 事件，这对就是不冒泡的
  // 'mouseleave',
  'mouseover',
  'mouseout',
  'mousemove',
  'wheel',
  // touch
  'touchstart',
  'touchend',
  'touchmove',
  // 包装出来的方法
  'dragstart',
  'drag',
  'dragend',
  'dragenter',
  'dragleave',
  'drop',
];

abstract class Base extends EventEmitter {
  cfg: ElementCFG;
  destroyed: boolean = false;
  removed: boolean = false;

  constructor(cfg: ElementCFG = {}) {
    super();
    this.cfg = {
      canvas: null,
      capture: true,
      context: null,
      parent: null,
      visible: true,
      zIndex: 0,
      ...cfg,
      ...this.getDefaultCfg(),
    }
    return this;
  }

  /**
   * 覆盖父类的 emit，实现事件的冒泡机制
   * @param evt
   * @param e g 层包装之后的 Event 实例
   * @param args 其余数据，仅做透传。
   */
  emit(evt: string, e: any, ...args: any[]) {
    // 调用 ee 的事件 emit
    super.emit(evt, e, ...args);

    // 阻止冒泡
    if (e instanceof Event && e.propagationStopped) {
      return;
    }

    if (PROPOGATE_EVENTS.indexOf(evt) >= 0) {
      let parent = this.cfg.parent;

      if (parent && !parent.removed && !parent.destroyed) {
        parent.emit(evt, e, ...args);
      }
    }
  }

  set(name: string, value: any) {
    if (name === 'zIndex' && this._beforeSetZIndex) {
      this._beforeSetZIndex(value);
    }
    if (name === 'loading' && this._beforeSetLoading) {
      this._beforeSetLoading(value);
    }
    this.cfg[name] = value;
    return this;
  }

  // deprecated
  setSilent(name: string, value: any) {
    this.cfg[name] = value;
  }

  get(name: string) {
    return this.cfg[name];
  }

  show() {
    this.cfg.visible = true;
    return this;
  }

  hide() {
    this.cfg.visible = false;
    return this;
  }

  remove(destroy?: boolean, delayRemove?: boolean) {
    const cfg = this.cfg;
    const parent = cfg.parent;
    const el = cfg.el;
    // 因为 this.destroy 的时候，是清空 cfg，那么取到的 children 为 undefined，导致报错
    // 场景：动画异步启动之后，再调用 group.destroy()，就会导致下一帧动画报错（Util.pull）
    if (parent && !parent.destroyed) {
      Util.pull(parent.get('children'), this);
    }
    if (el) {
      if (delayRemove) {
        parent && parent.cfg.tobeRemoved.push(el);
      } else {
        el.parentNode.removeChild(el);
      }
    }
    if (destroy || destroy === undefined) {
      this.destroy();
    }
    return this;
  }

  destroy() {
    if (this.destroyed) {
      return;
    }
    this.off(); // 移除所有的事件
    this.cfg = {};
    this.destroyed = true;
  }

  getParent() {
    return this.cfg.parent;
  }

  getDefaultCfg() {
    return {};
  }

  toFront() {
    const cfg = this.cfg;
    const parent = cfg.parent;
    if (!parent) {
      return;
    }
    const children = parent.cfg.children;
    const el = cfg.el;
    const index = children.indexOf(this);
    children.splice(index, 1);
    children.push(this);
    if (el) {
      el.parentNode.removeChild(el);
      cfg.el = null;
    }
  }

  toBack() {
    const cfg = this.cfg;
    const parent = cfg.parent;
    if (!parent) {
      return;
    }
    const children = parent.cfg.children;
    const el = cfg.el;
    const index = children.indexOf(this);
    children.splice(index, 1);
    children.unshift(this);
    if (el) {
      const parentNode = el.parentNode;
      parentNode.removeChild(el);
      parentNode.insertBefore(el, parentNode.firstChild);
    }
  }

  _beforeSetZIndex(zIndex: number) {
    const parent = this.cfg.parent;
    this.cfg.zIndex = zIndex;
    if (!Util.isNil(parent)) {
      parent.sort();
    }
    const el = this.cfg.el;
    if (el) {
      const children = parent.cfg.children;
      const index = children.indexOf(this);
      const parentNode = el.parentNode;
      parentNode.removeChild(el);
      if (index === children.length - 1) {
        parentNode.appendChild(el);
      } else {
        parentNode.insertBefore(el, parentNode.childNodes[index]);
      }
    }
    return zIndex;
  }

  _beforeSetLoading(loading: boolean) {}

  setZIndex(zIndex: number) {
    this.cfg.zIndex = zIndex;
    return this._beforeSetZIndex(zIndex);
  }

  clone() {
    return Util.clone(this);
  }

  getBBox() {};
}

export default Base;
