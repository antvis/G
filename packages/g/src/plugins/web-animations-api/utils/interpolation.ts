import type {
  IAnimationEffectTiming,
  IElement,
  Interpolatable,
  TypeEasingFunction,
} from '@antv/g-lite';
import { propertyMetadataCache, runtime } from '@antv/g-lite';
import { isNumber } from '@antv/util';
import { parseEasingFunction } from './animation';

export function convertEffectInput(
  keyframes: ComputedKeyframe[],
  timing: IAnimationEffectTiming,
  target: IElement | null,
) {
  const propertySpecificKeyframeGroups = makePropertySpecificKeyframeGroups(
    keyframes,
    timing,
  );
  const interpolations = makeInterpolations(
    propertySpecificKeyframeGroups,
    target,
  );

  return function (target: IElement, fraction: number) {
    if (fraction !== null) {
      interpolations
        .filter((interpolation) => {
          return (
            fraction >= interpolation.applyFrom &&
            fraction < interpolation.applyTo
          );
        })
        .forEach((interpolation) => {
          const offsetFraction = fraction - interpolation.startOffset;
          const localDuration =
            interpolation.endOffset - interpolation.startOffset;
          const scaledLocalTime =
            localDuration === 0 ? 0 : offsetFraction / localDuration;
          // apply updated attribute
          target.setAttribute(
            interpolation.property,
            interpolation.interpolation(scaledLocalTime),
            false,
            false, // disable memoize
          );

          // if (interpolation.property === 'visibility') {
          //   console.log(
          //     scaledLocalTime,
          //     interpolation.interpolation(scaledLocalTime),
          //   );
          // }
        });
    } else {
      for (const property in propertySpecificKeyframeGroups)
        if (isNotReservedWord(property)) {
          // clear attribute
          target.setAttribute(property, null);
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
  timing: IAnimationEffectTiming,
) {
  const propertySpecificKeyframeGroups: Record<
    string,
    PropertySpecificKeyframe[]
  > = {};

  for (let i = 0; i < keyframes.length; i++) {
    for (const member in keyframes[i]) {
      if (isNotReservedWord(member)) {
        const propertySpecificKeyframe = {
          offset: keyframes[i].offset,
          computedOffset: keyframes[i].computedOffset,
          easing: keyframes[i].easing,
          easingFunction:
            parseEasingFunction(keyframes[i].easing) || timing.easingFunction,
          value: keyframes[i][member],
        };
        propertySpecificKeyframeGroups[member] =
          propertySpecificKeyframeGroups[member] || [];
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
  convertToString: Function,
) => {
  return (f: number) => {
    const interpolated = interpolate(from, to, f);
    return isNumber(interpolated)
      ? interpolated
      : convertToString(interpolated);
  };
};

function propertyInterpolation(
  property: string,
  left: string | number,
  right: string | number,
  target: IElement | null,
) {
  const metadata = propertyMetadataCache[property];

  if (metadata && metadata.syntax && metadata.int) {
    const propertyHandler = runtime.styleValueRegistry.getPropertySyntax(
      metadata.syntax,
    );

    if (propertyHandler) {
      const parser = propertyHandler.parser;
      const usedLeft = parser ? parser(left, target) : left;
      const usedRight = parser ? parser(right, target) : right;

      // merger [left, right, n2string()]
      const interpolationArgs = propertyHandler.mixer(
        usedLeft,
        usedRight,
        target,
      );
      if (interpolationArgs) {
        const interp = InterpolationFactory(
          // @ts-ignore
          ...interpolationArgs,
        );
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
function interpolate(
  from: Interpolatable,
  to: Interpolatable,
  f: number,
): Interpolatable {
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
    const fromLength = from.length;
    const toLength = to.length;
    const length = Math.max(fromLength, toLength);

    const r: number[] = [];
    for (let i = 0; i < length; i++) {
      r.push(
        interpolate(
          from[i < fromLength ? i : fromLength - 1],
          to[i < toLength ? i : toLength - 1],
          f,
        ) as number,
      );
    }
    return r;
  }
  throw new Error(`Mismatched interpolation arguments ${from}:${to}`);
}
