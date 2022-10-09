import type * as Lottie from './parser/lottie-type';
import { LottieAnimation } from './LottieAnimation';
import { parse } from './parser';

/**
 * @see https://github.com/airbnb/lottie-web/wiki/loadAnimation-options
 */
export function loadAnimation(data: Lottie.Animation, option: { loop: boolean }): LottieAnimation {
  const { width, height, elements, context } = parse(data, option);
  return new LottieAnimation(width, height, elements, context);
}
