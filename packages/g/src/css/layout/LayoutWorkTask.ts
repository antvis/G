import type { Deferred } from '../../utils';
import type { LayoutChildren } from './LayoutChildren';
import type { LayoutFragment } from './LayoutFragment';
import type { IntrinsicSizes, LayoutConstraints, LayoutTaskType } from './types';

export type LayoutWorkTask =
  | {
      layoutConstraints: LayoutConstraints;
      layoutChild: LayoutChildren;
      taskType: LayoutTaskType.Layout;
      deferred: Deferred<LayoutFragment>;
    }
  | {
      layoutChild: LayoutChildren;
      taskType: LayoutTaskType.IntrinsicSizes;
      deferred: Deferred<IntrinsicSizes>;
    };
