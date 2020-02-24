import { SimpleBBox } from '../types';
import { IShape } from '../interfaces';

export default function(shape: IShape): SimpleBBox {
  const attrs = shape.attr();
  const { x1, y1, x2, y2 } = attrs;
  const minX = Math.min(x1, x2);
  const minY = Math.min(y1, y2);
  return {
    x: minX,
    y: minY,
    width: Math.abs(x2 - x1),
    height: Math.abs(y2 - y1),
  };
}
