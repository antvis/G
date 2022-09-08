import type { AbsoluteArray, CurveArray, PathArray } from '@antv/util';
import {
  clonePath,
  equalizeSegments,
  getDrawDirection,
  getPathBBox,
  // getPathBBoxTotalLength,
  getRotatedCurve,
  isString,
  memoize,
  normalizePath,
  path2Curve,
  reverseCurve,
} from '@antv/util';
import type { DisplayObject, ParsedPathStyleProps } from '../../display-objects';
import type { IElement } from '../../dom';
import { extractPolygons, hasArcOrBezier, path2Segments } from '../../utils';

const internalParsePath = (path: string | PathArray) => {
  // empty path
  if (path === '' || (Array.isArray(path) && path.length === 0)) {
    return {
      absolutePath: [],
      hasArc: false,
      segments: [],
      polygons: [],
      polylines: [],
      curve: [],
      totalLength: 0,
      zCommandIndexes: [],
      rect: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
    };
  }

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

  // Only calculate bbox here since we don't need length now.
  const { x, y, width, height } = getPathBBox(absolutePath);
  // const { x, y, width, height, length } = getPathBBoxTotalLength(absolutePath);

  return {
    absolutePath,
    hasArc,
    segments,
    polygons,
    polylines,
    curve,
    // Delay the calculation of length.
    // totalLength: length,
    totalLength: 0,
    zCommandIndexes,
    // rect: new Rectangle(
    //   Number.isFinite(x) ? x : 0,
    //   Number.isFinite(y) ? y : 0,
    //   Number.isFinite(width) ? width : 0,
    //   Number.isFinite(height) ? height : 0,
    // ),
    rect: {
      x: Number.isFinite(x) ? x : 0,
      y: Number.isFinite(y) ? y : 0,
      width: Number.isFinite(width) ? width : 0,
      height: Number.isFinite(height) ? height : 0,
    },
  };
};

const memoizedParsePath = memoize(internalParsePath);

export function parsePath(
  path: string | PathArray,
  object: DisplayObject,
): ParsedPathStyleProps['path'] {
  const result = (
    isString(path) ? memoizedParsePath(path) : internalParsePath(path)
  ) as ParsedPathStyleProps['path'];

  if (object) {
    object.parsedStyle.defX = result.rect.x;
    object.parsedStyle.defY = result.rect.y;
  }

  return result;
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
