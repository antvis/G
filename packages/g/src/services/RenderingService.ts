import { inject, injectable, named } from 'inversify';
import { SyncHook, SyncWaterfallHook } from 'tapable';
import { CanvasService } from '../Canvas';
import { SceneGraphNode } from '../components';
import { ContributionProvider } from '../contribution-provider';
import { DisplayObject } from '../DisplayObject';
import { EventPosition, InteractivePointerEvent } from '../types';
import { RenderingContext } from './RenderingContext';

export interface RenderingPlugin {
  apply(renderer: RenderingService): void;
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
    prepare: new SyncWaterfallHook<[DisplayObject<any>[], DisplayObject<any>]>(['objects', 'root']),
    mounted: new SyncHook<[DisplayObject<any>]>(['object']),
    unmounted: new SyncHook<[DisplayObject<any>]>(['object']),
    attributeChanged: new SyncHook<[DisplayObject<any>, string, any]>(['object', 'name', 'value']),
    beforeRender: new SyncHook<[DisplayObject<any>[], DisplayObject<any>[]]>(['objectsToRender', 'objects']),
    render: new SyncHook<[DisplayObject<any>[], DisplayObject<any>[]]>(['objectsToRender', 'objects']),
    afterRender: new SyncHook<[DisplayObject<any>[], DisplayObject<any>[]]>(['objectsToRender', 'objects']),
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
    this.renderingContext.dirtyRectangle = undefined;
    // register rendering plugins
    this.renderingPluginContribution.getContributions(true).forEach((plugin) => {
      plugin.apply(this);
    });

    this.hooks.init.call();
  }

  render() {
    const root = this.renderingContext.root;
    const objects: DisplayObject<any>[] = [];
    root.forEach((node) => {
      if (!node.getEntity().getComponent(SceneGraphNode).shadow) {
        objects.push(node);
      }
    });

    this.renderingContext.displayObjects = objects;

    // subset of all objects to render at this frame
    const objectsToRender = this.hooks.prepare.call(objects, root);
    if (objectsToRender.length === 0 && !this.renderingContext.force) {
      return;
    }

    // console.log(objectsToRender);

    this.renderingContext.dirtyDisplayObjects = objectsToRender;

    this.hooks.beforeRender.call(objectsToRender, objects);
    // render entities one by one
    this.hooks.render.call(objectsToRender, objects);
    this.hooks.afterRender.call(objectsToRender, objects);
  }

  destroy() {
    this.hooks.destroy.call();
  }
}
