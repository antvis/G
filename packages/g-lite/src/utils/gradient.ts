/**
 * borrow from gradient-parser, but we delete some browser compatible prefix such as `-webkit-`
 * @see https://github.com/rafaelcaricio/gradient-parser
 */

import { distanceSquareRoot } from '@antv/util';
import { CSSKeywordValue, CSSUnitValue, UnitType } from '../css/cssom';
import { deg2rad } from './math';

export interface LinearGradientNode {
  type: 'linear-gradient';
  orientation?: DirectionalNode | AngularNode | undefined;
  colorStops: ColorStop[];
}

export interface RepeatingLinearGradientNode {
  type: 'repeating-linear-gradient';
  orientation?: DirectionalNode | AngularNode | undefined;
  colorStops: ColorStop[];
}

export interface RadialGradientNode {
  type: 'radial-gradient';
  orientation?:
    | (ShapeNode | DefaultRadialNode | ExtentKeywordNode)[]
    | undefined;
  colorStops: ColorStop[];
}

export interface RepeatingRadialGradientNode {
  type: 'repeating-radial-gradient';
  orientation?:
    | (ShapeNode | DefaultRadialNode | ExtentKeywordNode)[]
    | undefined;
  colorStops: ColorStop[];
}

export interface DirectionalNode {
  type: 'directional';
  value:
    | 'left'
    | 'top'
    | 'bottom'
    | 'right'
    | 'left top'
    | 'top left'
    | 'left bottom'
    | 'bottom left'
    | 'right top'
    | 'top right'
    | 'right bottom'
    | 'bottom right';
}

export interface AngularNode {
  type: 'angular';
  value: string;
}

export interface LiteralNode {
  type: 'literal';
  value: string;
  length?: PxNode | EmNode | PercentNode | undefined;
}

export interface HexNode {
  type: 'hex';
  value: string;
  length?: PxNode | EmNode | PercentNode | undefined;
}

export interface RgbNode {
  type: 'rgb';
  value: [string, string, string];
  length?: PxNode | EmNode | PercentNode | undefined;
}

export interface RgbaNode {
  type: 'rgba';
  value: [string, string, string, string?];
  length?: PxNode | EmNode | PercentNode | undefined;
}

export interface ShapeNode {
  type: 'shape';
  style?:
    | ExtentKeywordNode
    | PxNode
    | EmNode
    | PercentNode
    | PositionKeywordNode
    | undefined;
  value: 'ellipse' | 'circle';
  at?: PositionNode | undefined;
}

export interface DefaultRadialNode {
  type: 'default-radial';
  at: PositionNode;
}

export interface PositionKeywordNode {
  type: 'position-keyword';
  value: 'center' | 'left' | 'top' | 'bottom' | 'right';
}

export interface PositionNode {
  type: 'position';
  value: {
    x: ExtentKeywordNode | PxNode | EmNode | PercentNode | PositionKeywordNode;
    y: ExtentKeywordNode | PxNode | EmNode | PercentNode | PositionKeywordNode;
  };
}

export interface ExtentKeywordNode {
  type: 'extent-keyword';
  value:
    | 'closest-side'
    | 'closest-corner'
    | 'farthest-side'
    | 'farthest-corner'
    | 'contain'
    | 'cover';
  at?: PositionNode | undefined;
}

export interface PxNode {
  type: 'px';
  value: string;
}

export interface EmNode {
  type: 'em';
  value: string;
}

export interface PercentNode {
  type: '%';
  value: string;
}

export type ColorStop = LiteralNode | HexNode | RgbNode | RgbaNode;

export type GradientNode =
  | LinearGradientNode
  | RepeatingLinearGradientNode
  | RadialGradientNode
  | RepeatingRadialGradientNode;

export function colorStopToString(colorStop: ColorStop) {
  const { type, value } = colorStop;
  if (type === 'hex') {
    return `#${value}`;
  }
  if (type === 'literal') {
    return value;
  }
  if (type === 'rgb') {
    return `rgb(${value.join(',')})`;
  }
  return `rgba(${value.join(',')})`;
}

