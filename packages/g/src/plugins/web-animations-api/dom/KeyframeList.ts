import { isNil } from '@antv/util';
import type { AnimationEffectTiming } from './AnimationEffectTiming';

/**
 * @example
  {
    translateY: [200, 300],
    scale: [1, 10],
  }

 * groups' length can be different, the following config should generate 3 frames:
  @example
  {
    translateY: [200, 300, 400],
    scale: [1, 10],
  }
 */
function convertToArrayForm(effectInput: PropertyIndexedKeyframes) {
  const normalizedEffectInput: Keyframe[] = [];

  for (const property in effectInput) {
    // skip reserved props
    if (property in ['easing', 'offset', 'composite']) {
      continue;
    }

    // @ts-ignore
    let values: string[] | (number | null)[] = effectInput[property];
    if (!Array.isArray(values)) {
      values = [values];
    }

    const numKeyframes = values.length;
    for (let i = 0; i < numKeyframes; i++) {
      if (!normalizedEffectInput[i]) {
        const keyframe: Keyframe = {};
        if ('offset' in effectInput) {
          keyframe.offset = Number(effectInput.offset);
        }

        if ('easing' in effectInput) {
          // @ts-ignore
          keyframe.easing = effectInput.easing;
        }

        if ('composite' in effectInput) {
          // @ts-ignore
          keyframe.composite = effectInput.composite;
        }
        normalizedEffectInput[i] = keyframe;
      }

      if (values[i] !== undefined && values[i] !== null) {
        normalizedEffectInput[i][property] = values[i];
      }
    }
  }

  normalizedEffectInput.sort(function (a, b) {
    return (
      ((a.computedOffset as number) || 0) - ((b.computedOffset as number) || 0)
    );
  });
  return normalizedEffectInput;
}

export function normalizeKeyframes(
  effectInput: Keyframe[] | PropertyIndexedKeyframes | null,
  timing?: AnimationEffectTiming,
): ComputedKeyframe[] {
  if (effectInput === null) {
    return [];
  }

  if (!Array.isArray(effectInput)) {
    effectInput = convertToArrayForm(effectInput);
  }

  let keyframes = effectInput.map((originalKeyframe) => {
    const keyframe: Keyframe = {};

    if (timing?.composite) {
      // This will be auto if the composite operation specified on the effect is being used.
      // @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Keyframe_Formats
      keyframe.composite = 'auto';
    }

    for (const member in originalKeyframe) {
      let memberValue = originalKeyframe[member];
      if (member === 'offset') {
        if (memberValue !== null) {
          memberValue = Number(memberValue);
          if (!isFinite(memberValue))
            throw new Error('Keyframe offsets must be numbers.');
          if (memberValue < 0 || memberValue > 1)
            throw new Error('Keyframe offsets must be between 0 and 1.');
          keyframe.computedOffset = memberValue;
        }
      } else if (member === 'composite') {
        // TODO: Support add & accumulate in KeyframeEffect.composite
        // @see https://developer.mozilla.org/en-US/docs/Web/API/KeyframeEffect/composite
        if (
          ['replace', 'add', 'accumulate', 'auto'].indexOf(
            memberValue as string,
          ) === -1
        ) {
          throw new Error(`${memberValue} compositing is not supported`);
        }
      } else if (member === 'easing') {
        // TODO: Validate animation-timing-function
        // @see https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timing-function
        // memberValue = memberValue;
        // } else {
        //   memberValue = '' + memberValue;
      }

      // assign to keyframe, no need to parse shorthand value
      keyframe[member] = memberValue;
    }
    if (keyframe.offset === undefined) {
      keyframe.offset = null;
    }
    if (keyframe.easing === undefined) {
      // override with timing.easing
      keyframe.easing = timing?.easing || 'linear';
    }
    if (keyframe.composite === undefined) {
      keyframe.composite = 'auto';
    }
    return keyframe;
  });

  let everyFrameHasOffset = true;
  let previousOffset = -Infinity;
  for (let i = 0; i < keyframes.length; i++) {
    const { offset } = keyframes[i];
    if (!isNil(offset)) {
      if (offset < previousOffset) {
        throw new TypeError(
          'Keyframes are not loosely sorted by offset. Sort or specify offsets.',
        );
      }
      previousOffset = offset;
    } else {
      everyFrameHasOffset = false;
    }
  }

  keyframes = keyframes.filter((keyframe) => {
    return Number(keyframe.offset) >= 0 && Number(keyframe.offset) <= 1;
  });

  function spaceKeyframes() {
    const { length } = keyframes;
    keyframes[length - 1].computedOffset = Number(
      keyframes[length - 1].offset ?? 1,
    );
    if (length > 1) {
      keyframes[0].computedOffset = Number(keyframes[0].offset ?? 0);
    }

    let previousIndex = 0;
    let previousOffset = Number(keyframes[0].computedOffset);
    for (let i = 1; i < length; i++) {
      const offset = keyframes[i].computedOffset;
      if (!isNil(offset) && !isNil(previousOffset)) {
        for (let j = 1; j < i - previousIndex; j++)
          keyframes[previousIndex + j].computedOffset =
            previousOffset +
            ((Number(offset) - previousOffset) * j) / (i - previousIndex);
        previousIndex = i;
        previousOffset = Number(offset);
      }
    }
  }
  if (!everyFrameHasOffset) spaceKeyframes();

  return keyframes as ComputedKeyframe[];
}
