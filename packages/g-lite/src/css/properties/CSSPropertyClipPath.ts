import type { DisplayObject } from '../../display-objects';
import type { GlobalRuntime } from '../../global-runtime';
import type { CSSProperty } from '../CSSProperty';
import { CSSKeywordValue } from '../cssom';

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
    runtime: GlobalRuntime,
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
