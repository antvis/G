import { AbstractCanvas } from '@antv/g-base';
import { ChangeType } from '@antv/g-base/lib/types';
import { IElement } from './interfaces';
import { applyClipChildren, drawPathChildren } from './util/draw';
import { setTransform, setClip } from './util/svg';
import { sortDom } from './util/dom';
import EventController from '@antv/g-base/lib/event/event-contoller';
import * as Shape from './shape';
import Group from './group';
import Defs from './defs';

class Canvas extends AbstractCanvas {
  constructor(cfg) {
    super({
      ...cfg,
      autoDraw: true,
      // 设置渲染引擎为 canvas，只读属性
      renderer: 'svg',
    });
  }

  // 覆盖基类中的 set 方法
  set(name, value) {
    // autoDraw 不可修改，始终为 true
    // TODO: 应该在控制台给出 Warning 提示，引导用户避免这种用法。需要在 @antv/util 中提供通用的 warning 方法，便于在其他 antv 项目中使用
    if (name === 'autoDraw') {
      this.cfg[name] = true;
    } else {
      super.set(name, value);
    }
  }

  /**
   * 一些方法调用会引起画布变化
   * @param {ChangeType} changeType 改变的类型
   */
  onCanvasChange(changeType: ChangeType) {
    const context = this.get('context');
    const el = this.get('el');
    if (changeType === 'sort') {
      const children = this.get('children');
      if (children && children.length) {
        sortDom(this, (a: IElement, b: IElement) => {
          return children.indexOf(a) - children.indexOf(b) ? 1 : 0;
        });
      }
    } else if (changeType === 'clear') {
      // el is null for canvas
      if (el) {
        el.innerHTML = '';
      }
    } else if (changeType === 'matrix') {
      setTransform(this);
    } else if (changeType === 'clip') {
      this.applyClip(context);
    } else if (changeType === 'changeSize') {
      el.setAttribute('width', `${this.get('width')}`);
      el.setAttribute('height', `${this.get('height')}`);
    }
  }

  getShapeBase() {
    return Shape;
  }

  getGroupBase() {
    return Group;
  }

  // 复写基类的方法生成标签
  createDom() {
    const element = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const context = new Defs(element);
    element.setAttribute('width', `${this.get('width')}`);
    element.setAttribute('height', `${this.get('height')}`);
    // 缓存 context 对象
    this.set('context', context);
    return element;
  }

  // 复写基类的 draw 方法
  draw() {
    const context = this.get('context');
    this.applyClip(context);
    this.drawPath(context);
  }

  applyClip(context: Defs) {
    const children = this.getChildren() as IElement[];
    setClip(this, context);
    if (children.length) {
      applyClipChildren(context, children);
    }
  }

  drawPath(context: Defs) {
    const children = this.getChildren() as IElement[];
    if (children.length) {
      drawPathChildren(context, children);
    }
  }

  // 覆盖基类中的 initEvents 方法
  initEvents() {
    const eventController = new EventController({
      canvas: this,
    });
    eventController.init();
    this.set('eventController', eventController);
  }

  // 覆盖基类中的 clearEvents 方法
  clearEvents() {
    const eventController = this.get('eventController');
    eventController.destroy();
  }
}

export default Canvas;
