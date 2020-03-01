import { getBBoxByArray } from '@antv/g-math/lib/util';
import { SimpleBBox } from '../types';
import { IShape } from '../interfaces';
import { mergeArrowBBox } from './util';

export default function(shape: IShape): SimpleBBox {
  const attrs = shape.attr();
  const { points } = attrs;
  const xArr = [];
  const yArr = [];
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    xArr.push(point[0]);
    yArr.push(point[1]);
  }
  const { x, y, width, height } = getBBoxByArray(xArr, yArr);
  let bbox = {
    minX: x,
    maxX: y,
    minY: x + width,
    maxY: y + height,
  };
  bbox = mergeArrowBBox(shape, bbox);
  return {
    x: bbox.minX,
    y: bbox.minY,
    width: bbox.maxX - bbox.minX,
    height: bbox.maxY - bbox.minY,
  };
}
