import type { CSSRGB, DisplayObject, ParsedRectStyleProps } from '@antv/g-lite';
import {
  Instanced,
  InstancedFillDrawcall,
  InstancedPathDrawcall,
  SDFDrawcall,
} from '../drawcalls';
import { Batch } from './Batch';

/**
 * Use 2 meshes:
 * * For simple Rect with fill & simple stroke, we use SDFDrawcall to draw which has a better performance.
 * * FillMesh & LineMesh to draw rounded rect with different radius.
 */
export class RectRenderer extends Batch {
  getDrawcallCtors(object: DisplayObject) {
    const drawcalls: (typeof Instanced)[] = [];

    const { fill, radius } = object.parsedStyle as ParsedRectStyleProps;
    const hasDifferentRadius =
      radius && radius.length && radius.some((r) => r !== radius[0]);

    if (!((fill as CSSRGB)?.isNone || hasDifferentRadius)) {
      drawcalls.push(SDFDrawcall);
    }

    if (hasDifferentRadius) {
      drawcalls.push(InstancedFillDrawcall);
    }

    if (hasDifferentRadius || this.needDrawStrokeSeparately(object)) {
      drawcalls.push(InstancedPathDrawcall);
    }

    return drawcalls;
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
