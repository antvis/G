import { definedProps, rad2deg, Shape } from '@antv/g-lite';
import type { PathArray } from '@antv/util';
import {
  isNumber,
  distanceSquareRoot,
  isNil,
  getTotalLength,
} from '@antv/util';
import type { LoadAnimationOptions } from '..';
import { completeData } from './complete-data';
import * as Lottie from './lottie-type';

export interface KeyframeAnimationKeyframe {
  easing?: string;
  offset: number;
  [key: string]: any;
}

export interface KeyframeAnimation {
  duration?: number;
  delay?: number;
  easing?: string;
  keyframes: Record<string, any>[];
}

export interface CustomElementOption {
  type: Shape;

  keyframeAnimation?: KeyframeAnimation[];
  children?: CustomElementOption[];

  shape?: Record<string, any>;
  style?: Record<string, any>;
  clipPath?: CustomElementOption;
  extra?: any;

  name?: string;
  anchorX?: number;
  anchorY?: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  x?: number;
  y?: number;

  visibilityStartOffset?: number;
  visibilityEndOffset?: number;
  visibilityFrame?: number;
}

export class ParseContext {
  fps: number;
  frameTime = 1000 / 30;
  startFrame = 0;
  endFrame: number;
  version: string;
  autoplay = false;
  fill: FillMode = 'auto';
  iterations = 0;

  assetsMap: Map<string, Lottie.Asset> = new Map();

  layerOffsetTime: number;
}

function isNumberArray(val: any): val is number[] {
  return Array.isArray(val) && typeof val[0] === 'number';
}

function isMultiDimensionalValue(val?: { k?: any }): val is { k: number[] } {
  return isNumberArray(val?.k);
}

function isMultiDimensionalKeyframedValue(val?: {
  k?: any;
}): val is { k: Lottie.OffsetKeyframe[] } {
  const k = val?.k;
  return Array.isArray(k) && k[0].t !== undefined && isNumberArray(k[0].s);
}

function isValue(val?: { k?: any }): val is { k: number } {
  // TODO is [100] sort of value?
  return typeof val?.k === 'number';
}

function isKeyframedValue(val?: {
  k?: any;
}): val is { k: Lottie.OffsetKeyframe[] } {
  const k = val?.k;
  return Array.isArray(k) && k[0].t !== undefined && typeof k[0].s === 'number';
}

function toColorString(val: number | number[]) {
  const opacity = getMultiDimensionValue(val, 3);

  return `rgba(${[
    Math.round(getMultiDimensionValue(val, 0) * 255),
    Math.round(getMultiDimensionValue(val, 1) * 255),
    Math.round(getMultiDimensionValue(val, 2) * 255),
    !isNil(opacity) ? opacity : 1,
  ].join(',')})`;
}

function getMultiDimensionValue(val: number | number[], dimIndex?: number) {
  // eslint-disable-next-line no-nested-ternary
  return val != null
    ? typeof val === 'number'
      ? val
      : val[dimIndex || 0]
    : NaN;
}

/**
 * @see https://lottiefiles.github.io/lottie-docs/concepts/#easing-handles
 */
function getMultiDimensionEasingBezierString(
  kf: Pick<Lottie.OffsetKeyframe, 'o' | 'i'>,
  nextKf: Pick<Lottie.OffsetKeyframe, 'o' | 'i'>,
  dimIndex?: number,
) {
  const bezierEasing: number[] = [];
  bezierEasing.push(
    (kf.o?.x &&
      (getMultiDimensionValue(kf.o.x, dimIndex) ||
        getMultiDimensionValue(kf.o.x, 0))) ||
      0,
    (kf.o?.y &&
      (getMultiDimensionValue(kf.o.y, dimIndex) ||
        getMultiDimensionValue(kf.o.y, 0))) ||
      0,
    (kf.i?.x &&
      (getMultiDimensionValue(kf.i.x, dimIndex) ||
        getMultiDimensionValue(kf.i.x, 0))) ||
      1,
    (kf.i?.y &&
      (getMultiDimensionValue(kf.i.y, dimIndex) ||
        getMultiDimensionValue(kf.i.y, 0))) ||
      1,
    // nextKf?.o?.x ? getMultiDimensionValue(nextKf.o.x, dimIndex) : 1,
    // nextKf?.o?.y ? getMultiDimensionValue(nextKf.o.y, dimIndex) : 1,
  );

  // linear by default
  if (
    !(
      bezierEasing[0] === 0 &&
      bezierEasing[1] === 0 &&
      bezierEasing[2] === 1 &&
      bezierEasing[3] === 1
    )
  ) {
    return `cubic-bezier(${bezierEasing.join(',')})`;
  }
}

