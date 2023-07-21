/**
 * @see https://www.khronos.org/assets/uploads/developers/presentations/Crazy_Panda_How_to_draw_lines_in_WebGL.pdf
 */
import type { CSSRGB, DisplayObject, ParsedBaseStyleProps } from '@antv/g-lite';
import { Shape } from '@antv/g-lite';
import {
  InstancedFillMesh,
  InstancedLineMesh,
  InstancedPathMesh,
} from '../meshes';
import { Batch } from './Batch';

/**
 * Use the following perf enhancements:
 * * Downgrading the "simple" Path / Polyline to {@link InstancedLineMesh}, e.g. 'M 0 0 L 100 0'
 * * Merge the Path into {@link InstancedPathMesh} which contains only one curve command, e.g 'M 0 0 Q 10 10 100 100'
 * @see https://github.com/antvis/G/issues/1113
 */
export class PathRenderer extends Batch {
  meshes = [InstancedFillMesh, InstancedLineMesh, InstancedPathMesh];

  shouldSubmitRenderInst(object: DisplayObject, index: number) {
    const { fill, stroke, opacity, strokeOpacity, lineWidth } =
      object.parsedStyle as ParsedBaseStyleProps;
    const hasStroke = stroke && !(stroke as CSSRGB).isNone;
    const isLine = InstancedLineMesh.isLine(object);

    object.renderable.proxyNodeName = isLine ? Shape.LINE : null;

    // Polyline don't need fill
    if (
      index === 0 &&
      (object.nodeName === Shape.POLYLINE || (fill as CSSRGB).isNone)
    ) {
      return false;
    }

    // use Line for simple Path
    if (index === 1) {
      return isLine;
    }

    if (index === 2) {
      if (
        isLine ||
        strokeOpacity === 0 ||
        opacity === 0 ||
        lineWidth === 0 ||
        !hasStroke
      ) {
        return false;
      }
      return true;
    }

    return true;
  }
}
