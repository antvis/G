import type { DisplayObject } from '../display-objects/DisplayObject';
import { dirtifyToRoot } from '../services';

/**
 * @see /zh/docs/api/basic/display-object#clippath
 * @example
  const image = new Image({
    style: {
      width: 200,
      height: 200,
      clipPath: new Circle({
        style: {
          x: 100, // 处于被裁剪图形局部坐标系下
          y: 100,
          r: 50,
        },
      }),
    }
  });
 */
export function updateClipPath(
  oldClipPath: DisplayObject,
  newClipPath: DisplayObject,
  object: DisplayObject,
) {
  // clear ref to old clip path
  if (oldClipPath && oldClipPath !== newClipPath && oldClipPath.style.clipPathTargets) {
    const index = oldClipPath.style.clipPathTargets.indexOf(object);
    oldClipPath.style.clipPathTargets.splice(index, 1);
  }

  if (newClipPath) {
    if (!newClipPath.style.clipPathTargets) {
      newClipPath.style.clipPathTargets = [];
    }
    newClipPath.style.clipPathTargets.push(object);
  }

  dirtifyToRoot(object);
}