/**
 * @see https://lottiefiles.github.io/lottie-docs/concepts/#keyframe
 */
function parseKeyframe(
  kfs: Lottie.OffsetKeyframe[],
  bezierEasingDimIndex: number,
  context: ParseContext,
  setVal: (kfObj: any, val: any) => void,
) {
  const kfsLen = kfs.length;
  // const offset = context.layerStartTime;
  const duration = context.endFrame - context.startFrame;
  const out: KeyframeAnimation = {
    duration: 0,
    delay: 0,
    keyframes: [],
  };

  let prevKf;
  for (let i = 0; i < kfsLen; i++) {
    const kf = kfs[i];
    const nextKf = kfs[i + 1];

    // If h is present and it's 1, you don't need i and o,
    // as the property will keep the same value until the next keyframe.
    const isDiscrete = kf.h === 1;
    const offset =
      (kf.t + context.layerOffsetTime - context.startFrame) / duration;

    const outKeyframe: KeyframeAnimationKeyframe = {
      offset,
    };
    if (!isDiscrete) {
      outKeyframe.easing = getMultiDimensionEasingBezierString(
        kf,
        nextKf,
        bezierEasingDimIndex,
      );
    }
    // Use end state of later frame if start state not exits.
    // @see https://lottiefiles.github.io/lottie-docs/concepts/#old-lottie-keyframes
    const startVal = kf.s || prevKf?.e;
    if (startVal) {
      setVal(outKeyframe, startVal);
    }

    if (outKeyframe.offset > 0 && i === 0) {
      // Set initial
      const initialKeyframe = {
        offset: 0,
      };
      if (startVal) {
        setVal(initialKeyframe, startVal);
      }
      out.keyframes.push(initialKeyframe);
    }

    out.keyframes.push(outKeyframe);

    if (isDiscrete && nextKf) {
      // Use two keyframe to simulate the discrete animation.
      const extraKeyframe: KeyframeAnimationKeyframe = {
        offset: Math.max(
          (nextKf.t + context.layerOffsetTime - context.startFrame) / duration,
          0,
        ),
      };
      setVal(extraKeyframe, startVal);
      out.keyframes.push(extraKeyframe);
    }

    prevKf = kf;
  }

  if (kfsLen) {
    out.duration = context.frameTime * duration;
  }

  return out;
}

function parseOffsetKeyframe(
  kfs: Lottie.OffsetKeyframe[],
  targetPropName: string,
  propNames: string[],
  keyframeAnimations: KeyframeAnimation[],
  context: ParseContext,
  convertVal?: (val: number) => number,
) {
  for (let dimIndex = 0; dimIndex < propNames.length; dimIndex++) {
    const propName = propNames[dimIndex];
    const keyframeAnim = parseKeyframe(
      kfs,
      dimIndex,
      context,
      (outKeyframe, startVal) => {
        let val = getMultiDimensionValue(startVal, dimIndex);
        if (convertVal) {
          val = convertVal(val);
        }
        (targetPropName
          ? (outKeyframe[targetPropName] = {} as any)
          : outKeyframe)[propName] = val;
      },
    );

    // moving position around a curved path
    const needOffsetPath = kfs.some((kf) => kf.ti && kf.to);
    if (needOffsetPath) {
      const offsetPath: PathArray = [] as unknown as PathArray;

      kfs.forEach((kf, i) => {
        keyframeAnim.keyframes[i].offsetPath = offsetPath;

        // convert to & ti(Tangent for values (eg: moving position around a curved path)) to offsetPath & offsetDistance
        // @see https://lottiefiles.github.io/lottie-docs/concepts/#animated-position
        if (kf.ti && kf.to) {
          if (i === 0) {
            offsetPath.push(['M', kf.s[0], kf.s[1]]);
          }

          keyframeAnim.keyframes[i].segmentLength = getTotalLength(offsetPath);

          // @see https://lottiefiles.github.io/lottie-docs/concepts/#bezier
          // The nth bezier segment is defined as:
          // v[n], v[n]+o[n], v[n+1]+i[n+1], v[n+1]
          offsetPath.push([
            'C',
            kf.s[0] + kf.to[0],
            kf.s[1] + kf.to[1],
            kf.s[0] + kf.ti[0],
            kf.s[1] + kf.ti[1],
            kf.e[0],
            kf.e[1],
          ]);
        }
      });

      // calculate offsetDistance: segmentLength / totalLength
      const totalLength = getTotalLength(offsetPath);
      keyframeAnim.keyframes.forEach((kf) => {
        kf.offsetDistance = isNil(kf.segmentLength)
          ? 1
          : kf.segmentLength / totalLength;
        delete kf.segmentLength;
      });
    }

    if (keyframeAnim.keyframes.length) {
      keyframeAnimations.push(keyframeAnim);
    }
  }
}

