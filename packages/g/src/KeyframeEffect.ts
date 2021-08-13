import { normalizeTimingInput, calculateActiveDuration, calculateIterationProgress } from './utils/animation';
import { AnimationEffectTiming } from './AnimationEffectTiming';
import { normalizeKeyframes } from './KeyframeList';
import { DisplayObject } from './DisplayObject';
import { Animation } from './Animation';
import { convertEffectInput } from './utils/interpolation';

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
  target: DisplayObject | null;

  animation: Animation | null;

  private timing: AnimationEffectTiming;

  normalizedKeyframes: ComputedKeyframe[];

  private timeFraction: number | null;

  private interpolations: (target: DisplayObject, f: number) => void;

  constructor(
    target: DisplayObject | null,
    effectInput: Keyframe[] | PropertyIndexedKeyframes | null,
    timingInput?: KeyframeEffectOptions | number,
  ) {
    this.target = target;
    this.timing = normalizeTimingInput(timingInput, false);
    this.timing.effect = this;
    this.timing.activeDuration = calculateActiveDuration(this.timing);
    this.timing.endTime = Math.max(0, this.timing.delay + this.timing.activeDuration + this.timing.endDelay);

    this.normalizedKeyframes = normalizeKeyframes(effectInput, this.timing);
    this.interpolations = convertEffectInput(this.normalizedKeyframes, this.timing, this.target);
  }

  applyInterpolations() {
    this.interpolations(this.target as unknown as DisplayObject, Number(this.timeFraction));
  }

  update(localTime: number | null): boolean {
    if (localTime === null) {
      return false;
    }
    this.timeFraction = calculateIterationProgress(this.timing.activeDuration, localTime, this.timing)
    return this.timeFraction !== null;
  }

  getKeyframes(): ComputedKeyframe[] {
    return this.normalizedKeyframes;
  }
  setKeyframes(keyframes: Keyframe[] | PropertyIndexedKeyframes | null): void {
    this.normalizedKeyframes = normalizeKeyframes(keyframes);
  }
  getComputedTiming(): ComputedEffectTiming {
    return this.timing;
  }
  getTiming(): EffectTiming {
    return this.timing;
  }
  updateTiming(timing?: OptionalEffectTiming): void {
    throw new Error("Method not implemented.");
  }
}