import { AbstractCanvas } from '@antv/g-base';
import { toString } from '@antv/util';
import { drawChildren } from './util/draw';
import Shape from './shape';
import Group from './group';
import Defs from './defs';

class Canvas extends AbstractCanvas {
  constructor(cfg) {
    super(cfg);
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
    element.setAttribute('width', toString(this.get('width')));
    element.setAttribute('height', toString(this.get('height')));
    // 缓存 context 对象
    this.set('context', context);
    return element;
  }

  // 复写基类的 draw 方法
  draw() {
    const context = this.get('context');
    const children = this.getChildren();
    drawChildren(context, children);
  }
}

export default Canvas;