function parseColorOffsetKeyframe(
  kfs: Lottie.OffsetKeyframe[],
  targetPropName: string,
  propName: string,
  keyframeAnimations: KeyframeAnimation[],
  context: ParseContext,
) {
  const keyframeAnim = parseKeyframe(
    kfs,
    0,
    context,
    (outKeyframe, startVal) => {
      (targetPropName
        ? (outKeyframe[targetPropName] = {} as any)
        : outKeyframe)[propName] = toColorString(startVal);
    },
  );
  if (keyframeAnim.keyframes.length) {
    keyframeAnimations.push(keyframeAnim);
  }
}

function parseValue(
  lottieVal: Lottie.MultiDimensional | Lottie.Value,
  attrs: Record<string, any>,
  targetPropName: string,
  propNames: string[],
  animations: KeyframeAnimation[],
  context: ParseContext,
  convertVal?: (val: number) => number,
) {
  if (targetPropName) {
    attrs[targetPropName] = attrs[targetPropName] || {};
  }
  const target = targetPropName ? attrs[targetPropName] : attrs;

  if (isValue(lottieVal)) {
    const val = lottieVal.k;
    target[propNames[0]] = convertVal ? convertVal(val) : val;
  } else if (isKeyframedValue(lottieVal)) {
    parseOffsetKeyframe(
      lottieVal.k,
      targetPropName,
      propNames,
      animations,
      context,
      convertVal,
    );
  } else if (isMultiDimensionalValue(lottieVal)) {
    for (let i = 0; i < propNames.length; i++) {
      const val = getMultiDimensionValue(lottieVal.k, i);
      target[propNames[i]] = convertVal ? convertVal(val) : val;
    }
  } else if (isMultiDimensionalKeyframedValue(lottieVal)) {
    // TODO Merge dimensions
    parseOffsetKeyframe(
      lottieVal.k,
      targetPropName,
      propNames,
      animations,
      context,
      convertVal,
    );
  }
}

/**
 * @see https://lottiefiles.github.io/lottie-docs/concepts/#transform
 */
function parseTransforms(
  ks: Lottie.Transform,
  attrs: Record<string, any>,
  animations: KeyframeAnimation[],
  context: ParseContext,
  targetProp = '',
  transformProps = {
    x: 'x',
    y: 'y',
    rotation: 'rotation',
    scaleX: 'scaleX',
    scaleY: 'scaleY',
    anchorX: 'anchorX',
    anchorY: 'anchorY',
    skew: 'skew',
    skewAxis: 'skewAxis',
  },
) {
  // @see https://lottiefiles.github.io/lottie-docs/concepts/#split-vector
  if ((ks.p as Lottie.Position).s) {
    parseValue(
      (ks.p as Lottie.Position).x,
      attrs,
      targetProp,
      [transformProps.x],
      animations,
      context,
    );
    parseValue(
      (ks.p as Lottie.Position).y,
      attrs,
      targetProp,
      [transformProps.y],
      animations,
      context,
    );
  } else {
    parseValue(
      ks.p as Lottie.MultiDimensional,
      attrs,
      targetProp,
      [transformProps.x, transformProps.y],
      animations,
      context,
    );
  }
  parseValue(
    ks.s,
    attrs,
    targetProp,
    [transformProps.scaleX, transformProps.scaleY],
    animations,
    context,
    (val) => val / 100,
  );
  parseValue(
    ks.r,
    attrs,
    targetProp,
    [transformProps.rotation],
    animations,
    context,
  );

  parseValue(
    ks.a,
    attrs,
    targetProp,
    [transformProps.anchorX, transformProps.anchorY],
    animations,
    context,
  );

  parseValue(
    ks.sk,
    attrs,
    targetProp,
    [transformProps.skew],
    animations,
    context,
  );

  parseValue(
    ks.sa,
    attrs,
    targetProp,
    [transformProps.skewAxis],
    animations,
    context,
  );
}

