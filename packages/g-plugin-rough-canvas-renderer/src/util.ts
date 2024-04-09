import { isCSSRGB } from '@antv/g-lite';
import type {
  CSSRGB,
  CSSGradientValue,
  DisplayObject,
  ParsedBaseStyleProps,
  Pattern,
} from '@antv/g-lite';
import type { Options } from 'roughjs/bin/core';

function mergeOpacity(
  color: CSSRGB | CSSGradientValue[] | Pattern,
  opacity: number,
) {
  // since rough.js doesn't support fill/strokeOpacity
  let colorString = color.toString();

  if (isCSSRGB(color)) {
    if (opacity !== 1) {
      const { r, g, b, alpha } = color;
      colorString = `rgba(${r},${g},${b},${Number(alpha) * opacity})`;
    }
  }

  return colorString;
}

/**
 * When the lineWidth is 0, the rough.js will render too many strokes which has a bad perf.
 */
const MIN_STROKE_WIDTH = 0.1;

export function generateRoughOptions(object: DisplayObject) {
  const {
    fill,
    stroke,
    fillOpacity = 1,
    strokeOpacity = 1,
    lineWidth = 1,
    bowing,
    roughness,
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
    seed: seed || object.entity,
    fill: fill ? mergeOpacity(fill, fillOpacity) : undefined,
    stroke: stroke ? mergeOpacity(stroke, strokeOpacity) : 'none',
    strokeWidth: lineWidth === 0 ? MIN_STROKE_WIDTH : lineWidth,
    fillStyle,
    fillWeight,
    hachureAngle,
    hachureGap,
    curveStepCount,
    curveFitting,
    strokeLineDash: lineDash,
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
