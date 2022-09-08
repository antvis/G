import { Module, ParseEasingFunction } from '@antv/g-lite';
import { AnimationTimeline } from './dom/AnimationTimeline';
import { parseEasingFunction } from './utils';

export const containerModule = Module((register) => {
  // bind layout engine
  register({
    token: ParseEasingFunction,
    useValue: parseEasingFunction,
  });

  register(AnimationTimeline);
});