function isGradientFillOrStroke(
  fl: any,
): fl is Lottie.GradientFillShape | Lottie.GradientStrokeShape {
  return fl.g && fl.s && fl.e;
}

function convertColorStops(arr: number[], count: number) {
  const colorStops = [];
  for (let i = 0; i < count * 4; ) {
    const offset = arr[i++];
    const r = Math.round(arr[i++] * 255);
    const g = Math.round(arr[i++] * 255);
    const b = Math.round(arr[i++] * 255);
    colorStops.push({
      offset,
      color: `rgb(${r}, ${g}, ${b})`,
    });
  }
  return colorStops;
}

function joinColorStops(colorStops: any[]) {
  return `${colorStops
    .map(({ offset, color }) => `${color} ${offset * 100}%`)
    .join(', ')}`;
}

/**
 * TODO:
 * * Transition
 * * Highlight length & angle in Radial Gradient
 *
 * @see https://lottiefiles.github.io/lottie-docs/concepts/#gradients
 * @see https://lottiefiles.github.io/lottie-docs/shapes/#gradients
 */
function parseGradient(
  shape: Lottie.GradientFillShape | Lottie.GradientStrokeShape,
) {
  const colorArr = shape.g.k.k as number[];
  const colorStops = convertColorStops(colorArr, shape.g.p);
  // @see https://lottiefiles.github.io/lottie-docs/constants/#gradienttype
  if (shape.t === Lottie.GradientType.Linear) {
    const angle = rad2deg(
      Math.atan2(
        (shape.e.k[1] as number) - (shape.s.k[1] as number),
        (shape.e.k[0] as number) - (shape.s.k[0] as number),
      ),
    );

    // @see https://g-next.antv.vision/zh/docs/api/css/css-properties-values-api#linear-gradient
    return `linear-gradient(${angle}deg, ${joinColorStops(colorStops)})`;
  }
  if (shape.t === Lottie.GradientType.Radial) {
    // TODO: highlight length & angle (h & a)
    // Highlight Length, as a percentage between s and e
    // Highlight Angle, relative to the direction from s to e
    const size = distanceSquareRoot(
      shape.e.k as [number, number],
      shape.s.k as [number, number],
    );

    // @see https://g-next.antv.vision/zh/docs/api/css/css-properties-values-api#radial-gradient
    return `radial-gradient(circle ${size}px at ${shape.s.k[0] as number}px ${
      shape.s.k[1] as number
    }px, ${joinColorStops(colorStops)})`;
  }
  // Invalid gradient
  return '#000';
}
function parseFill(
  fl: Lottie.FillShape | Lottie.GradientFillShape,
  attrs: Record<string, any>,
  animations: KeyframeAnimation[],
  context: ParseContext,
) {
  attrs.style = attrs.style || {};
  // Color
  if (isGradientFillOrStroke(fl)) {
    attrs.style.fill = parseGradient(fl);
  } else if (isMultiDimensionalValue(fl.c)) {
    attrs.style.fill = toColorString(fl.c.k);
  } else if (isMultiDimensionalKeyframedValue(fl.c)) {
    parseColorOffsetKeyframe(fl.c.k, 'style', 'fill', animations, context);
  }

  // FillRule @see https://lottiefiles.github.io/lottie-docs/constants/#fillrule
  attrs.style.fillRule =
    fl.r === Lottie.FillRule.EvenOdd ? 'evenodd' : 'nonzero';

  // Opacity
  parseValue(
    fl.o,
    attrs,
    'style',
    ['fillOpacity'],
    animations,
    context,
    (opacity) => opacity / 100,
  );
}

