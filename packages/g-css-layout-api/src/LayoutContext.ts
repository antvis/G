import { inject, singleton } from '@antv/g-lite';
import type { FragmentResultFactory } from './FragmentResult';
import type { LayoutChildrenFactory } from './LayoutChildren';
import type { LayoutFragmentFactory } from './LayoutFragment';
import type { LayoutWorkTask } from './LayoutWorkTask';
import type { ContextId, LayoutTaskType } from './types';

export const LayoutContextFactory = 'LayoutContextFactory';
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface LayoutContextFactory {
  (options: { mode: LayoutTaskType }): LayoutContext;
}

export const LayoutContextOptions = 'LayoutContextOptions';
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface LayoutContextOptions {
  mode: LayoutTaskType;
  layoutChildrenFactory: LayoutChildrenFactory;

  fragmentResultFactory: FragmentResultFactory;

  layoutFragmentFactory: LayoutFragmentFactory;
}

let guid = 0;

/**
 * 每次layout 有单独的 context
 */
@singleton()
export class LayoutContext {
  contextId: ContextId;
  workQueue: LayoutWorkTask[] = [];
  mode: LayoutTaskType;

  layoutChildrenFactory: LayoutChildrenFactory;

  fragmentResultFactory: FragmentResultFactory;

  layoutFragmentFactory: LayoutFragmentFactory;

  constructor(@inject(LayoutContextOptions) protected readonly options: LayoutContextOptions) {
    this.contextId = `${guid++}`;
    this.mode = options.mode;
    this.layoutChildrenFactory = options.layoutChildrenFactory;
    this.fragmentResultFactory = options.fragmentResultFactory;
    this.layoutFragmentFactory = options.layoutFragmentFactory;
  }

  appendWorkTask(work: LayoutWorkTask) {
    this.workQueue.push(work);
  }

  clearWorkQueue() {
    this.workQueue = [];
  }
}