export const parseGradient = (function () {
  const tokens = {
    linearGradient: /^(linear\-gradient)/i,
    repeatingLinearGradient: /^(repeating\-linear\-gradient)/i,
    radialGradient: /^(radial\-gradient)/i,
    repeatingRadialGradient: /^(repeating\-radial\-gradient)/i,
    /**
     * @see https://projects.verou.me/conic-gradient/
     */
    conicGradient: /^(conic\-gradient)/i,
    sideOrCorner:
      /^to (left (top|bottom)|right (top|bottom)|top (left|right)|bottom (left|right)|left|right|top|bottom)/i,
    extentKeywords:
      /^(closest\-side|closest\-corner|farthest\-side|farthest\-corner|contain|cover)/,
    positionKeywords: /^(left|center|right|top|bottom)/i,
    pixelValue: /^(-?(([0-9]*\.[0-9]+)|([0-9]+\.?)))px/,
    percentageValue: /^(-?(([0-9]*\.[0-9]+)|([0-9]+\.?)))\%/,
    emValue: /^(-?(([0-9]*\.[0-9]+)|([0-9]+\.?)))em/,
    angleValue: /^(-?(([0-9]*\.[0-9]+)|([0-9]+\.?)))deg/,
    startCall: /^\(/,
    endCall: /^\)/,
    comma: /^,/,
    hexColor: /^\#([0-9a-fA-F]+)/,
    literalColor: /^([a-zA-Z]+)/,
    rgbColor: /^rgb/i,
    rgbaColor: /^rgba/i,
    number: /^(([0-9]*\.[0-9]+)|([0-9]+\.?))/,
  };

  let input = '';

  function error(msg: string) {
    throw new Error(`${input}: ${msg}`);
  }

  function getAST() {
    const ast = matchListDefinitions();

    if (input.length > 0) {
      error('Invalid input not EOF');
    }

    return ast;
  }

  function matchListDefinitions() {
    return matchListing(matchDefinition);
  }

  function matchDefinition() {
    return (
      matchGradient(
        'linear-gradient',
        tokens.linearGradient,
        matchLinearOrientation,
      ) ||
      matchGradient(
        'repeating-linear-gradient',
        tokens.repeatingLinearGradient,
        matchLinearOrientation,
      ) ||
      matchGradient(
        'radial-gradient',
        tokens.radialGradient,
        matchListRadialOrientations,
      ) ||
      matchGradient(
        'repeating-radial-gradient',
        tokens.repeatingRadialGradient,
        matchListRadialOrientations,
      ) ||
      matchGradient(
        'conic-gradient',
        tokens.conicGradient,
        matchListRadialOrientations,
      )
    );
  }

  function matchGradient(
    gradientType: string,
    pattern: RegExp,
    orientationMatcher,
  ) {
    return matchCall(pattern, function (captures) {
      const orientation = orientationMatcher();
      if (orientation) {
        if (!scan(tokens.comma)) {
          error('Missing comma before color stops');
        }
      }

      return {
        type: gradientType,
        orientation,
        colorStops: matchListing(matchColorStop),
      };
    });
  }

  function matchCall(pattern, callback) {
    const captures = scan(pattern);

    if (captures) {
      if (!scan(tokens.startCall)) {
        error('Missing (');
      }

      const result = callback(captures);

      if (!scan(tokens.endCall)) {
        error('Missing )');
      }

      return result;
    }
  }

  function matchLinearOrientation() {
    return matchSideOrCorner() || matchAngle();
  }

  function matchSideOrCorner() {
    return match('directional', tokens.sideOrCorner, 1);
  }

  function matchAngle() {
    return match('angular', tokens.angleValue, 1);
  }

  function matchListRadialOrientations() {
    let radialOrientations;
    let radialOrientation = matchRadialOrientation();
    let lookaheadCache;

    if (radialOrientation) {
      radialOrientations = [];
      radialOrientations.push(radialOrientation);

      lookaheadCache = input;
      if (scan(tokens.comma)) {
        radialOrientation = matchRadialOrientation();
        if (radialOrientation) {
          radialOrientations.push(radialOrientation);
        } else {
          input = lookaheadCache;
        }
      }
    }

    return radialOrientations;
  }

  function matchRadialOrientation() {
    let radialType = matchCircle() || matchEllipse();

    if (radialType) {
      // @ts-ignore
      radialType.at = matchAtPosition();
    } else {
      const extent = matchExtentKeyword();
      if (extent) {
        radialType = extent;
        const positionAt = matchAtPosition();
        if (positionAt) {
          // @ts-ignore
          radialType.at = positionAt;
        }
      } else {
        const defaultPosition = matchPositioning();
        if (defaultPosition) {
          radialType = {
            type: 'default-radial',
            // @ts-ignore
            at: defaultPosition,
          };
        }
      }
    }

    return radialType;
  }

  function matchCircle() {
    const circle = match('shape', /^(circle)/i, 0);

    if (circle) {
      // @ts-ignore
      circle.style = matchLength() || matchExtentKeyword();
    }

    return circle;
  }

  function matchEllipse() {
    const ellipse = match('shape', /^(ellipse)/i, 0);

    if (ellipse) {
      // @ts-ignore
      ellipse.style = matchDistance() || matchExtentKeyword();
    }

    return ellipse;
  }

  function matchExtentKeyword() {
    return match('extent-keyword', tokens.extentKeywords, 1);
  }

  function matchAtPosition() {
    if (match('position', /^at/, 0)) {
      const positioning = matchPositioning();

      if (!positioning) {
        error('Missing positioning value');
      }

      return positioning;
    }
  }

  function matchPositioning() {
    const location = matchCoordinates();

    if (location.x || location.y) {
      return {
        type: 'position',
        value: location,
      };
    }
  }

  function matchCoordinates() {
    return {
      x: matchDistance(),
      y: matchDistance(),
    };
  }

  function matchListing(matcher: () => any) {
    let captures = matcher();
    const result = [];

    if (captures) {
      result.push(captures);
      while (scan(tokens.comma)) {
        captures = matcher();
        if (captures) {
          result.push(captures);
        } else {
          error('One extra comma');
        }
      }
    }

    return result;
  }

  function matchColorStop() {
    const color = matchColor();

    if (!color) {
      error('Expected color definition');
    }

    color.length = matchDistance();
    return color;
  }

  function matchColor() {
    return (
      matchHexColor() ||
      matchRGBAColor() ||
      matchRGBColor() ||
      matchLiteralColor()
    );
  }

  function matchLiteralColor() {
    return match('literal', tokens.literalColor, 0);
  }

  function matchHexColor() {
    return match('hex', tokens.hexColor, 1);
  }

  function matchRGBColor() {
    return matchCall(tokens.rgbColor, function () {
      return {
        type: 'rgb',
        value: matchListing(matchNumber),
      };
    });
  }

  function matchRGBAColor() {
    return matchCall(tokens.rgbaColor, function () {
      return {
        type: 'rgba',
        value: matchListing(matchNumber),
      };
    });
  }

  function matchNumber() {
    return scan(tokens.number)[1];
  }

  function matchDistance() {
    return (
      match('%', tokens.percentageValue, 1) ||
      matchPositionKeyword() ||
      matchLength()
    );
  }

  function matchPositionKeyword() {
    return match('position-keyword', tokens.positionKeywords, 1);
  }

  function matchLength() {
    return match('px', tokens.pixelValue, 1) || match('em', tokens.emValue, 1);
  }

  function match(type: string, pattern, captureIndex: number) {
    const captures = scan(pattern);
    if (captures) {
      return {
        type,
        value: captures[captureIndex],
      };
    }
  }

  function scan(regexp) {
    const blankCaptures = /^[\n\r\t\s]+/.exec(input);
    if (blankCaptures) {
      consume(blankCaptures[0].length);
    }

    const captures = regexp.exec(input);
    if (captures) {
      consume(captures[0].length);
    }

    return captures;
  }

  function consume(size: number) {
    input = input.substring(size);
  }

  return function (code: string): GradientNode[] {
    input = code;
    return getAST();
  };
})();

