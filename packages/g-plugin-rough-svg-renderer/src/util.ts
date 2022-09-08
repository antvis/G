import type { DisplayObject, ParsedBaseStyleProps } from '@antv/g';
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

export function generateRoughOptions(object: DisplayObject) {
  const {
    bowing,
    roughness,
    fill,
    stroke,
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
    fill: fill.toString(),
    stroke: stroke.toString(),
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
