import { IContainer, IElement, IGroup, IShape } from '@antv/g-base/lib/interfaces';
import { isAllowCapture } from '@antv/g-base/lib/util/util';
import { multiplyVec2, invert } from '@antv/g-base/lib/util/matrix';

function invertFromMatrix(v: number[], matrix: number[]): number[] {
  if (matrix) {
    const invertMatrix = invert(matrix);
    return multiplyVec2(invertMatrix, v);
  }
  return v;
}

function getRefXY(element: IElement, x: number, y: number) {
  // @ts-ignore
  const totalMatrix = element.getTotalMatrix();
  if (totalMatrix) {
    const [refX, refY] = invertFromMatrix([x, y, 1], totalMatrix);
    return [refX, refY];
  }
  return [x, y];
}
// 拾取前的检测，只有通过检测才能继续拾取
function preTest(element: IElement, x: number, y: number) {
  // @ts-ignore
  if (element.isGroup() && element.isCanvas()) {
    return true;
  }
  // 不允许被拾取，则返回 null
  // @ts-ignore
  if (!isAllowCapture(element) && element.cfg.isInView === false) {
    return false;
  }
  if (element.cfg.clipShape) {
    // 如果存在 clip
    const [refX, refY] = getRefXY(element, x, y);
    if (element.isClipped(refX, refY)) {
      return false;
    }
  }
  // @ts-ignore ，这个地方调用过于频繁
  const bbox = element.cfg.cacheCanvasBBox || element.getCanvasBBox();
  if (!(x >= bbox.minX && x <= bbox.maxX && y >= bbox.minY && y <= bbox.maxY)) {
    return false;
  }
  return true;
}
export function getShape(container: IContainer, x: number, y: number) {
  // 没有通过检测，则返回 null
  if (!preTest(container, x, y)) {
    return null;
  }
  let shape = null;
  const children = container.getChildren();
  const count = children.length;
  for (let i = count - 1; i >= 0; i--) {
    const child = children[i];
    if (child.isGroup()) {
      shape = getShape(child as IGroup, x, y);
    } else if (preTest(child, x, y)) {
      const curShape = child as IShape;
      const [refX, refY] = getRefXY(child, x, y);
      // @ts-ignore
      if (curShape.isInShape(refX, refY)) {
        shape = child;
      }
    }
    if (shape) {
      break;
    }
  }
  return shape;
}
