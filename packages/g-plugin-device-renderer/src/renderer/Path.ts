/**
 * @see https://www.khronos.org/assets/uploads/developers/presentations/Crazy_Panda_How_to_draw_lines_in_WebGL.pdf
 */
import type { CSSRGB, DisplayObject, ParsedBaseStyleProps } from '@antv/g-lite';
import { Shape } from '@antv/g-lite';
import {
  FillMesh,
  InstancedLineMesh,
  InstancedPathMesh,
  LineMesh,
} from '../meshes';
import { Batch } from './Batch';

/**
 * Use the following perf enhancements:
 * * Downgrading the "simple" Path / Polyline to {@link InstancedLineMesh}, e.g. 'M 0 0 L 100 0'
 * * Merge the Path into {@link InstancedPathMesh} which contains only one curve command, e.g 'M 0 0 Q 10 10 100 100'
 * @see https://github.com/antvis/G/issues/1113
 */
export class PathRenderer extends Batch {
  meshes = [FillMesh, LineMesh, InstancedLineMesh, InstancedPathMesh];

  shouldSubmitRenderInst(object: DisplayObject, index: number) {
    const { fill, stroke, opacity, strokeOpacity, lineDash, lineWidth } =
      object.parsedStyle as ParsedBaseStyleProps;
    const nodeName = object.nodeName;
    const hasStroke = stroke && !(stroke as CSSRGB).isNone;
    const hasDash =
      lineDash && lineDash.length && lineDash.every((item) => item !== 0);
    const isLine = InstancedLineMesh.isLine(object);
    const isOneCommandCurve = InstancedPathMesh.isOneCommandCurve(object);

    object.renderable.proxyNodeName = isLine ? Shape.LINE : null;

    // Polyline don't need fill
    if (
      index === 0 &&
      (isOneCommandCurve ||
        object.nodeName === Shape.POLYLINE ||
        (fill as CSSRGB).isNone)
    ) {
      return false;
    }

    // stroke mesh
    if (index === 1) {
      if (
        isLine ||
        isOneCommandCurve ||
        strokeOpacity === 0 ||
        opacity === 0 ||
        lineWidth === 0 ||
        !hasStroke
      ) {
        return false;
      }

      if (nodeName === Shape.CIRCLE || nodeName === Shape.ELLIPSE) {
        // @see https://github.com/antvis/g/issues/824
        return hasDash;
      }
    }

    // use Line for simple Path
    if (index === 2) {
      return isLine;
    }

    if (index === 3) {
      return isOneCommandCurve;
    }

    return true;
  }
}
