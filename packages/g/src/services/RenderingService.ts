import { inject, singleton, contrib, Syringe, Contribution } from 'mana-syringe';
import { SyncHook, SyncWaterfallHook, AsyncParallelHook, AsyncSeriesWaterfallHook } from 'tapable';
import type { DisplayObject } from '..';
import { ElementEvent } from '../dom';
import type { EventPosition, InteractivePointerEvent } from '../types';
import { RenderingContext, RenderReason } from './RenderingContext';
import { SceneGraphService, sortByZIndex } from './SceneGraphService';

export interface RenderingPlugin {
  apply: (renderer: RenderingService) => void;
}

export const RenderingPluginContribution = Syringe.defineToken('RenderingPluginContribution');

export interface PickingResult {
  position: EventPosition;
  picked: DisplayObject | null;
}

/**
 * Use frame renderer implemented by `g-canvas/svg/webgl`, in every frame we do followings:
 * * update & merge dirty rectangles
 * * begin frame
 * * filter by visible
 * * sort by z-index in scene graph
 * * culling with strategies registered in `g-canvas/webgl`
 * * end frame
 */
@singleton()
export class RenderingService {
  @contrib(RenderingPluginContribution)
  private renderingPluginProvider: Contribution.Provider<RenderingPlugin>;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  @inject(SceneGraphService)
  private sceneGraphService: SceneGraphService;

  private inited = false;

  private stats = {
    total: 0,
    rendered: 0,
  };

  private zIndexCounter = 0;

  hooks = {
    init: new AsyncParallelHook<[]>(),
    prepare: new SyncWaterfallHook<[DisplayObject | null]>(['object']),
    /**
     * called at beginning of each frame, won't get called if nothing to re-render
     */
    beginFrame: new SyncHook<[]>([]),
    beforeRender: new SyncHook<[DisplayObject]>(['objectToRender']),
    render: new SyncHook<[DisplayObject]>(['objectToRender']),
    afterRender: new SyncHook<[DisplayObject]>(['objectToRender']),
    endFrame: new SyncHook<[]>([]),
    destroy: new SyncHook<[]>([]),
    pick: new AsyncSeriesWaterfallHook<[PickingResult], PickingResult>(['result']),
    pointerDown: new SyncHook<[InteractivePointerEvent]>(['event']),
    pointerUp: new SyncHook<[InteractivePointerEvent]>(['event']),
    pointerMove: new SyncHook<[InteractivePointerEvent]>(['event']),
    pointerOut: new SyncHook<[InteractivePointerEvent]>(['event']),
    pointerOver: new SyncHook<[InteractivePointerEvent]>(['event']),
    pointerWheel: new SyncHook<[InteractivePointerEvent]>(['event']),
  };

  async init() {
    // register rendering plugins
    this.renderingPluginProvider.getContributions({ cache: false }).forEach((plugin) => {
      plugin.apply(this);
    });
    await this.hooks.init.promise();
    this.inited = true;
  }

  getStats() {
    return this.stats;
  }

  render() {
    this.stats.total = 0;
    this.stats.rendered = 0;
    this.zIndexCounter = 0;

    this.sceneGraphService.syncHierarchy(this.renderingContext.root);

    if (this.renderingContext.renderReasons.size && this.inited) {
      this.renderDisplayObject(this.renderingContext.root);

      if (this.renderingContext.dirty) {
        this.hooks.endFrame.call();
        this.renderingContext.dirty = false;
      }

      this.renderingContext.renderReasons.clear();
    }

    // console.log('render objects: ', this.stats.count);
  }

  private renderDisplayObject(displayObject: DisplayObject) {
    // render itself
    const objectToRender = this.hooks.prepare.call(displayObject);
    displayObject.sortable.renderOrder = this.zIndexCounter++;

    this.stats.total++;
    if (objectToRender) {
      this.stats.rendered++;
      if (!this.renderingContext.dirty) {
        this.renderingContext.dirty = true;
        this.hooks.beginFrame.call();
      }

      this.hooks.beforeRender.call(objectToRender);
      this.hooks.render.call(objectToRender);
      this.hooks.afterRender.call(objectToRender);

      displayObject.renderable.dirty = false;
    }

    // sort is very expensive, use cached result if posible
    const sortable = displayObject.sortable;
    let renderOrderChanged = false;
    if (sortable.dirty) {
      sortable.sorted = displayObject.childNodes.slice().sort(sortByZIndex);
      renderOrderChanged = true;
      sortable.dirty = false;
    }

    // recursive rendering its children
    (sortable.sorted || displayObject.childNodes).forEach((child: DisplayObject) => {
      this.renderDisplayObject(child);
    });

    if (renderOrderChanged) {
      displayObject.forEach((child: DisplayObject) => {
        child.emit(ElementEvent.RENDER_ORDER_CHANGED, {
          renderOrder: child.sortable.renderOrder,
        });
      });
    }
  }

  destroy() {
    this.inited = false;
    this.hooks.destroy.call();
  }

  dirtify() {
    // need re-render
    this.renderingContext.renderReasons.add(RenderReason.DISPLAY_OBJECT_CHANGED);
  }
}