export function computeLinearGradient(
  min: [number, number],
  width: number,
  height: number,
  angle: CSSUnitValue,
) {
  const rad = deg2rad(angle.value);
  const rx = 0;
  const ry = 0;
  const rcx = rx + width / 2;
  const rcy = ry + height / 2;
  // get the length of gradient line
  // @see https://observablehq.com/@danburzo/css-gradient-line
  const length =
    Math.abs(width * Math.cos(rad)) + Math.abs(height * Math.sin(rad));
  const x1 = min[0] + rcx - (Math.cos(rad) * length) / 2;
  const y1 = min[1] + rcy - (Math.sin(rad) * length) / 2;
  const x2 = min[0] + rcx + (Math.cos(rad) * length) / 2;
  const y2 = min[1] + rcy + (Math.sin(rad) * length) / 2;

  return { x1, y1, x2, y2 };
}

export function computeRadialGradient(
  min: [number, number],
  width: number,
  height: number,
  cx: CSSUnitValue,
  cy: CSSUnitValue,
  size?: CSSUnitValue | CSSKeywordValue,
) {
  // 'px'
  let x = cx.value;
  let y = cy.value;

  // TODO: 'em'

  // '%'
  if (cx.unit === UnitType.kPercentage) {
    x = (cx.value / 100) * width;
  }
  if (cy.unit === UnitType.kPercentage) {
    y = (cy.value / 100) * height;
  }

  // default to farthest-side
  let r = Math.max(
    distanceSquareRoot([0, 0], [x, y]),
    distanceSquareRoot([0, height], [x, y]),
    distanceSquareRoot([width, height], [x, y]),
    distanceSquareRoot([width, 0], [x, y]),
  );
  if (size) {
    if (size instanceof CSSUnitValue) {
      r = size.value;
    } else if (size instanceof CSSKeywordValue) {
      // @see https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Images/Using_CSS_gradients#example_closest-side_for_circles
      if (size.value === 'closest-side') {
        r = Math.min(x, width - x, y, height - y);
      } else if (size.value === 'farthest-side') {
        r = Math.max(x, width - x, y, height - y);
      } else if (size.value === 'closest-corner') {
        r = Math.min(
          distanceSquareRoot([0, 0], [x, y]),
          distanceSquareRoot([0, height], [x, y]),
          distanceSquareRoot([width, height], [x, y]),
          distanceSquareRoot([width, 0], [x, y]),
        );
      }
    }
  }

  return { x: x + min[0], y: y + min[1], r };
}
