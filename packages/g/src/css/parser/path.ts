import type { AbsoluteArray, CurveArray } from '@antv/util';
import {
  clonePath,
  equalizeSegments,
  getDrawDirection,
  getPathBBoxTotalLength,
  getRotatedCurve,
  normalizePath,
  path2Curve,
  reverseCurve,
} from '@antv/util';
// import { memoize } from 'lodash-es';
import type { DisplayObject, ParsedPathStyleProps } from '../../display-objects';
import type { IElement } from '../../dom';
import { Rectangle } from '../../shapes';
import { extractPolygons, hasArcOrBezier, path2Segments } from '../../utils';

export function parsePath(path: string, object: DisplayObject): ParsedPathStyleProps['path'] {
  let absolutePath: AbsoluteArray;
  try {
    absolutePath = normalizePath(path);
  } catch (e) {
    absolutePath = normalizePath('');
    console.error(`[g]: Invalid SVG Path definition: ${path}`);
  }

  const hasArc = hasArcOrBezier(absolutePath);

  const { polygons, polylines } = extractPolygons(absolutePath);

  // convert to curves to do morphing & picking later
  // @see http://thednp.github.io/kute.js/svgCubicMorph.html
  const [curve, zCommandIndexes] = path2Curve(absolutePath, true) as [CurveArray, number[]];

  // for later use
  const segments = path2Segments(curve);
  const { x, y, width, height, length } = getPathBBoxTotalLength(absolutePath);

  if (object) {
    object.parsedStyle.defX = x;
    object.parsedStyle.defY = y;
  }

  return {
    absolutePath,
    hasArc,
    segments,
    polygons,
    polylines,
    curve,
    totalLength: length,
    zCommandIndexes,
    rect: new Rectangle(x, y, width, height),
  };
}

export function mergePaths(
  left: ParsedPathStyleProps['path'],
  right: ParsedPathStyleProps['path'],
  object: IElement,
): [CurveArray, CurveArray, (b: CurveArray) => CurveArray] {
  const curve1 = left.curve;
  const curve2 = right.curve;
  let curves = [curve1, curve2];
  if (curve1.length !== curve2.length) {
    curves = equalizeSegments(curve1, curve2);
  }

  const curve0 =
    getDrawDirection(curves[0]) !== getDrawDirection(curves[1])
      ? reverseCurve(curves[0])
      : (clonePath(curves[0]) as CurveArray);

  return [
    curve0,
    getRotatedCurve(curves[1], curve0) as CurveArray,
    (pathArray: CurveArray) => {
      // need converting to path string?
      return pathArray;
    },
  ];
}
