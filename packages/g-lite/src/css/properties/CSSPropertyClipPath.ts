import { inject, singleton } from 'mana-syringe';
import type { DisplayObject } from '../../display-objects';
import { SceneGraphService } from '../../services';
import { CSSKeywordValue } from '../cssom';
import { CSSProperty } from '../CSSProperty';
import { PropertySyntax } from '../interfaces';

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
@singleton({
  token: [
    {
      token: CSSProperty,
      named: PropertySyntax.CLIP_PATH,
    },
    {
      token: CSSProperty,
      named: PropertySyntax.TEXT_PATH,
    },
  ],
})
export class CSSPropertyClipPath implements Partial<CSSProperty<DisplayObject, DisplayObject>> {
  constructor(
    @inject(SceneGraphService)
    private sceneGraphService: SceneGraphService,
  ) {}

  calculator(
    name: string,
    oldClipPath: DisplayObject,
    newClipPath: DisplayObject,
    object: DisplayObject,
  ) {
    // unset
    if (newClipPath instanceof CSSKeywordValue) {
      newClipPath = null;
    }

    const pathTargetsName = name === 'clipPath' ? 'clipPathTargets' : 'textPathTargets';

    // clear ref to old clip path
    if (oldClipPath && oldClipPath !== newClipPath && oldClipPath.parsedStyle[pathTargetsName]) {
      const index = oldClipPath.parsedStyle[pathTargetsName].indexOf(object);
      oldClipPath.parsedStyle[pathTargetsName].splice(index, 1);
    }

    if (newClipPath) {
      if (!newClipPath.parsedStyle[pathTargetsName]) {
        newClipPath.parsedStyle[pathTargetsName] = [];
      }
      newClipPath.parsedStyle[pathTargetsName].push(object);
    }

    // should affect children
    object.forEach((leaf) => {
      if (leaf.childNodes.length === 0) {
        this.sceneGraphService.dirtifyToRoot(leaf);
      }
    });

    return newClipPath;
  }
}
