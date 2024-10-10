import { IElement, IKeyframeEffect, runtime } from '@antv/g-lite';
import {
  calculateActiveDuration,
  calculateIterationProgress,
  convertEffectInput,
} from '../utils';
import type { Animation } from './Animation';
import { AnimationEffectTiming } from './AnimationEffectTiming';
import { normalizeKeyframes } from './KeyframeList';

const fills = 'backwards|forwards|both|none'.split('|');
const directions = 'reverse|alternate|alternate-reverse'.split('|');
export function makeTiming(
  timingInput: KeyframeEffectOptions,
  forGroup: boolean,
) {
  const timing = new AnimationEffectTiming();
  if (forGroup) {
    timing.fill = 'both';
    timing.duration = 'auto';
  }
  if (typeof timingInput === 'number' && !isNaN(timingInput)) {
    timing.duration = timingInput;
  } else if (timingInput !== undefined) {
    (Object.keys(timingInput) as (keyof EffectTiming)[]).forEach((property) => {
      if (
        timingInput[property] !== undefined &&
        timingInput[property] !== null &&
        timingInput[property] !== 'auto'
      ) {
        if (typeof timing[property] === 'number' || property === 'duration') {
          if (
            typeof timingInput[property] !== 'number' ||
            isNaN(timingInput[property])
          ) {
            return;
          }
        }
        if (
          property === 'fill' &&
          fills.indexOf(timingInput[property]) === -1
        ) {
          return;
        }
        if (
          property === 'direction' &&
          directions.indexOf(timingInput[property]) === -1
        ) {
          return;
        }
        // @ts-ignore
        timing[property] = timingInput[property];
      }
    });
  }
  return timing;
}

export function normalizeTimingInput(
  timingInput: KeyframeEffectOptions | number | undefined,
  forGroup: boolean,
) {
  timingInput = numericTimingToObject(timingInput ?? { duration: 'auto' });
  return makeTiming(timingInput, forGroup);
}

export function numericTimingToObject(
  timingInput: KeyframeEffectOptions | number,
) {
  if (typeof timingInput === 'number') {
    if (isNaN(timingInput)) {
      timingInput = { duration: 'auto' };
    } else {
      timingInput = { duration: timingInput };
    }
  }
  return timingInput;
}

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyframeEffect
 * @example
  const circleDownKeyframes = new KeyframeEffect(
    circle, // element to animate
    [
      { transform: 'translateY(0)' }, // keyframe
      { transform: 'translateY(100)' } // keyframe
    ],
    { duration: 3000, fill: 'forwards' } // keyframe options
  );
 *
 */
export class KeyframeEffect implements IKeyframeEffect {
  composite: CompositeOperation = 'replace';
  iterationComposite: IterationCompositeOperation = 'replace';
  // pseudoElement: string | null;
  target: IElement | null;

  animation: Animation | null;

  timing: AnimationEffectTiming;
  private computedTiming: ComputedEffectTiming;

  normalizedKeyframes: ComputedKeyframe[];

  private timeFraction: number | null;

  private interpolations: (target: IElement, f: number) => void;

  constructor(
    target: IElement | null,
    effectInput: Keyframe[] | PropertyIndexedKeyframes | null,
    timingInput?: KeyframeEffectOptions | number,
  ) {
    this.target = target;
    this.timing = normalizeTimingInput(timingInput, false);
    this.timing.effect = this;
    this.timing.activeDuration = calculateActiveDuration(this.timing);
    this.timing.endTime = Math.max(
      0,
      this.timing.delay + this.timing.activeDuration + this.timing.endDelay,
    );

    this.normalizedKeyframes = normalizeKeyframes(effectInput, this.timing);
    this.interpolations = convertEffectInput(
      this.normalizedKeyframes,
      this.timing,
      this.target,
    );

    // 不支持 proxy 时降级成 this.timing
    const { Proxy } = runtime.globalThis;
    this.computedTiming = Proxy
      ? new Proxy<AnimationEffectTiming>(this.timing, {
          get: (target, prop) => {
            if (prop === 'duration') {
              return target.duration === 'auto' ? 0 : target.duration;
            }
            if (prop === 'fill') {
              return target.fill === 'auto' ? 'none' : target.fill;
            }
            if (prop === 'localTime') {
              return (this.animation && this.animation.currentTime) || null;
            }
            if (prop === 'currentIteration') {
              if (!this.animation || this.animation.playState !== 'running') {
                return null;
              }
              return target.currentIteration || 0;
            }
            if (prop === 'progress') {
              if (!this.animation || this.animation.playState !== 'running') {
                return null;
              }
              return target.progress || 0;
            }
            return target[prop];
          },
          set: () => {
            return true;
          },
        })
      : this.timing;
  }

  applyInterpolations() {
    this.interpolations(
      this.target as unknown as IElement,
      Number(this.timeFraction),
    );
  }

  update(localTime: number | null): boolean {
    if (localTime === null) {
      return false;
    }
    this.timeFraction = calculateIterationProgress(
      this.timing.activeDuration,
      localTime,
      this.timing,
    );
    return this.timeFraction !== null;
  }

  getKeyframes(): ComputedKeyframe[] {
    return this.normalizedKeyframes;
  }
  setKeyframes(keyframes: Keyframe[] | PropertyIndexedKeyframes | null): void {
    this.normalizedKeyframes = normalizeKeyframes(keyframes);
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/AnimationEffect/getComputedTiming
   */
  getComputedTiming(): ComputedEffectTiming {
    return this.computedTiming;
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/AnimationEffect/getTiming
   */
  getTiming(): EffectTiming {
    return this.timing;
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/AnimationEffect/updateTiming
   */
  updateTiming(timing?: OptionalEffectTiming): void {
    Object.keys(timing || {}).forEach((name) => {
      this.timing[name] = timing[name];
    });
  }
}