function parseStroke(
  st: Lottie.StrokeShape,
  attrs: Record<string, any>,
  animations: KeyframeAnimation[],
  context: ParseContext,
) {
  attrs.style = attrs.style || {};
  // Color
  if (isGradientFillOrStroke(st)) {
    attrs.style.stroke = parseGradient(st);
  } else if (isMultiDimensionalValue(st.c)) {
    attrs.style.stroke = toColorString(st.c.k);
  } else if (isMultiDimensionalKeyframedValue(st.c)) {
    parseColorOffsetKeyframe(st.c.k, 'style', 'stroke', animations, context);
  }

  // Opacity
  parseValue(
    st.o,
    attrs,
    'style',
    ['strokeOpacity'],
    animations,
    context,
    (opacity) => opacity / 100,
  );
  // Line width
  parseValue(st.w, attrs, 'style', ['lineWidth'], animations, context);

  switch (st.lj) {
    case Lottie.LineJoin.Bevel:
      attrs.style.lineJoin = 'bevel';
      break;
    case Lottie.LineJoin.Round:
      attrs.style.lineJoin = 'round';
      break;
    case Lottie.LineJoin.Miter:
      attrs.style.lineJoin = 'miter';
      break;
  }

  switch (st.lc) {
    case Lottie.LineCap.Butt:
      attrs.style.lineCap = 'butt';
      break;
    case Lottie.LineCap.Round:
      attrs.style.lineCap = 'round';
      break;
    case Lottie.LineCap.Square:
      attrs.style.lineCap = 'square';
      break;
  }

  // Line dash
  const dashArray: number[] = [];
  let dashOffset = 0;
  if (st.d) {
    st.d.forEach((item) => {
      if (item.n !== 'o') {
        dashArray.push(item.v.k);
      } else {
        dashOffset = item.v.k;
      }
    });

    attrs.style.lineDash = dashArray;
    attrs.style.lineDashOffset = dashOffset;
  }
}

function isBezier(k: any): k is Lottie.Bezier {
  return k && k.i && k.o && k.v;
}

/**
 * @see https://lottiefiles.github.io/lottie-docs/shapes/#path
 */
function parseShapePaths(
  shape: Pick<Lottie.PathShape, 'ks'>,
  animations: KeyframeAnimation[],
  context: ParseContext,
) {
  const attrs: any = {
    type: Shape.PATH,
    // Should have no fill and stroke by default
    style: {
      fill: 'none',
      stroke: 'none',
    },
  };
  // @see https://lottiefiles.github.io/lottie-docs/concepts/#bezier
  if (isBezier(shape.ks.k)) {
    attrs.shape = {
      in: shape.ks.k.i,
      out: shape.ks.k.o,
      v: shape.ks.k.v,
      close: shape.ks.k.c,
    };
  } else if (Array.isArray(shape.ks.k)) {
    const keyframeAnim = parseKeyframe(
      shape.ks.k as any as Lottie.OffsetKeyframe[],
      0,
      context,
      (outKeyframe, startVal) => {
        outKeyframe.shape = {
          in: startVal[0].i,
          out: startVal[0].o,
          v: startVal[0].v,
          close: startVal[0].c,
        };
      },
    );
    if (keyframeAnim.keyframes.length) {
      animations.push(keyframeAnim);
    }
  }
  return attrs;
}

/**
 * @see https://lottiefiles.github.io/lottie-docs/shapes/#rectangle
 */
function parseShapeRect(
  shape: Lottie.RectShape,
  animations: KeyframeAnimation[],
  context: ParseContext,
) {
  const attrs = {
    type: Shape.RECT,
    // Should have no fill and stroke by default
    style: {
      fill: 'none',
      stroke: 'none',
    },
    shape: {},
  };

  parseValue(shape.p, attrs, 'shape', ['x', 'y'], animations, context);
  parseValue(shape.s, attrs, 'shape', ['width', 'height'], animations, context);
  parseValue(shape.r, attrs, 'shape', ['r'], animations, context);

  return attrs;
}

/**
 * @see https://lottiefiles.github.io/lottie-docs/layers/#image-layer
 */
function parseImageLayer(layer: Lottie.ImageLayer, context: ParseContext) {
  const attrs = {
    type: Shape.IMAGE,
    style: {},
    shape: {
      width: 0,
      height: 0,
      src: '',
    },
  };

  const asset = context.assetsMap.get(layer.refId) as Lottie.ImageAsset;
  if (asset) {
    attrs.shape.width = asset.w;
    attrs.shape.height = asset.h;
    // TODO: url to fetch
    attrs.shape.src = asset.p;
  }

  return attrs;
}

/**
 * @see https://lottiefiles.github.io/lottie-docs/shapes/#ellipse
 */
