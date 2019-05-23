import { AbstractCanvas } from '@antv/g-base';
import ShapeBase from './shape/base';
import Group from './group';

class Canvas extends AbstractCanvas {
  createDom(): HTMLElement {
    const element = document.createElement('canvas');
    return element;
  }

  getShapeBase() {
    return ShapeBase;
  }

  getGroupBase() {
    return Group;
  }
}

export default Canvas;
