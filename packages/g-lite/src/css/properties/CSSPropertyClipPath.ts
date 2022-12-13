import { runtime } from '../../global-runtime';
import type { DisplayObject } from '../../display-objects';
import { CSSKeywordValue } from '../cssom';
import type { CSSProperty } from '../CSSProperty';

/**
 * clipPath / textPath / offsetPath
 */
export class CSSPropertyClipPath
  implements Partial<CSSProperty<DisplayObject, DisplayObject>>
{
  calculator(
    name: string,
    oldPath: DisplayObject,
    newPath: DisplayObject,
    object: DisplayObject,
  ) {
    // unset
    if (newPath instanceof CSSKeywordValue) {
      newPath = null;
    }

    runtime.sceneGraphService.updateDisplayObjectDependency(
      name,
      oldPath,
      newPath,
      object,
    );

    if (name === 'clipPath') {
      // should affect children
      object.forEach((leaf) => {
        if (leaf.childNodes.length === 0) {
          runtime.sceneGraphService.dirtifyToRoot(leaf);
        }
      });
    }

    return newPath;
  }
}
