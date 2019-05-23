import { AbstractShape } from '@antv/g-base';

class ShapeBase extends AbstractShape {
  calculateBBox() {
    return  {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
      width: 0,
      height: 0,
    };
  }
}

export default ShapeBase;
