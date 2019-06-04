import { AbstractCanvas } from '@antv/g-base';
import { IElement } from '@antv/g-base/lib/interfaces';
import Shape from './shape/index';
import Group from './group';
import { each } from '@antv/util';
import { drawChildren } from './util/draw';

import { getPixelRatio } from './util/util';

class Canvas extends AbstractCanvas {

  getShapeBase() {
    return Shape;
  }

  getGroupBase() {
    return Group;
  }

  // 复写基类的方法生成标签
  createDom(): HTMLElement {
    const element = document.createElement('canvas');
    const pixelRatio = getPixelRatio();
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

  // 复写基类的 draw 方法
  draw() {
    const context = this.get('context');
    const children = this.getChildren();
    drawChildren(context, children);
  }
}

export default Canvas;
