import type { AbsoluteArray, CurveArray, PathArray } from '@antv/util';
import {
  clonePath,
  equalizeSegments,
  getDrawDirection,
  getRotatedCurve,
  isString,
  normalizePath,
  path2Curve,
  reverseCurve,
} from '@antv/util';
import type { ParsedPathStyleProps } from '../../display-objects';
import type { IElement } from '../../dom';
import { memoize } from '../../utils/memoize';
import {
  extractPolygons,
  getPathBBox,
  hasArcOrBezier,
  path2Segments,
  removeRedundantMCommand,
} from '../../utils/path';

const internalParsePath = (path: string | PathArray) => {
  // empty path
  if (path === '' || (Array.isArray(path) && path.length === 0)) {
    return {
      absolutePath: [],
      hasArc: false,
      segments: [],
      polygons: [],
      polylines: [],
      curve: null,
      totalLength: 0,
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
  } catch {
    absolutePath = normalizePath('');
    console.error(`[g]: Invalid SVG Path definition: ${path}`);
  }

  removeRedundantMCommand(absolutePath);

  const hasArc = hasArcOrBezier(absolutePath);

  const { polygons, polylines } = extractPolygons(absolutePath);

  // for later use
  const segments = path2Segments(absolutePath);

  // Only calculate bbox here since we don't need length now.
  const { x, y, width, height } = getPathBBox(segments, 0);

  return {
    absolutePath,
    hasArc,
    segments,
    polygons,
    polylines,
    // curve,
    // Delay the calculation of length.
    totalLength: 0,
    rect: {
      x: Number.isFinite(x) ? x : 0,
      y: Number.isFinite(y) ? y : 0,
      width: Number.isFinite(width) ? width : 0,
      height: Number.isFinite(height) ? height : 0,
    },
  };
};

const memoizedParsePath = memoize(internalParsePath);

export function parsePath(path: string | PathArray): ParsedPathStyleProps['d'] {
  return (
    isString(path) ? memoizedParsePath(path) : internalParsePath(path)
  ) as ParsedPathStyleProps['d'];
}

export function mergePaths(
  left: ParsedPathStyleProps['d'],
  right: ParsedPathStyleProps['d'],
  object?: IElement,
): [CurveArray, CurveArray, (b: CurveArray) => CurveArray] {
  let curve1 = left.curve;
  let curve2 = right.curve;
  if (!curve1 || curve1.length === 0) {
    // convert to curves to do morphing & picking later
    // @see http://thednp.github.io/kute.js/svgCubicMorph.html
    curve1 = path2Curve(left.absolutePath, false) as CurveArray;
    left.curve = curve1;
  }
  if (!curve2 || curve2.length === 0) {
    curve2 = path2Curve(right.absolutePath, false) as CurveArray;
    right.curve = curve2;
  }

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
