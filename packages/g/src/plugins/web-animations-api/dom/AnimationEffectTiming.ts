import { linear, parseEasingFunction } from '../utils/animation';
import type { KeyframeEffect } from './KeyframeEffect';

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming
 */
export class AnimationEffectTiming implements EffectTiming {
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming/delay
   */
  delay = 0;

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming/direction
   */
  direction: PlaybackDirection = 'normal';

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming/duration
   */
  duration: number | 'auto' = 'auto';

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming/easing
   */
  private _easing = 'linear';
  easingFunction = linear;
  get easing() {
    return this._easing;
  }
  set easing(value: string) {
    this.easingFunction = parseEasingFunction(value);
    this._easing = value;
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming/endDelay
   */
  endDelay = 0;

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming/fill
   */
  fill: FillMode = 'auto';

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming/iterationStart
   */
  iterationStart = 0;

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming/iterations
   */
  iterations = 1;

  /**
   * @deprecated
   */
  playbackRate: number;

  /**
   * ref to effect
   */
  effect: KeyframeEffect;

  composite: string;

  /**
   * ComputedEffectTiming
   * @see https://developer.mozilla.org/en-US/docs/Web/API/AnimationEffect/getComputedTiming
   */
  activeDuration: number;

  endTime: number;

  currentIteration: number | null = null;

  progress: number | null = null;
}
