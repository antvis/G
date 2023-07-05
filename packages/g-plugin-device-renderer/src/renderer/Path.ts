/**
 * @see https://www.khronos.org/assets/uploads/developers/presentations/Crazy_Panda_How_to_draw_lines_in_WebGL.pdf
 */
import type {
  CSSRGB,
  DisplayObject,
  ParsedBaseStyleProps,
  ParsedPathStyleProps,
  ParsedPolylineStyleProps,
} from '@antv/g-lite';
import { Shape } from '@antv/g-lite';
import {
  FillMesh,
  InstancedLineMesh,
  InstancedPathMesh,
  LineMesh,
} from '../meshes';
import { Batch } from './Batch';

/**
 * Try downgrading the "simple" Path / Polyline to InstancedLine.
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
    const isLine = this.isLine(object);
    const isOneCommandPath = this.isOneCommandPath(object);

    object.renderable.proxyNodeName = isLine ? Shape.LINE : null;

    // Polyline don't need fill
    if (
      index === 0 &&
      (isOneCommandPath ||
        object.nodeName === Shape.POLYLINE ||
        (fill as CSSRGB).isNone)
    ) {
      return false;
    }

    // stroke mesh
    if (index === 1) {
      if (
        isLine ||
        isOneCommandPath ||
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
      return isOneCommandPath;
    }

    return true;
  }

  private isLine(object: DisplayObject) {
    if (object.nodeName === Shape.PATH) {
      const {
        path: { absolutePath },
      } = object.parsedStyle as ParsedPathStyleProps;

      // only contains M & L commands
      if (
        absolutePath.length === 2 &&
        absolutePath[0][0] === 'M' &&
        absolutePath[1][0] === 'L'
      ) {
        return true;
      }
    } else if (object.nodeName === Shape.POLYLINE) {
      const {
        points: { points },
      } = object.parsedStyle as ParsedPolylineStyleProps;
      const tangent =
        (points[1][0] - points[1][1]) / (points[0][0] - points[0][1]);
      for (let i = 1; i < points.length - 1; i++) {
        if (
          (points[i + 1][0] - points[i + 1][1]) /
            (points[i][0] - points[i][1]) !==
          tangent
        ) {
          return false;
        }
      }

      return true;
    }

    return false;
  }

  private isOneCommandPath(object: DisplayObject) {
    if (object.nodeName === Shape.PATH) {
      const {
        path: { absolutePath },
      } = object.parsedStyle as ParsedPathStyleProps;

      // only contains M & C commands
      if (
        absolutePath.length === 2 &&
        absolutePath[0][0] === 'M' &&
        absolutePath[1][0] === 'C'
      ) {
        return true;
      }
    }
    return false;
  }
}
