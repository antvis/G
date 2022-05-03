import { singleton } from 'mana-syringe';
import type { DisplayObject } from '../../display-objects';
import type { CSSProperty } from '../CSSProperty';

@singleton()
export class CSSPropertyOffsetPath implements Partial<CSSProperty<DisplayObject, DisplayObject>> {
  calculator(
    name: string,
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

    return newOffsetPath;
  }
}
