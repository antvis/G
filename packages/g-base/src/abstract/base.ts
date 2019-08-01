import { IBase, IObservable } from '../interfaces';
import { removeFromArray, mix, isFunction } from '../util/util';
abstract class Base implements IBase, IObservable {
  /**
   * @private
   * 内部属性，用于 get,set
   * @type {object}
   */
  cfg: object;
  /**
   * @private
   * 事件集合
   * @type {object}
   */
  events: object = {};

  /**
   * 是否被销毁
   * @type {boolean}
   */
  destroyed: boolean = false;

  /**
   * @protected
   * 默认的配置项
   * @returns {object} 默认的配置项
   */
  getDefaultCfg() {
    return {};
  }

  constructor(cfg) {
    const defaultCfg = this.getDefaultCfg();
    this.cfg = mix(defaultCfg, cfg);
  }

  // 实现接口的方法
  get(name) {
    return this.cfg[name];
  }
  // 实现接口的方法
  set(name, value) {
    this.cfg[name] = value;
  }

  // 实现接口的方法
  destroy() {
    this.cfg = {
      destroyed: true,
    };
    this.off();
    this.destroyed = true;
  }

  // 实现 IObservable
  on(eventName: string, callback: Function) {
    if (!isFunction(callback)) {
      throw new Error('listener should be a function');
    }
    if (!this.events) {
      this.events = {};
    }
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
  }

  off(eventName?: string, callback?: Function) {
    if (!eventName) {
      // evt 为空全部清除
      this.events = {};
    } else {
      if (!callback) {
        // evt 存在，callback 为空，清除事件所有方法
        delete this.events[eventName];
      } else {
        // evt 存在，callback 存在，清除匹配的
        const events = this.events[eventName] || [];
        removeFromArray(events, callback);
      }
    }
  }

  emit(eventName: string, ...args: any[]) {
    this.trigger(eventName, args);
  }

  trigger(eventName: string, ...args: any[]) {
    const events = this.events[eventName] || [];
    const length = events.length;
    for (let i = 0; i < length; i++) {
      const callback = events[i];
      callback.apply(this, args);
    }
  }
}

export default Base;
