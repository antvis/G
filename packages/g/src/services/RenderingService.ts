import { inject, injectable, named } from 'inversify';
import { SyncHook, SyncWaterfallHook } from 'tapable';
import { CanvasService } from '../Canvas';
import { SceneGraphNode } from '../components';
import { ContributionProvider } from '../contribution-provider';
import { DisplayObject } from '../DisplayObject';
import { InteractivePointerEvent } from '../InteractionEvent';
import { EventPosition } from '../types';
import { RenderingContext } from './RenderingContext';
import { SceneGraphService } from './SceneGraphService';

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
    prepare: new SyncWaterfallHook<[DisplayObject[], DisplayObject]>(['objects', 'root']),
    mounted: new SyncHook<[DisplayObject]>(['object']),
    unmounted: new SyncHook<[DisplayObject]>(['object']),
    attributeChanged: new SyncHook<[DisplayObject, string, any]>(['object', 'name', 'value']),
    beforeRender: new SyncHook<[DisplayObject[], DisplayObject[]]>(['objectsToRender', 'objects']),
    render: new SyncHook<[DisplayObject[], DisplayObject[]]>(['objectsToRender', 'objects']),
    afterRender: new SyncHook<[DisplayObject[], DisplayObject[]]>(['objectsToRender', 'objects']),
    destroy: new SyncHook<[]>(),
    pick: new SyncWaterfallHook<[PickingResult]>(['result']),
    pointerDown: new SyncHook<[PointerEvent, InteractivePointerEvent]>(['event', 'original']),
    pointerUp: new SyncHook<[PointerEvent, InteractivePointerEvent]>(['event', 'original']),
    pointerMove: new SyncHook<[PointerEvent, InteractivePointerEvent]>(['event', 'original']),
    pointerCancel: new SyncHook<[PointerEvent, InteractivePointerEvent]>(['event', 'original']),
    pointerOut: new SyncHook<[PointerEvent, InteractivePointerEvent]>(['event', 'original']),
    pointerOver: new SyncHook<[PointerEvent, InteractivePointerEvent]>(['event', 'original']),
    pointerWheel: new SyncHook<[PointerEvent, InteractivePointerEvent]>(['event', 'original']),
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
    const objects: DisplayObject[] = [];
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