function parseShapeEllipse(
  shape: Lottie.EllipseShape,
  animations: KeyframeAnimation[],
  context: ParseContext,
) {
  const attrs: any = {
    type: Shape.ELLIPSE,
    // Should have no fill and stroke by default
    style: {
      fill: 'none',
      stroke: 'none',
    },
    shape: {},
  };

  parseValue(shape.p, attrs, 'shape', ['cx', 'cy'], animations, context);
  parseValue(
    shape.s,
    attrs,
    'shape',
    ['rx', 'ry'],
    animations,
    context,
    (val) => val / 2,
  );
  return attrs;
}

function parseShapeLayer(layer: Lottie.ShapeLayer, context: ParseContext) {
  function tryCreateShape(
    shape: Lottie.ShapeElement,
    keyframeAnimations: KeyframeAnimation[],
  ) {
    let ecEl: any;
    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
    switch (shape.ty) {
      case Lottie.ShapeType.Path:
        ecEl = parseShapePaths(
          shape as Lottie.PathShape,
          keyframeAnimations,
          context,
        );
        break;
      case Lottie.ShapeType.Ellipse:
        ecEl = parseShapeEllipse(
          shape as Lottie.EllipseShape,
          keyframeAnimations,
          context,
        );
        break;
      case Lottie.ShapeType.Rectangle:
        ecEl = parseShapeRect(
          shape as Lottie.RectShape,
          keyframeAnimations,
          context,
        );
        break;
      case Lottie.ShapeType.PolyStar:
        // TODO: parseShapePolyStar
        break;
    }
    return ecEl;
  }

  function parseModifiers(
    shapes: Lottie.ShapeElement[],
    modifiers: {
      attrs: Record<string, any>;
      keyframeAnimations: KeyframeAnimation[];
    },
  ) {
    shapes.forEach((shape) => {
      if (shape.hd) {
        return;
      }
      // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
      switch (shape.ty) {
        case Lottie.ShapeType.Repeater:
          parseValue(
            (shape as Lottie.RepeatShape).c,
            modifiers.attrs,
            'shape',
            ['repeat'],
            modifiers.keyframeAnimations,
            context,
          );
          parseTransforms(
            (shape as Lottie.RepeatShape).tr,
            modifiers.attrs,
            modifiers.keyframeAnimations,
            context,
            'shape',
            {
              x: 'repeatX',
              y: 'repeatY',
              rotation: 'repeatRot',
              scaleX: 'repeatScaleX',
              scaleY: 'repeatScaleY',
              anchorX: 'repeatAnchorX',
              anchorY: 'repeatAnchorY',
              skew: 'repeatSkew',
              skewAxis: 'repeatSkewAxis',
            },
          );
          break;
        case Lottie.ShapeType.Trim:
          parseValue(
            (shape as Lottie.TrimShape).s,
            modifiers.attrs,
            'shape',
            ['trimStart'],
            modifiers.keyframeAnimations,
            context,
          );
          parseValue(
            (shape as Lottie.TrimShape).e,
            modifiers.attrs,
            'shape',
            ['trimEnd'],
            modifiers.keyframeAnimations,
            context,
          );
          break;
      }
    });
  }

  function parseIterations(
    shapes: Lottie.ShapeElement[],
    modifiers: {
      attrs: Record<string, any>;
      keyframeAnimations: KeyframeAnimation[];
    },
  ) {
    const ecEls: CustomElementOption[] = [];
    const attrs: Record<string, any> = {};
    const keyframeAnimations: KeyframeAnimation[] = [];

    // Order is reversed
    shapes = shapes.slice().reverse();

    // Modifiers first:
    parseModifiers(shapes, modifiers);

    shapes.forEach((shape) => {
      if (shape.hd) {
        return;
      }

      let ecEl;
      switch (shape.ty) {
        case Lottie.ShapeType.Group:
          ecEl = {
            type: Shape.GROUP,
            children: parseIterations(
              (shape as Lottie.GroupShapeElement).it,
              // Modifiers will be applied to all childrens.
              modifiers,
            ),
          };
          break;
        // TODO Multiple fill and stroke
        case Lottie.ShapeType.Fill:
        case Lottie.ShapeType.GradientFill:
          parseFill(
            shape as Lottie.FillShape,
            attrs,
            keyframeAnimations,
            context,
          );
          break;
        case Lottie.ShapeType.Stroke:
        case Lottie.ShapeType.GradientStroke:
          parseStroke(
            shape as Lottie.StrokeShape,
            attrs,
            keyframeAnimations,
            context,
          );
          break;
        case Lottie.ShapeType.Transform:
          parseTransforms(
            shape as Lottie.TransformShape,
            attrs,
            keyframeAnimations,
            context,
          );
          break;
        // TODO Multiple shapes.
        default:
          ecEl = tryCreateShape(shape, keyframeAnimations);
      }
      if (ecEl) {
        ecEl.name = shape.nm;
        ecEls.push(ecEl);
      }
    });

    ecEls.forEach((el, idx) => {
      // Apply modifiers first
      el = {
        ...el,
        ...definedProps(modifiers.attrs),
        ...attrs,
      };

      if (keyframeAnimations.length || modifiers.keyframeAnimations.length) {
        el.keyframeAnimation = [
          ...modifiers.keyframeAnimations,
          ...keyframeAnimations,
        ];
      }

      ecEls[idx] = el;
    });
    return ecEls;
  }

  return {
    type: Shape.GROUP,
    children: parseIterations(layer.shapes, {
      attrs: {},
      keyframeAnimations: [],
    }),
  } as CustomElementOption;
}

