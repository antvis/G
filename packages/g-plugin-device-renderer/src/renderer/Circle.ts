import type {
  CSSRGB,
  DisplayObject,
  ParsedCircleStyleProps,
} from '@antv/g-lite';
import { InstancedPathMesh, SDFMesh } from '../meshes';
import { Batch } from './Batch';

/**
 * Use 2 meshes:
 * * SDF to draw fill & simple stroke if needed.
 * * InstancedPathMesh to draw stroke separately.
 */
export class CircleRenderer extends Batch {
  meshes = [SDFMesh, InstancedPathMesh];

  shouldSubmitRenderInst(object: DisplayObject, index: number) {
    if (index === 0) {
      const { fill } = object.parsedStyle as ParsedCircleStyleProps;
      if ((fill as CSSRGB).isNone) {
        return false;
      }
    }

    if (index === 1) {
      return this.needDrawStrokeSeparately(object);
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
      object.parsedStyle as ParsedCircleStyleProps;

    const hasFill = fill && !(fill as CSSRGB).isNone;
    const hasStroke = stroke && !(stroke as CSSRGB).isNone;
    const hasDash =
      lineDash &&
      lineDash.length &&
      lineDash.every((item: number) => item !== 0);

    return (
      !hasFill || (hasStroke && lineWidth > 0 && (strokeOpacity < 1 || hasDash))
    );
  }
}
