import type { RenderPass, SamplerBinding } from '../platform';
import { spliceBisectRight } from '../platform/utils';
import type { RenderCache } from './RenderCache';
import type { RenderInst } from './RenderInst';
import { RenderInstFlags } from './RenderInst';

export const renderInstCompareNone = null;

export function renderInstCompareSortKey(a: RenderInst, b: RenderInst): number {
  return a.sortKey - b.sortKey;
}

export enum RenderInstExecutionOrder {
  Forwards,
  Backwards,
}

export type RenderInstCompareFunc = (a: RenderInst, b: RenderInst) => number;

export class RenderInstList {
  renderInsts: RenderInst[] = [];
  compareFunction: RenderInstCompareFunc | null;
  executionOrder: RenderInstExecutionOrder;
  private usePostSort = false;

  constructor(
    compareFunction: RenderInstCompareFunc | null = renderInstCompareSortKey,
    executionOrder = RenderInstExecutionOrder.Forwards,
  ) {
    this.compareFunction = compareFunction;
    this.executionOrder = executionOrder;
  }

  /**
   * Determine whether to use post-sorting, based on some heuristics.
   */
  checkUsePostSort(): void {
    // Over a certain threshold, it's faster to push and then sort than insort directly...
    this.usePostSort =
      this.compareFunction !== null && this.renderInsts.length >= 500;
  }

  /**
   * Insert a render inst to the list. This directly inserts the render inst to
   * the position specified by the compare function, so the render inst must be
   * fully constructed at this point.
   */
  private insertSorted(renderInst: RenderInst): void {
    if (this.compareFunction === null) {
      this.renderInsts.push(renderInst);
    } else if (this.usePostSort) {
      this.renderInsts.push(renderInst);
    } else {
      spliceBisectRight(this.renderInsts, renderInst, this.compareFunction);
    }

    this.checkUsePostSort();
  }

  submitRenderInst(renderInst: RenderInst): void {
    renderInst.validate();
    renderInst.flags |= RenderInstFlags.Draw;
    this.insertSorted(renderInst);
  }

  hasLateSamplerBinding(name: string): boolean {
    for (let i = 0; i < this.renderInsts.length; i++)
      if (this.renderInsts[i].hasLateSamplerBinding(name)) {
        return true;
      }
    return false;
  }

  /**
   * Resolve sampler bindings for all render insts on this render inst list.
   */
  resolveLateSamplerBinding(name: string, binding: SamplerBinding): void {
    for (let i = 0; i < this.renderInsts.length; i++)
      this.renderInsts[i].resolveLateSamplerBinding(name, binding);
  }

  ensureSorted(): void {
    if (this.usePostSort) {
      if (this.renderInsts.length !== 0)
        this.renderInsts.sort(this.compareFunction!);
      this.usePostSort = false;
    }
  }

  drawOnPassRendererNoReset(
    cache: RenderCache,
    passRenderer: RenderPass,
  ): void {
    this.ensureSorted();

    if (this.executionOrder === RenderInstExecutionOrder.Forwards) {
      for (let i = 0; i < this.renderInsts.length; i++)
        this.renderInsts[i].drawOnPass(cache, passRenderer);
    } else {
      for (let i = this.renderInsts.length - 1; i >= 0; i--)
        this.renderInsts[i].drawOnPass(cache, passRenderer);
    }
  }

  reset(): void {
    this.renderInsts.length = 0;
  }

  drawOnPassRenderer(cache: RenderCache, passRenderer: RenderPass) {
    this.drawOnPassRendererNoReset(cache, passRenderer);
    this.reset();
  }
}
