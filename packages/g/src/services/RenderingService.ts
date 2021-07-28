import { inject, injectable, named } from 'inversify';
import { SyncHook, SyncWaterfallHook } from 'tapable';
import type { CanvasService } from '../Canvas';
import { Renderable, Sortable } from '../components';
import { ContributionProvider } from '../contribution-provider';
import type { DisplayObject } from '../DisplayObject';
import type { EventPosition, InteractivePointerEvent } from '../types';
import { RenderingContext } from './RenderingContext';
import { sortByZIndex } from './SceneGraphService';

export interface RenderingPlugin {
  apply: (renderer: RenderingService) => void;
}
export const RenderingPluginContribution = Symbol('RenderingPluginContribution');

export interface PickingResult {
  position: EventPosition;
  picked: DisplayObject<any> | null;
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
@injectable()
export class RenderingService implements CanvasService {
  @inject(ContributionProvider)
  @named(RenderingPluginContribution)
  private renderingPluginContribution: ContributionProvider<RenderingPlugin>;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  hooks = {
    init: new SyncHook<[]>(),
    prepare: new SyncWaterfallHook<[DisplayObject<any> | null]>(['object']),
    mounted: new SyncHook<[DisplayObject<any>]>(['object']),
    unmounted: new SyncHook<[DisplayObject<any>]>(['object']),
    attributeChanged: new SyncHook<[DisplayObject<any>, string, any]>(['object', 'name', 'value']),
    /**
     * called at beginning of each frame, won't get called if nothing to re-render
     */
    beginFrame: new SyncHook<[]>([]),
    beforeRender: new SyncHook<[DisplayObject<any>]>(['objectToRender']),
    render: new SyncHook<[DisplayObject<any>]>(['objectToRender']),
    afterRender: new SyncHook<[DisplayObject<any>]>(['objectToRender']),
    endFrame: new SyncHook<[]>([]),
    destroy: new SyncHook<[]>(),
    pick: new SyncWaterfallHook<[PickingResult]>(['result']),
    pointerDown: new SyncHook<[InteractivePointerEvent]>(['event']),
    pointerUp: new SyncHook<[InteractivePointerEvent]>(['event']),
    pointerMove: new SyncHook<[InteractivePointerEvent]>(['event']),
    pointerOut: new SyncHook<[InteractivePointerEvent]>(['event']),
    pointerOver: new SyncHook<[InteractivePointerEvent]>(['event']),
    pointerWheel: new SyncHook<[InteractivePointerEvent]>(['event']),
  };

  async init() {
    // register rendering plugins
    this.renderingPluginContribution.getContributions(true).forEach((plugin) => {
      plugin.apply(this);
    });

    this.hooks.init.call();
  }

  render() {
    if (this.renderingContext.renderReasons.size) {
      this.renderDisplayObject(this.renderingContext.root);

      if (this.renderingContext.dirty) {
        this.hooks.endFrame.call();
        this.renderingContext.dirty = false;
      }

      this.renderingContext.renderReasons.clear();
    }
  }

  async destroy() {
    this.hooks.destroy.call();
  }

  private renderDisplayObject(displayObject: DisplayObject<any>) {
    const entity = displayObject?.getEntity()!;

    // render itself
    const objectToRender = this.hooks.prepare.call(displayObject);
    if (objectToRender) {
      if (!this.renderingContext.dirty) {
        this.renderingContext.dirty = true;
        this.hooks.beginFrame.call();
      }

      this.hooks.beforeRender.call(objectToRender);
      this.hooks.render.call(objectToRender);
      this.hooks.afterRender.call(objectToRender);

      entity.getComponent(Renderable).dirty = false;
    }

    // sort is very expensive, use cached result if posible
    const sortable = entity.getComponent(Sortable);
    if (sortable.dirty) {
      sortable.sorted = [...displayObject.children].sort(sortByZIndex);
      sortable.dirty = false;
    }

    // recursive rendering its children
    (sortable.sorted || displayObject.children).forEach((child) => {
      this.renderDisplayObject(child);
    });
  }
}
