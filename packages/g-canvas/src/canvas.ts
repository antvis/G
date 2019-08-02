import { AbstractCanvas } from '@antv/g-base';
import { IElement } from '@antv/g-base/lib/interfaces';
import Shape from './shape/index';
import Group from './group';
import { drawChildren } from './util/draw';

import { getPixelRatio, each } from './util/util';

class Canvas extends AbstractCanvas {
  getShapeBase() {
    return Shape;
  }

  getGroupBase() {
    return Group;
  }

  getPixelRatio() {
    return this.get('pixelRatio') || getPixelRatio();
  }

  // 复写基类的方法生成标签
  createDom(): HTMLElement {
    const element = document.createElement('canvas');
    const pixelRatio = this.getPixelRatio();
    const context = element.getContext('2d');
    if (pixelRatio > 1) {
      context.scale(pixelRatio, pixelRatio);
    }

    element.width = pixelRatio * this.get('width');
    element.height = pixelRatio * this.get('height');
    // 缓存 context 对象
    this.set('context', context);
    return element;
  }

  clear() {
    super.clear();
    const context = this.get('context');
    const element = this.get('el');
    context.clearRect(0, 0, element.width, element.height);
  }

  // 复写基类的 draw 方法
  draw() {
    const context = this.get('context');
    const children = this.getChildren();
    drawChildren(context, children);
  }
}

export default Canvas;
