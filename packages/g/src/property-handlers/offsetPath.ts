import type { DisplayObject } from '../display-objects/DisplayObject';

/**
 * @see /zh/docs/api/animation#%E8%B7%AF%E5%BE%84%E5%8A%A8%E7%94%BB
 */
export function updateOffsetPath(
  oldOffsetPath: DisplayObject,
  newOffsetPath: DisplayObject,
  object: DisplayObject,
) {
  // clear ref to old clip path
  if (oldOffsetPath && oldOffsetPath !== newOffsetPath && oldOffsetPath.style.offsetPathTargets) {
    const index = oldOffsetPath.style.offsetPathTargets.indexOf(object);
    oldOffsetPath.style.offsetPathTargets.splice(index, 1);
  }

  if (newOffsetPath) {
    if (!newOffsetPath.style.offsetPathTargets) {
      newOffsetPath.style.offsetPathTargets = [];
    }
    newOffsetPath.style.offsetPathTargets.push(object);
  }
}
