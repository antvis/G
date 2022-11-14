import { CSSRGB, DisplayObject, ParsedBaseStyleProps } from '@antv/g-lite';
import type { CSSGradientValue, Pattern } from '@antv/g-lite';
import type { Options } from 'roughjs/bin/core';

export const SUPPORTED_ROUGH_OPTIONS = [
  'bowing',
  'roughness',
  'fill',
  'stroke',
  'lineWidth',
  'seed',
  'fillStyle',
  'fillWeight',
  'hachureAngle',
  'hachureGap',
  'curveStepCount',
  'curveFitting',
  'lineDash',
  'lineDashOffset',
  'fillLineDash',
  'fillLineDashOffset',
  'disableMultiStroke',
  'disableMultiStrokeFill',
  'simplification',
  'dashOffset',
  'dashGap',
  'zigzagOffset',
  'preserveVertices',
];

function mergeOpacity(color: CSSRGB | CSSGradientValue[] | Pattern, opacity: number) {
  // since rough.js doesn't support fill/strokeOpacity
  let colorString = color.toString();

  if (color instanceof CSSRGB) {
    if (opacity !== 1) {
      const { r, g, b, alpha } = color;
      colorString = `rgba(${r},${g},${b},${Number(alpha) * opacity})`;
    }
  }

  return colorString;
}

export function generateRoughOptions(object: DisplayObject) {
  const {
    fill,
    stroke,
    fillOpacity,
    strokeOpacity,
    bowing,
    roughness,
    lineWidth,
    seed,
    fillStyle,
    fillWeight,
    hachureAngle,
    hachureGap,
    curveStepCount,
    curveFitting,
    lineDash,
    lineDashOffset,
    fillLineDash,
    fillLineDashOffset,
    disableMultiStroke,
    disableMultiStrokeFill,
    simplification,
    dashOffset,
    dashGap,
    zigzagOffset,
    preserveVertices,
  } = object.parsedStyle as ParsedBaseStyleProps & Options;

  // @see https://github.com/rough-stuff/rough/wiki#options
  const options: Options = {
    bowing,
    roughness,
    // If seed is not defined, or set to 0, no seed is used when computing random values.
    // @see https://github.com/rough-stuff/rough/wiki#seed
    seed: seed || object.entity,
    fill: mergeOpacity(fill, fillOpacity),
    stroke: mergeOpacity(stroke, strokeOpacity),
    strokeWidth: lineWidth,
    fillStyle,
    fillWeight,
    hachureAngle,
    hachureGap,
    curveStepCount,
    curveFitting,
    strokeLineDash: lineDash || [],
    strokeLineDashOffset: lineDashOffset,
    fillLineDash,
    fillLineDashOffset,
    disableMultiStroke,
    disableMultiStrokeFill,
    simplification,
    dashOffset,
    dashGap,
    zigzagOffset,
    preserveVertices,
  };

  // remove all undefined values
  Object.keys(options).forEach((key) => {
    if (options[key] === undefined) {
      delete options[key];
    }
  });

  return options;
}
