import type { LayoutContext } from './LayoutContext';
import type { LayoutFragment } from './LayoutFragment';
import type { LayoutObject } from './LayoutObject';
import type { IntrinsicSizes, LayoutConstraints } from './types';
import { LayoutTaskType } from './types';
import { Deferred } from './utils';

export interface LayoutChildrenFactory {
  (options: LayoutChildrenOptions): LayoutChildren;
}
export interface LayoutChildrenOptions {
  node: LayoutObject;
}

export class LayoutChildren {
  node: LayoutObject;
  readonly styleMap: Map<string, any>;
  layoutContext: LayoutContext;

  constructor(
    protected readonly _layoutContext: LayoutContext,
    protected readonly options: LayoutChildrenOptions,
  ) {
    this.layoutContext = _layoutContext;
    this.node = options.node;
    this.styleMap = options.node.getAllStyle();
  }

  intrinsicSizes(): Promise<IntrinsicSizes> {
    // if (this.contextId !== this.layoutContext.contextId) {
    //   throw new Error('Invalid State: wrong layout context');
    // }
    const deferred = new Deferred<IntrinsicSizes>();
    this.layoutContext.appendWorkTask({
      layoutChild: this,
      taskType: LayoutTaskType.IntrinsicSizes,
      deferred,
    });
    return deferred.promise;
  }

  layoutNextFragment(constraints: LayoutConstraints): Promise<LayoutFragment> {
    // if (this.layoutContext.contextId !== this.layoutContext.contextId) {
    //   throw new Error('Invalid State: wrong layout context');
    // }

    if (this.layoutContext.mode === LayoutTaskType.IntrinsicSizes) {
      throw new Error(
        'Not Supported: cant call layoutNextFragment in intrinsicSizes',
      );
    }
    const deferred = new Deferred<LayoutFragment>();
    this.layoutContext.appendWorkTask({
      layoutConstraints: constraints,
      layoutChild: this,
      taskType: LayoutTaskType.Layout,
      deferred,
    });
    return deferred.promise;
  }
}
