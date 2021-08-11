import type { DisplayObject } from '../DisplayObject';
import type { StylePropertyHandler } from '.';
import { injectable } from 'inversify';

/**
 * @see /zh/docs/api/animation#%E8%B7%AF%E5%BE%84%E5%8A%A8%E7%94%BB
 */
@injectable()
export class OffsetPath implements StylePropertyHandler<DisplayObject, DisplayObject> {
  update(oldOffsetPath: DisplayObject, newOffsetPath: DisplayObject, object: DisplayObject) {
    // clear ref to old clip path
    if (oldOffsetPath
      && oldOffsetPath !== newOffsetPath
      && oldOffsetPath.style.offsetPathTargets
    ) {
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
}