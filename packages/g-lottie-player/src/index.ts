import type * as Lottie from './parser/lottie-type';
import { LottieAnimation } from './LottieAnimation';
import { parse } from './parser';

export interface LoadAnimationOptions {
  /**
   * @see https://github.com/airbnb/lottie-web/blob/master/player/js/animation/AnimationItem.js#L43
   */
  loop: boolean | number;

  /**
   * @see https://github.com/airbnb/lottie-web/blob/master/player/js/animation/AnimationItem.js#L42
   */
  autoplay: boolean;

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming/fill
   */
  fill: FillMode;
}

/**
 * @see https://github.com/airbnb/lottie-web/wiki/loadAnimation-options
 * @see https://github.com/airbnb/lottie-web#other-loading-options
 */
export function loadAnimation(
  data: Lottie.Animation,
  options: Partial<LoadAnimationOptions>,
): LottieAnimation {
  const { width, height, elements, context } = parse(data, options);
  return new LottieAnimation(width, height, elements, context);
}
