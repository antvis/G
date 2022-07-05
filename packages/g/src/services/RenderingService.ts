import { contrib, Contribution, inject, singleton, Syringe } from 'mana-syringe';
import { Camera, DefaultCamera } from '../camera';
import { StyleValueRegistry } from '../css/interfaces';
import type { DisplayObject } from '../display-objects';
import { CustomEvent, ElementEvent } from '../dom';
import type { EventPosition, InteractivePointerEvent } from '../types';
import { CanvasConfig } from '../types';
import { AsyncParallelHook, AsyncSeriesWaterfallHook, SyncHook, SyncWaterfallHook } from '../utils';
import { RenderingContext, RenderReason } from './RenderingContext';
import { SceneGraphService, sortByZIndex } from './SceneGraphService';

export interface RenderingPlugin {
  apply: (renderer: RenderingService) => void;
}

export const RenderingPluginContribution = Syringe.defineToken('RenderingPluginContribution');

export interface PickingResult {
  /**
   * position in canvas coordinate
   */
  position: EventPosition;
  picked: DisplayObject[];
  /**
   * only return the topmost object if there are multiple objects overlapped
   */
  topmost?: boolean;
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

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  @inject(SceneGraphService)
  private sceneGraphService: SceneGraphService;

  @inject(StyleValueRegistry)
  private styleValueRegistry: StyleValueRegistry;

  @inject(DefaultCamera)
  private camera: Camera;

  private inited = false;

  private stats = {
    /**
     * total display objects in scenegraph
     */
    total: 0,
    /**
     * number of display objects need to render in current frame
     */
    rendered: 0,
  };

  private zIndexCounter = 0;

  /**
   * avoid re-creating too many custom events
   */
  private renderOrderChangedEvent = new CustomEvent(ElementEvent.RENDER_ORDER_CHANGED);

  hooks = {
    /**
     * called before any frame rendered
     */
    init: new AsyncParallelHook<[]>(),
    /**
     * only dirty object which has sth changed will be rendered
     */
    dirtycheck: new SyncWaterfallHook<[DisplayObject | null]>(['object']),
    /**
     * do culling
     */
    cull: new SyncWaterfallHook<[DisplayObject | null, Camera]>(['object', 'camera']),
    /**
     * called at beginning of each frame, won't get called if nothing to re-render
     */
    beginFrame: new SyncHook<[]>([]),
    /**
     * called before every dirty object get rendered
     */
    beforeRender: new SyncHook<[DisplayObject]>(['objectToRender']),
    /**
     * called when every dirty object rendering even it's culled
     */
    render: new SyncHook<[DisplayObject]>(['objectToRender']),
    /**
     * called after every dirty object get rendered
     */
    afterRender: new SyncHook<[DisplayObject]>(['objectToRender']),
    endFrame: new SyncHook<[]>([]),
    destroy: new SyncHook<[]>([]),
    /**
     * use async but faster method such as GPU-based picking in `g-plugin-device-renderer`
     */
    pick: new AsyncSeriesWaterfallHook<[PickingResult], PickingResult>(['result']),
    /**
     * used in event system
     */
    pointerDown: new SyncHook<[InteractivePointerEvent]>(['event']),
    pointerUp: new SyncHook<[InteractivePointerEvent]>(['event']),
    pointerMove: new SyncHook<[InteractivePointerEvent]>(['event']),
    pointerOut: new SyncHook<[InteractivePointerEvent]>(['event']),
    pointerOver: new SyncHook<[InteractivePointerEvent]>(['event']),
    pointerWheel: new SyncHook<[InteractivePointerEvent]>(['event']),
    pointerCancel: new SyncHook<[InteractivePointerEvent]>(['event']),
  };

  async init() {
    // register rendering plugins
    this.renderingPluginProvider.getContributions({ cache: false }).forEach((plugin) => {
      plugin.apply(this);
    });
    // await this.hooks.init.callPromise();
    await this.hooks.init.promise();
    this.inited = true;
  }

  getStats() {
    return this.stats;
  }

  /**
   * Meet the following conditions:
   * * disable DirtyRectangleRendering
   * * camera changed
   */
  disableDirtyRectangleRendering() {
    const { renderer } = this.canvasConfig;
    const { enableDirtyRectangleRendering } = renderer.getConfig();
    return (
      !enableDirtyRectangleRendering ||
      this.renderingContext.renderReasons.has(RenderReason.CAMERA_CHANGED)
    );
  }

  render(canvasConfig: Partial<CanvasConfig>) {
    this.stats.total = 0;
    this.stats.rendered = 0;
    this.zIndexCounter = 0;

    this.sceneGraphService.syncHierarchy(this.renderingContext.root);
    this.sceneGraphService.triggerPendingEvents();

    if (this.renderingContext.renderReasons.size && this.inited) {
      this.renderDisplayObject(this.renderingContext.root, canvasConfig);

      if (
        this.renderingContext.renderListCurrentFrame.length ||
        this.renderingContext.renderListLastFrame.length !==
          this.renderingContext.renderListCurrentFrame.length
      ) {
        this.hooks.beginFrame.call();

        this.renderingContext.renderListCurrentFrame.forEach((object) => {
          this.hooks.beforeRender.call(object);
          this.hooks.render.call(object);
          this.hooks.afterRender.call(object);
        });

        this.hooks.endFrame.call();
      }

      this.renderingContext.renderListLastFrame = [...this.renderingContext.renderListCurrentFrame];
      this.renderingContext.renderListCurrentFrame = [];
      this.renderingContext.renderReasons.clear();
    }

    // console.log('stats', this.stats);
  }

  private renderDisplayObject(displayObject: DisplayObject, canvasConfig: Partial<CanvasConfig>) {
    const { enableDirtyCheck, enableCulling } = canvasConfig.renderer.getConfig();
    // recalc style values
    this.styleValueRegistry.recalc(displayObject);

    // TODO: relayout

    // dirtycheck first
    const objectChanged = enableDirtyCheck
      ? this.hooks.dirtycheck.call(displayObject)
      : displayObject;
    if (objectChanged) {
      const objectToRender = enableCulling
        ? this.hooks.cull.call(objectChanged, this.camera)
        : objectChanged;

      if (objectToRender) {
        this.stats.rendered++;
        this.renderingContext.renderListCurrentFrame.push(objectToRender);
      }
    }

    displayObject.renderable.dirty = false;
    displayObject.sortable.renderOrder = this.zIndexCounter++;

    this.stats.total++;

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
      this.renderDisplayObject(child, canvasConfig);
    });

    if (renderOrderChanged) {
      displayObject.forEach((child: DisplayObject) => {
        this.renderOrderChangedEvent.detail = {
          renderOrder: child.sortable.renderOrder,
        };
        child.dispatchEvent(this.renderOrderChangedEvent);
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
