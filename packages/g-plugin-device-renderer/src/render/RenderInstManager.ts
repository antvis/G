import type { RenderPass } from '@antv/g-device-api';
import { assert, assertExists } from '@antv/g-device-api';
import type { RenderCache } from './RenderCache';
import type { RenderInst } from './RenderInst';
import { RenderInstFlags } from './RenderInst';
import { RenderInstList } from './RenderInstList';
import { RenderInstPool } from './RenderInstPool';

export class RenderInstManager {
  instPool = new RenderInstPool();
  templatePool = new RenderInstPool();
  simpleRenderInstList: RenderInstList | null = new RenderInstList();
  currentRenderInstList: RenderInstList = this.simpleRenderInstList;

  constructor(public renderCache: RenderCache) {}

  /**
   * Creates a new RenderInst object and returns it. If there is a template
   * pushed onto the template stack, then its values will be used as a base for this
   * render inst.
   */
  newRenderInst(): RenderInst {
    const templateIndex = this.templatePool.allocCount - 1;
    const renderInstIndex = this.instPool.allocRenderInstIndex();
    const renderInst = this.instPool.pool[renderInstIndex];
    renderInst.debug = null;
    if (templateIndex >= 0)
      renderInst.setFromTemplate(this.templatePool.pool[templateIndex]);
    return renderInst;
  }

  /**
   * Submits RenderInst to the current render inst list. Note that
   * this assumes the render inst was fully filled in, so do not modify it
   * after submitting it.
   */
  submitRenderInst(
    renderInst: RenderInst,
    list: RenderInstList = this.currentRenderInstList,
  ): void {
    list.submitRenderInst(renderInst);
  }

  /**
   * Sets the currently active render inst list. This is the list that will
   * be used by @param submitRenderInst}. If you use this function, please
   * make sure to call {@see disableSimpleMode} when the RenderInstManager
   * is created, to ensure that nobody uses the "legacy" APIs. Failure to do
   * so might cause memory leaks or other problems.
   */
  setCurrentRenderInstList(list: RenderInstList): void {
    assert(this.simpleRenderInstList === null);
    this.currentRenderInstList = list;
  }

  /**
   * Pushes a new template render inst to the template stack. All properties set
   * on the topmost template on the template stack will be the defaults for both
   * for any future render insts created. Once done with a template, call
   * {@param popTemplateRenderInst} to pop it off the template stack.
   */
  pushTemplateRenderInst(): RenderInst {
    const templateIndex = this.templatePool.allocCount - 1;
    const newTemplateIndex = this.templatePool.allocRenderInstIndex();
    const newTemplate = this.templatePool.pool[newTemplateIndex];
    if (templateIndex >= 0)
      newTemplate.setFromTemplate(this.templatePool.pool[templateIndex]);
    newTemplate.flags |= RenderInstFlags.Template;
    return newTemplate;
  }

  popTemplateRenderInst(): void {
    this.templatePool.popRenderInst();
  }

  /**
   * Retrieves the current template render inst on the top of the template stack.
   */
  getTemplateRenderInst(): RenderInst {
    const templateIndex = this.templatePool.allocCount - 1;
    return this.templatePool.pool[templateIndex];
  }

  /**
   * Reset all allocated render insts. This should be called at the end of the frame,
   * once done with all of the allocated render insts and render inst lists.
   */
  resetRenderInsts(): void {
    // Retire the existing render insts.
    this.instPool.reset();
    if (this.simpleRenderInstList !== null) this.simpleRenderInstList.reset();
    // Ensure we aren't leaking templates.
    assert(this.templatePool.allocCount === 0);
  }

  destroy(): void {
    this.instPool.destroy();
    this.renderCache.destroy();
  }

  /**
   * Disables the "simple" render inst list management API.
   */
  disableSimpleMode(): void {
    // This is a one-way street!
    this.simpleRenderInstList = null;
  }

  // /**
  //  * Execute all scheduled render insts in {@param list} onto the {@param RenderPass},
  //  * using {@param device} and {@param cache} to create any device-specific resources
  //  * necessary to complete the draws.
  //  */
  // drawListOnPassRenderer(list: RenderInstList, passRenderer: RenderPass): void {
  //   list.drawOnPassRenderer(this.renderCache, passRenderer);
  // }

  drawOnPassRenderer(passRenderer: RenderPass): void {
    const list = assertExists(this.simpleRenderInstList);
    list.drawOnPassRenderer(this.renderCache, passRenderer);
  }

  drawOnPassRendererNoReset(passRenderer: RenderPass): void {
    const list = assertExists(this.simpleRenderInstList);
    list.drawOnPassRendererNoReset(this.renderCache, passRenderer);
  }
}