function traverse(
  el: CustomElementOption,
  cb: (el: CustomElementOption) => void,
) {
  cb(el);
  if (el.type === Shape.GROUP) {
    el.children?.forEach((child) => {
      traverse(child, cb);
    });
  }
}

function addLayerOpacity(
  layer: Lottie.Layer,
  layerGroup: CustomElementOption,
  context: ParseContext,
) {
  const opacityAttrs = {} as CustomElementOption;
  const opacityAnimations: KeyframeAnimation[] = [];

  if (layer.ks?.o) {
    parseValue(
      layer.ks.o,
      opacityAttrs,
      'style',
      ['opacity'],
      opacityAnimations,
      context,
      (val) => val / 100,
    );

    if (opacityAttrs.style?.opacity || opacityAnimations.length) {
      // apply opacity to group's children
      traverse(layerGroup, (el) => {
        if (el.type !== Shape.GROUP && el.style) {
          Object.assign(el.style, opacityAttrs.style);
          if (opacityAnimations.length) {
            el.keyframeAnimation = (el.keyframeAnimation || []).concat(
              opacityAnimations,
            );
          }
        }
      });
    }
  }
}

function parseSolidShape(layer: Lottie.SolidColorLayer) {
  return {
    type: Shape.RECT,
    shape: {
      x: 0,
      y: 0,
      width: layer.sw,
      height: layer.sh,
    },
    style: {
      fill: layer.sc,
    },
  } as CustomElementOption;
}

