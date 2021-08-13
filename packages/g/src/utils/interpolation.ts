import { AnimationEffectTiming } from '../AnimationEffectTiming';
import { DisplayObject } from '../DisplayObject';
import { parseEasingFunction } from './animation';

/**
 * handlers for valid properties
 */
const propertyHandlers: Record<string, [
  Function,
  Function,
][]> = {};

function addPropertyHandler(parser: Function, merger: Function, property: string) {
  propertyHandlers[property] = propertyHandlers[property] || [];
  propertyHandlers[property].push([parser, merger]);
}
export function addPropertiesHandler(parser: Function, merger: Function, properties: string[]) {
  for (let i = 0; i < properties.length; i++) {
    addPropertyHandler(parser, merger, toCamelCase(properties[i]));
  }
}

export function convertEffectInput(
  keyframes: ComputedKeyframe[],
  timing: AnimationEffectTiming,
  target: DisplayObject | null,
) {
  const propertySpecificKeyframeGroups = makePropertySpecificKeyframeGroups(keyframes, timing);
  const interpolations = makeInterpolations(propertySpecificKeyframeGroups, target);

  return function (target: DisplayObject, fraction: number) {
    if (fraction !== null) {
      interpolations.filter((interpolation) => {
        return fraction >= interpolation.applyFrom && fraction < interpolation.applyTo;
      }).forEach((interpolation) => {
        const offsetFraction = fraction - interpolation.startOffset;
        const localDuration = interpolation.endOffset - interpolation.startOffset;
        const scaledLocalTime = localDuration === 0 ? 0 : interpolation.easingFunction(offsetFraction / localDuration);
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
  easingFunction: Function;
  value: any;
}

function isNotReservedWord(member: string) {
  return member !== 'offset' &&
    member !== 'easing' &&
    member !== 'composite' &&
    member !== 'computedOffset';
}

function makePropertySpecificKeyframeGroups(keyframes: ComputedKeyframe[], timing: AnimationEffectTiming) {
  const propertySpecificKeyframeGroups: Record<string, PropertySpecificKeyframe[]> = {};

  for (let i = 0; i < keyframes.length; i++) {
    for (const member in keyframes[i]) {
      if (isNotReservedWord(member)) {
        const propertySpecificKeyframe = {
          offset: keyframes[i].offset,
          computedOffset: keyframes[i].computedOffset,
          easing: keyframes[i].easing,
          easingFunction: parseEasingFunction(keyframes[i].easing) || timing.easingFunction,
          value: keyframes[i][member]
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
  target: DisplayObject | null,
) {
  let interpolations = [];
  for (const groupName in propertySpecificKeyframeGroups) {
    const keyframes = propertySpecificKeyframeGroups[groupName];
    for (let i = 0; i < keyframes.length - 1; i++) {
      let startIndex = i;
      let endIndex = i + 1;
      let startOffset = keyframes[startIndex].computedOffset;
      let endOffset = keyframes[endIndex].computedOffset;
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
        )
      });
    }
  }
  interpolations.sort((leftInterpolation, rightInterpolation) => {
    return leftInterpolation.startOffset - rightInterpolation.startOffset;
  });
  return interpolations;
}

function propertyInterpolation(
  property: string,
  left: string | number,
  right: string | number,
  target: DisplayObject | null,
) {
  let ucProperty = property;
  if (/-/.test(property)) {
    ucProperty = toCamelCase(property);
  }
  // if (left == 'initial' || right == 'initial') {
  //   if (left == 'initial')
  //     left = initialValues[ucProperty];
  //   if (right == 'initial')
  //     right = initialValues[ucProperty];
  // }
  const handlers = left === right ? [] : propertyHandlers[ucProperty];
  for (let i = 0; handlers && i < handlers.length; i++) {
    // parser
    const parsedLeft = handlers[i][0](left);
    const parsedRight = handlers[i][0](right);
    if (parsedLeft !== undefined && parsedRight !== undefined) {
      // merger [left, right, n2string()]
      const interpolationArgs = handlers[i][1](parsedLeft, parsedRight, target);
      if (interpolationArgs) {
        const interp = InterpolationFactory.apply(null, interpolationArgs);
        return function (t: number) {
          if (t === 0) return left;
          if (t === 1) return right;
          return interp(t);
        };
      }
    }
  }
  return InterpolationFactory(false, true, function (bool: boolean) {
    return bool ? right : left;
  });
}

function toCamelCase(property: string) {
  return property.replace(/-(.)/g, function (_, c) {
    return c.toUpperCase();
  });
}

function interpolate(
  from: number | boolean | (number | boolean)[],
  to: number | boolean | (number | boolean)[],
  f: number,
): boolean | number | number[] {
  if ((typeof from === 'number') && (typeof to === 'number')) {
    return from * (1 - f) + to * f;
  }
  if ((typeof from === 'boolean') && (typeof to === 'boolean')) {
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
  throw 'Mismatched interpolation arguments ' + from + ':' + to;
}

const InterpolationFactory = function (
  from: number | boolean | (number | boolean)[],
  to: number | boolean | (number | boolean)[],
  convertToString: Function
) {
  return (f: number) => {
    return convertToString(interpolate(from, to, f));
  }
}