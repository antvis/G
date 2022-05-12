import { inject, singleton, Syringe } from 'mana-syringe';
import type { LayoutWorkTask } from './LayoutWorkTask';
import type { LayoutTaskType } from './types';
import type { ContextId } from './types';
import type { FragmentResultFactory } from './FragmentResult';
import type { LayoutChildrenFactory } from './LayoutChildren';
import type { LayoutFragmentFactory } from './LayoutFragment';

export const LayoutContextFactory = Syringe.defineToken('LayoutContextFactory');
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface LayoutContextFactory {
  (options: { mode: LayoutTaskType }): LayoutContext;
}

export const LayoutContextOptions = Syringe.defineToken('LayoutContextOptions');
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
