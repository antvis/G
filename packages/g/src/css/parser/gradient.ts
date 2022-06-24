import {
  AngularNode,
  ColorStop,
  colorStopToString,
  DirectionalNode,
  isNil,
  isString,
  memoize,
  parseGradient as parse,
  PositionNode,
} from '../../utils';
import type { RadialGradient } from '../cssom';
import { CSSGradientValue, GradientType } from '../cssom';
import type { Pattern } from './color';

const regexLG = /^l\s*\(\s*([\d.]+)\s*\)\s*(.*)/i;
const regexRG = /^r\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)\s*(.*)/i;
const regexPR = /^p\s*\(\s*([axyn])\s*\)\s*(.*)/i;
const regexColorStop = /[\d.]+:(#[^\s]+|[^\)]+\))/gi;

function spaceColorStops(colorStops: ColorStop[]) {
  const length = colorStops.length;
  colorStops[length - 1].length = colorStops[length - 1].length ?? {
    type: '%',
    value: '100',
  };
  if (length > 1) {
    colorStops[0].length = colorStops[0].length ?? {
      type: '%',
      value: '0',
    };
  }

  let previousIndex = 0;
  let previousOffset = Number(colorStops[0].length.value);
  for (let i = 1; i < length; i++) {
    const offset = colorStops[i].length?.value;
    if (!isNil(offset) && !isNil(previousOffset)) {
      for (let j = 1; j < i - previousIndex; j++)
        colorStops[previousIndex + j].length = {
          type: '%',
          value: `${
            previousOffset + ((Number(offset) - previousOffset) * j) / (i - previousIndex)
          }`,
        };
      previousIndex = i;
      previousOffset = Number(offset);
    }
  }
}

// The position of the gradient line's starting point.
// different from CSS side(to top) @see https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/linear-gradient#values
const SideOrCornerToDegMap: Record<DirectionalNode['value'], number> = {
  left: 270 - 90,
  top: 0 - 90,
  bottom: 180 - 90,
  right: 90 - 90,
  'left top': 315 - 90,
  'top left': 315 - 90,
  'left bottom': 225 - 90,
  'bottom left': 225 - 90,
  'right top': 45 - 90,
  'top right': 45 - 90,
  'right bottom': 135 - 90,
  'bottom right': 135 - 90,
};

const angleToDeg = memoize((orientation: DirectionalNode | AngularNode) => {
  let angle: number;
  if (orientation.type === 'angular') {
    angle = Number(orientation.value);
  } else {
    angle = SideOrCornerToDegMap[orientation.value] || 0;
  }
  return angle;
});

const positonToPercentage = memoize((position: PositionNode) => {
  let cx = 0.5;
  let cy = 0.5;
  if (position?.type === 'position') {
    const { x, y } = position.value;
    if (x?.type === 'position-keyword') {
      if (x.value === 'left') {
        cx = 0;
      } else if (x.value === 'center') {
        cx = 0.5;
      } else if (x.value === 'right') {
        cx = 1;
      } else if (x.value === 'top') {
        cy = 0;
      } else if (x.value === 'bottom') {
        cy = 1;
      }
    }

    if (y?.type === 'position-keyword') {
      if (y.value === 'left') {
        cx = 0;
      } else if (y.value === 'center') {
        cy = 0.5;
      } else if (y.value === 'right') {
        cx = 1;
      } else if (y.value === 'top') {
        cy = 0;
      } else if (y.value === 'bottom') {
        cy = 1;
      }
    }

    if (x?.type === '%') {
      cx = Number(x.value) / 100;
    }
    if (y?.type === '%') {
      cy = Number(x.value) / 100;
    }
  }

  return { cx, cy };
});

export const parseGradient = memoize((colorStr: string) => {
  if (colorStr.indexOf('linear') > -1 || colorStr.indexOf('radial') > -1) {
    const ast = parse(colorStr);
    return ast.map(({ type, orientation, colorStops }) => {
      spaceColorStops(colorStops);
      const steps = colorStops.map<[number, string]>((colorStop) => {
        // TODO: only support % for now, should calc percentage of axis length when using px/em
        return [Number(colorStop.length.value) / 100, colorStopToString(colorStop)];
      });
      if (type === 'linear-gradient') {
        return new CSSGradientValue(GradientType.LinearGradient, {
          angle: orientation ? angleToDeg(orientation as DirectionalNode | AngularNode) : 0,
          steps,
          hash: colorStr,
        });
      } else if (type === 'radial-gradient') {
        if (!orientation) {
          orientation = [
            {
              type: 'shape',
              value: 'circle',
            },
          ];
        }
        if (orientation[0].type === 'shape' && orientation[0].value === 'circle') {
          const { cx, cy } = positonToPercentage(orientation[0].at);
          return new CSSGradientValue(GradientType.RadialGradient, {
            cx,
            cy,
            steps,
            hash: colorStr,
          });
        }
        // } else if (type === 'repeating-linear-gradient') {
        // } else if (type === 'repeating-radial-gradient') {
      }
    });
  }

  // legacy format, should be deprecated later
  const type = colorStr[0];
  if (colorStr[1] === '(' || colorStr[2] === '(') {
    if (type === 'l') {
      const arr = regexLG.exec(colorStr);
      if (arr) {
        const steps = arr[2].match(regexColorStop)?.map((stop) => stop.split(':')) || [];
        return [
          new CSSGradientValue(GradientType.LinearGradient, {
            angle: parseFloat(arr[1]),
            steps: steps.map(([offset, color]) => [Number(offset), color]),
            hash: colorStr,
          }),
        ];
      }
    } else if (type === 'r') {
      const parsedRadialGradient = parseRadialGradient(colorStr);
      if (parsedRadialGradient) {
        if (isString(parsedRadialGradient)) {
          colorStr = parsedRadialGradient as string;
        } else {
          return [new CSSGradientValue(GradientType.RadialGradient, parsedRadialGradient)];
        }
      }
    } else if (type === 'p') {
      return parsePattern(colorStr);
    }
  }
});

function parseRadialGradient(gradientStr: string): RadialGradient | string | null {
  const arr = regexRG.exec(gradientStr);
  if (arr) {
    const steps = arr[4].match(regexColorStop)?.map((stop) => stop.split(':')) || [];
    return {
      cx: 0.5,
      cy: 0.5,
      steps: steps.map(([offset, color]) => [Number(offset), color]),
      hash: gradientStr,
    };
  }
  return null;
}

function parsePattern(patternStr: string): Pattern | null {
  const arr = regexPR.exec(patternStr);
  if (arr) {
    let repetition = arr[1];
    const src = arr[2];
    switch (repetition) {
      case 'a':
        repetition = 'repeat';
        break;
      case 'x':
        repetition = 'repeat-x';
        break;
      case 'y':
        repetition = 'repeat-y';
        break;
      case 'n':
        repetition = 'no-repeat';
        break;
      default:
        repetition = 'no-repeat';
    }
    return {
      image: src,
      // @ts-ignore
      repetition,
    };
  }
  return null;
}
