import { inject, injectable, named } from 'inversify';
import { SyncHook, SyncWaterfallHook } from 'tapable';
import { CanvasService } from '../Canvas';
import { Renderable, Sortable, SceneGraphNode } from '../components';
import { ContributionProvider } from '../contribution-provider';
import { DisplayObject } from '../DisplayObject';
import { EventPosition, InteractivePointerEvent } from '../types';
import { RenderingContext, RENDER_REASON } from './RenderingContext';
import { sortByZIndex } from './SceneGraphService';
import { Batch } from '../Batch';

export interface RenderingPlugin {
  apply(renderer: RenderingService): void;
}
export const RenderingPluginContribution = Symbol('RenderingPluginContribution');

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
@injectable()
export class RenderingService implements CanvasService {
  @inject(ContributionProvider)
  @named(RenderingPluginContribution)
  private renderingPluginContribution: ContributionProvider<RenderingPlugin>;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  hooks = {
    init: new SyncHook<[]>(),
    prepare: new SyncWaterfallHook<[DisplayObject | null]>(['object']),
    mounted: new SyncHook<[DisplayObject]>(['object']),
    unmounted: new SyncHook<[DisplayObject]>(['object']),
    attributeChanged: new SyncHook<[DisplayObject, string, any]>(['object', 'name', 'value']),
    /**
     * called at beginning of each frame, won't get called if nothing to re-render
     */
    beginFrame: new SyncHook<[]>([]),
    beforeRender: new SyncHook<[DisplayObject]>(['objectToRender']),
    render: new SyncHook<[DisplayObject]>(['objectToRender']),
    afterRender: new SyncHook<[DisplayObject]>(['objectToRender']),
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

  init() {
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

  destroy() {
    this.hooks.destroy.call();
  }

  dirtify() {
    // need re-render
    this.renderingContext.renderReasons.add(RENDER_REASON.DisplayObjectChanged);
  }

  private renderDisplayObject(displayObject: DisplayObject) {
    const entity = displayObject?.getEntity()!;

    // render itself
    const objectToRender = this.hooks.prepare.call(displayObject);

    // console.log(objectToRender);
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

    if (objectToRender?.getEntity()
      .getComponent(SceneGraphNode)?.tagName !== Batch.tag) {
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
}
