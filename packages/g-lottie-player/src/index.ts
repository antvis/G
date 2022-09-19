import type * as Lottie from './parser/lottie-type';
import { LottieAnimation } from './LottieAnimation';
import { parse } from './parser';

export function createAnimation(data: Lottie.Animation, option): LottieAnimation {
  const { width, height, elements } = parse(data);
  return new LottieAnimation(width, height, elements);
}
