import type { PathCommand, DisplayObject, ParsedBaseStyleProps } from '@antv/g';
import type { Options } from 'roughjs/bin/core';

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
    seed: seed || object.entity,
    fill: fill.toString(),
    stroke: stroke.toString(),
    strokeWidth: lineWidth?.value,
    fillStyle,
    fillWeight,
    hachureAngle,
    hachureGap,
    curveStepCount,
    curveFitting,
    strokeLineDash: lineDash?.map((d) => d.value) || [],
    strokeLineDashOffset: lineDashOffset?.value,
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

export function formatPath(value: PathCommand[], x: number, y: number) {
  const newValue = value
    .map((params) => {
      const command = params[0];

      switch (command) {
        case 'M':
          return `M ${params[1]! - x},${params[2]! - y}`;
        case 'L':
          return `L ${params[1]! - x},${params[2]! - y}`;
        case 'Q':
          return `Q ${params[1]! - x} ${params[2]! - y},${params[3]! - x} ${params[4]! - y}`;
        case 'C':
          return `C ${params[1]! - x} ${params[2]! - y},${params[3]! - x} ${params[4]! - y},${
            params[5]! - x
          } ${params[6]! - y}`;
        case 'A':
          return `A ${params[1]} ${params[2]} ${params[3]} ${params[4]} ${params[5]} ${
            params[6]! - x
          } ${params[7]! - y}`;
        case 'Z':
          return 'Z';
        default:
          break;
      }
    })
    .join(' ');
  if (~newValue.indexOf('NaN')) {
    return '';
  }
  return newValue;
}