function parseLayers(
  layers: Lottie.Layer[],
  context: ParseContext,
  precompLayerTl?: {
    st: number;
  },
) {
  const elements: CustomElementOption[] = [];

  // Order is reversed
  layers = layers.slice().reverse();
  const layerIndexMap: Map<number, CustomElementOption> = new Map();
  const offsetTime = precompLayerTl?.st || 0;

  layers?.forEach((layer) => {
    // Layer time is offseted by the precomp layer.

    // Use the ip, op, st of ref from.
    const layerIp = offsetTime + layer.ip;
    const layerOp = offsetTime + layer.op;
    const layerSt = offsetTime + layer.st;
    context.layerOffsetTime = offsetTime;

    let layerGroup: CustomElementOption | undefined;
    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
    switch (layer.ty) {
      case Lottie.LayerType.shape:
        // @see https://lottiefiles.github.io/lottie-docs/layers/#shape-layer
        layerGroup = parseShapeLayer(layer as Lottie.ShapeLayer, context);
        break;
      case Lottie.LayerType.null:
        // @see https://lottiefiles.github.io/lottie-docs/layers/#null-layer
        layerGroup = {
          type: Shape.GROUP,
          children: [],
        };
        break;
      case Lottie.LayerType.solid:
        // @see https://lottiefiles.github.io/lottie-docs/layers/#solid-color-layer
        layerGroup = {
          type: Shape.GROUP,
          children: [],
        };
        // Anything you can do with solid layers, you can do better with a shape layer and a rectangle shape
        // since none of this layer's own properties can be animated.
        if ((layer as Lottie.SolidColorLayer).sc) {
          layerGroup.children.push(
            parseSolidShape(layer as Lottie.SolidColorLayer),
          );
        }
        break;
      case Lottie.LayerType.precomp:
        // @see https://lottiefiles.github.io/lottie-docs/layers/#precomposition-layer
        layerGroup = {
          type: Shape.GROUP,
          children: parseLayers(
            (
              context.assetsMap.get(
                (layer as Lottie.PrecompLayer).refId,
              ) as Lottie.PrecompAsset
            )?.layers || [],
            context,
            {
              st: layerSt,
            },
          ),
        };
        break;
      case Lottie.LayerType.text:
        // TODO: https://lottiefiles.github.io/lottie-docs/layers/#text-layer
        break;
      case Lottie.LayerType.image:
        // TODO: https://lottiefiles.github.io/lottie-docs/layers/#image-layer
        layerGroup = layerGroup = {
          type: Shape.GROUP,
          children: [parseImageLayer(layer as Lottie.ImageLayer, context)],
        };
        break;
    }

    if (layerGroup) {
      const keyframeAnimations: KeyframeAnimation[] = [];
      const attrs: Record<string, any> = {
        name: layer.nm,
      };
      if (layer.ks) {
        parseTransforms(layer.ks, attrs, keyframeAnimations, context);
      }

      Object.assign(layerGroup, attrs);
      if (layer.ind != null) {
        layerIndexMap.set(layer.ind, layerGroup);
      }

      layerGroup.extra = {
        layerParent: layer.parent,
      };
      // Masks @see https://lottiefiles.github.io/lottie-docs/layers/#masks
      // @see https://lottie-animation-community.github.io/docs/specs/layers/common/#clipping-masks
      // TODO: not support alpha and other modes.
      // @see https://lottie-animation-community.github.io/docs/specs/properties/mask-mode-types/
      if (layer.hasMask && layer.masksProperties?.length) {
        const maskKeyframeAnimations: KeyframeAnimation[] = [];
        // TODO: Only support one mask now.
        const attrs = parseShapePaths(
          {
            ks: layer.masksProperties[0].pt,
          },
          maskKeyframeAnimations,
          context,
        );

        layerGroup.clipPath = {
          type: Shape.PATH,
          ...attrs,
        };
        if (maskKeyframeAnimations.length) {
          layerGroup.clipPath.keyframeAnimation = maskKeyframeAnimations;
        }
      }

      addLayerOpacity(layer, layerGroup, context);

      // Update in and out animation.
      if (
        layerIp != null &&
        layerOp != null &&
        (layerIp > context.startFrame || layerOp < context.endFrame)
      ) {
        const duration = context.endFrame - context.startFrame;
        const visibilityStartOffset = (layerIp - context.startFrame) / duration;
        const visibilityEndOffset = (layerOp - context.startFrame) / duration;
        layerGroup.visibilityStartOffset = visibilityStartOffset;
        layerGroup.visibilityEndOffset = visibilityEndOffset;
        layerGroup.visibilityFrame = duration;
      }
      if (keyframeAnimations.length) {
        layerGroup.keyframeAnimation = keyframeAnimations;
      }

      elements.push(layerGroup);
    }
  });

  // Build hierarchy
  return elements.filter((el) => {
    const parentLayer = layerIndexMap.get(el.extra?.layerParent);
    if (parentLayer) {
      parentLayer.children?.push(el);
      return false;
    }
    return true;
  });
}

const DEFAULT_LOAD_ANIMATION_OPTIONS: LoadAnimationOptions = {
  loop: true,
  autoplay: false,
  fill: 'both',
};
export function parse(
  data: Lottie.Animation,
  options: Partial<LoadAnimationOptions>,
) {
  completeData(data);
  const { loop, autoplay, fill } = {
    ...DEFAULT_LOAD_ANIMATION_OPTIONS,
    ...options,
  };
  const context = new ParseContext();

  context.fps = data.fr || 30;
  context.frameTime = 1000 / context.fps;
  context.startFrame = data.ip;
  context.endFrame = data.op;
  context.version = data.v;
  context.autoplay = !!autoplay;
  context.fill = fill;
  // eslint-disable-next-line no-nested-ternary
  context.iterations = isNumber(loop) ? loop : loop ? Infinity : 1;
  // @see https://lottiefiles.github.io/lottie-docs/assets/
  data.assets?.forEach((asset) => {
    context.assetsMap.set(asset.id, asset);
  });

  const elements = parseLayers(data.layers || [], context);

  return {
    width: data.w,
    height: data.h,
    elements,
    context,
  };
}
