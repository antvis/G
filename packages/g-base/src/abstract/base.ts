import EE from '@antv/event-emitter';
import { IBase } from '../interfaces';
import { mix } from '../util/util';
abstract class Base extends EE implements IBase {
  /**
   * @private
   * 内部属性，用于 get,set
   * @type {object}
   */
  cfg: object;

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
    super();
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
}

export default Base;
