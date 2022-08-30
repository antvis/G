import { AnimationTimelineToken, container, ParseEasingFunction } from '@antv/g-lite';
import { AnimationTimeline } from './dom/AnimationTimeline';
import { parseEasingFunction } from './utils';

container.register(ParseEasingFunction, {
  useValue: parseEasingFunction,
});

container.registerSingleton(AnimationTimelineToken, AnimationTimeline);
