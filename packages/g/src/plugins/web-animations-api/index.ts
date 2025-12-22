import { runtime } from '@antv/g-lite';
import { AnimationTimeline } from './dom/AnimationTimeline';
import { parseEasingFunction } from './utils';

export * from './dom';
export { EasingFunctions } from './utils';

runtime.EasingFunction = parseEasingFunction;
runtime.AnimationTimeline = AnimationTimeline;
