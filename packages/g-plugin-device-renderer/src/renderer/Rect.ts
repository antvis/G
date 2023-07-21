import type { CSSRGB, DisplayObject, ParsedRectStyleProps } from '@antv/g-lite';
import { InstancedFillMesh, InstancedPathMesh, SDFMesh } from '../meshes';
import { Batch } from './Batch';

/**
 * Use 2 meshes:
 * * For simple Rect with fill & simple stroke, we use SDFMesh to draw which has a better performance.
 * * FillMesh & LineMesh to draw rounded rect with different radius.
 */
export class RectRenderer extends Batch {
  meshes = [SDFMesh, InstancedFillMesh, InstancedPathMesh];

  shouldSubmitRenderInst(object: DisplayObject, index: number) {
    const { radius } = object.parsedStyle as ParsedRectStyleProps;
    const hasDifferentRadius =
      radius && radius.length && radius.some((r) => r !== radius[0]);

    if (index === 0) {
      const { fill } = object.parsedStyle as ParsedRectStyleProps;
      if ((fill as CSSRGB).isNone || hasDifferentRadius) {
        return false;
      }
    }

    if (index === 1) {
      return hasDifferentRadius;
    }

    if (index === 2) {
      return hasDifferentRadius
        ? hasDifferentRadius
        : this.needDrawStrokeSeparately(object);
    }

    return true;
  }

  /**
   * need an additional mesh to draw stroke:
   * 1. strokeOpacity < 1
   * 2. lineDash used
   * 3. stroke is not 'none'
   */
  private needDrawStrokeSeparately(object: DisplayObject) {
    const { fill, stroke, lineDash, lineWidth, strokeOpacity } =
      object.parsedStyle as ParsedRectStyleProps;

    const hasFill = fill && !(fill as CSSRGB).isNone;
    const hasStroke = stroke && !(stroke as CSSRGB).isNone;
    const hasDash =
      lineDash && lineDash.length && lineDash.every((item) => item !== 0);

    return (
      !hasFill || (hasStroke && lineWidth > 0 && (strokeOpacity < 1 || hasDash))
    );
  }
}
