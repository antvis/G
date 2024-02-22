import type {
  CSSRGB,
  DisplayObject,
  ParsedCircleStyleProps,
} from '@antv/g-lite';
import { Instanced, InstancedPathDrawcall, SDFDrawcall } from '../drawcalls';
import { Batch } from './Batch';

/**
 * Use 2 meshes:
 * * SDF to draw fill & simple stroke if needed.
 * * InstancedPathDrawcall to draw stroke separately.
 */
export class CircleRenderer extends Batch {
  getDrawcallCtors(object: DisplayObject) {
    const drawcalls: (typeof Instanced)[] = [];
    const { fill } = object.parsedStyle as ParsedCircleStyleProps;
    if (fill && !(fill as CSSRGB).isNone) {
      drawcalls.push(SDFDrawcall);
    }
    if (this.needDrawStrokeSeparately(object)) {
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
