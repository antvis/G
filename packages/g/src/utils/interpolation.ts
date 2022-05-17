import { GlobalContainer } from 'mana-syringe';
import type { DisplayObject } from '../display-objects';
import type { CSSProperty, Interpolatable } from '../css';
import { StyleValueRegistry } from '../css/interfaces';
import type { AnimationEffectTiming } from '../dom';
import type { IElement } from '../dom/interfaces';
import { parseEasingFunction } from './animation';
import type { TypeEasingFunction } from './custom-easing';
import { camelCase } from './string';

export function convertEffectInput(
  keyframes: ComputedKeyframe[],
  timing: AnimationEffectTiming,
  target: IElement | null,
) {
  const propertySpecificKeyframeGroups = makePropertySpecificKeyframeGroups(keyframes, timing);
  const interpolations = makeInterpolations(propertySpecificKeyframeGroups, target);

  return function (target: IElement, fraction: number) {
    if (fraction !== null) {
      interpolations
        .filter((interpolation) => {
          return fraction >= interpolation.applyFrom && fraction < interpolation.applyTo;
        })
        .forEach((interpolation) => {
          const offsetFraction = fraction - interpolation.startOffset;
          const localDuration = interpolation.endOffset - interpolation.startOffset;
          const scaledLocalTime =
            localDuration === 0 ? 0 : interpolation.easingFunction(offsetFraction / localDuration);
          // apply updated attribute
          target.style[interpolation.property] = interpolation.interpolation(scaledLocalTime);
        });
    } else {
      for (const property in propertySpecificKeyframeGroups)
        if (isNotReservedWord(property)) {
          // clear attribute
          target.style[property] = null;
        }
    }
  };
}

interface PropertySpecificKeyframe {
  offset: number | null;
  computedOffset: number;
  easing: string;
  easingFunction: TypeEasingFunction;
  value: any;
}

function isNotReservedWord(member: string) {
  return (
    member !== 'offset' &&
    member !== 'easing' &&
    member !== 'composite' &&
    member !== 'computedOffset'
  );
}

function makePropertySpecificKeyframeGroups(
  keyframes: ComputedKeyframe[],
  timing: AnimationEffectTiming,
) {
  const propertySpecificKeyframeGroups: Record<string, PropertySpecificKeyframe[]> = {};

  for (let i = 0; i < keyframes.length; i++) {
    for (const member in keyframes[i]) {
      if (isNotReservedWord(member)) {
        const propertySpecificKeyframe = {
          offset: keyframes[i].offset,
          computedOffset: keyframes[i].computedOffset,
          easing: keyframes[i].easing,
          easingFunction: parseEasingFunction(keyframes[i].easing) || timing.easingFunction,
          value: keyframes[i][member],
        };
        propertySpecificKeyframeGroups[member] = propertySpecificKeyframeGroups[member] || [];
        // @ts-ignore
        propertySpecificKeyframeGroups[member].push(propertySpecificKeyframe);
      }
    }
  }
  return propertySpecificKeyframeGroups;
}

function makeInterpolations(
  propertySpecificKeyframeGroups: Record<string, PropertySpecificKeyframe[]>,
  target: IElement | null,
) {
  const interpolations = [];
  for (const groupName in propertySpecificKeyframeGroups) {
    const keyframes = propertySpecificKeyframeGroups[groupName];
    for (let i = 0; i < keyframes.length - 1; i++) {
      let startIndex = i;
      let endIndex = i + 1;
      const startOffset = keyframes[startIndex].computedOffset;
      const endOffset = keyframes[endIndex].computedOffset;
      let applyFrom = startOffset;
      let applyTo = endOffset;

      if (i === 0) {
        applyFrom = -Infinity;
        if (endOffset === 0) {
          endIndex = startIndex;
        }
      }
      if (i === keyframes.length - 2) {
        applyTo = Infinity;
        if (startOffset === 1) {
          startIndex = endIndex;
        }
      }

      interpolations.push({
        applyFrom,
        applyTo,
        startOffset: keyframes[startIndex].computedOffset,
        endOffset: keyframes[endIndex].computedOffset,
        easingFunction: keyframes[startIndex].easingFunction,
        property: groupName,
        interpolation: propertyInterpolation(
          groupName,
          keyframes[startIndex].value,
          keyframes[endIndex].value,
          target,
        ),
      });
    }
  }
  interpolations.sort((leftInterpolation, rightInterpolation) => {
    return leftInterpolation.startOffset - rightInterpolation.startOffset;
  });
  return interpolations;
}

const InterpolationFactory = (
  from: Interpolatable,
  to: Interpolatable,
  // eslint-disable-next-line @typescript-eslint/ban-types
  convertToString: Function,
) => {
  return (f: number) => {
    return convertToString(interpolate(from, to, f));
  };
};

function propertyInterpolation(
  property: string,
  left: string | number,
  right: string | number,
  target: IElement | null,
) {
  let parsedLeft = left;
  let parsedRight = right;

  const registry = GlobalContainer.get(StyleValueRegistry);
  const metadata = registry.getMetadata(property);

  if (metadata && metadata.handler && metadata.interpolable) {
    const propertyHandler = GlobalContainer.get(metadata.handler) as CSSProperty<any, any>;

    if (propertyHandler) {
      if (propertyHandler.parser) {
        parsedLeft = propertyHandler.parser(left, target as DisplayObject);
        parsedRight = propertyHandler.parser(right, target as DisplayObject);
      }
      // if (propertyHandler.calculator) {
      //   parsedLeft = propertyHandler.calculator(parsedLeft);
      //   // parsedLeft = handler.calculator
      // }

      // merger [left, right, n2string()]
      const interpolationArgs = propertyHandler.mixer(parsedLeft, parsedRight, target);
      if (interpolationArgs) {
        // @ts-ignore
        const interp = InterpolationFactory(...interpolationArgs);
        return function (t: number) {
          if (t === 0) return left;
          if (t === 1) return right;
          return interp(t);
        };
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return InterpolationFactory(false, true, function (bool: boolean) {
    return bool ? right : left;
  });
}

/**
 * interpolate with number, boolean, number[], boolean[]
 */
function interpolate(from: Interpolatable, to: Interpolatable, f: number): Interpolatable {
  if (typeof from === 'number' && typeof to === 'number') {
    return from * (1 - f) + to * f;
  }
  if (
    (typeof from === 'boolean' && typeof to === 'boolean') ||
    (typeof from === 'string' && typeof to === 'string') // skip string, eg. path ['M', 10, 10]
  ) {
    return f < 0.5 ? from : to;
  }

  if (Array.isArray(from) && Array.isArray(to)) {
    // interpolate arrays/matrix
    if (from.length === to.length) {
      const r: number[] = [];
      for (let i = 0; i < from.length; i++) {
        r.push(interpolate(from[i], to[i], f) as number);
      }
      return r;
    }
  }
  throw new Error('Mismatched interpolation arguments ' + from + ':' + to);
}

const FORMAT_ATTR_MAP = {
  d: {
    alias: 'path',
  },
  strokeDasharray: {
    alias: 'lineDash',
  },
  strokeWidth: {
    alias: 'lineWidth',
  },
  textAnchor: {
    alias: 'textAlign',
    values: {
      middle: 'center',
    },
  },
  src: {
    alias: 'img',
  },
};

export function formatAttribute(name: string, value: any): [string, any] {
  let attributeName = camelCase(name);
  const map = FORMAT_ATTR_MAP[attributeName];
  attributeName = map?.alias || attributeName;
  const attributeValue = map?.values?.[value] || value;
  return [attributeName, attributeValue];
}
