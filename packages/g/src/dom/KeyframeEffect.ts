import type { IElement } from '../dom/interfaces';
import {
  normalizeTimingInput,
  calculateActiveDuration,
  calculateIterationProgress,
} from '../utils/animation';
import type { AnimationEffectTiming } from './AnimationEffectTiming';
import type { Animation } from './Animation';
import { normalizeKeyframes } from './KeyframeList';
import { convertEffectInput } from '../utils/interpolation';

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
export class KeyframeEffect {
  composite: CompositeOperation = 'replace';
  iterationComposite: IterationCompositeOperation = 'replace';
  pseudoElement: string | null;
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
    this.interpolations = convertEffectInput(this.normalizedKeyframes, this.timing, this.target);

    this.computedTiming = new Proxy<AnimationEffectTiming>(this.timing, {
      get: (target, prop) => {
        if (prop === 'duration') {
          return target.duration === 'auto' ? 0 : target.duration;
        } else if (prop === 'fill') {
          return target.fill === 'auto' ? 'none' : target.fill;
        } else if (prop === 'localTime') {
          return (this.animation && this.animation.currentTime) || null;
        } else if (prop === 'currentIteration') {
          if (!this.animation || this.animation.playState !== 'running') {
            return null;
          }
          return target.currentIteration || 0;
        } else if (prop === 'progress') {
          if (!this.animation || this.animation.playState !== 'running') {
            return null;
          }
          return target.progress || 0;
        }
        return target[prop];
      },
      set: (_, prop, value) => {
        return true;
      },
    });
  }

  applyInterpolations() {
    this.interpolations(this.target as unknown as IElement, Number(this.timeFraction));
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
      this.timing = timing[name];
    });
  }
}
