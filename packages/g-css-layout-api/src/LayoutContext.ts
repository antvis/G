import type { FragmentResultFactory } from './FragmentResult';
import type { LayoutChildrenFactory } from './LayoutChildren';
import type { LayoutFragmentFactory } from './LayoutFragment';
import type { LayoutWorkTask } from './LayoutWorkTask';
import type { ContextId, LayoutTaskType } from './types';

export interface LayoutContextFactory {
  (options: { mode: LayoutTaskType }): LayoutContext;
}
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
export class LayoutContext {
  contextId: ContextId;
  workQueue: LayoutWorkTask[] = [];
  mode: LayoutTaskType;

  layoutChildrenFactory: LayoutChildrenFactory;

  fragmentResultFactory: FragmentResultFactory;

  layoutFragmentFactory: LayoutFragmentFactory;

  constructor(protected readonly options: LayoutContextOptions) {
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
