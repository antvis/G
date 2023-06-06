import type { GlobalRuntime } from '../global-runtime';
import { runtime } from '../global-runtime';
import type { ICamera } from '../camera';
import type { DisplayObject } from '../display-objects';
import type { CanvasContext, IChildNode, IElement } from '../dom';
import type {
  EventPosition,
  InteractivePointerEvent,
  CanvasConfig,
} from '../types';
import {
  AsyncParallelHook,
  AsyncSeriesWaterfallHook,
  sortByZIndex,
  sortedIndex,
  SyncHook,
  SyncWaterfallHook,
} from '../utils';
import type { RenderingContext } from './RenderingContext';
import { RenderReason } from './RenderingContext';
import { SortReason, Sortable } from '../components';

export type RenderingPluginContext = CanvasContext & GlobalRuntime;

export interface RenderingPlugin {
  apply: (context: RenderingPluginContext, runtime: GlobalRuntime) => void;
}

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
export class RenderingService {
  constructor(
    private globalRuntime: GlobalRuntime,
    private context: CanvasContext,
  ) {}

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

  hooks = {
    /**
     * called before any frame rendered
     */
    init: new AsyncParallelHook<[]>(),
    /**
     * only dirty object which has sth changed will be rendered
     */
    dirtycheck: new SyncWaterfallHook<[DisplayObject], DisplayObject>(),
    /**
     * do culling
     */
    cull: new SyncWaterfallHook<[DisplayObject, ICamera], DisplayObject>(),
    /**
     * called at beginning of each frame, won't get called if nothing to re-render
     */
    beginFrame: new SyncHook<[]>(),
    /**
     * called before every dirty object get rendered
     */
    beforeRender: new SyncHook<[DisplayObject]>(),
    /**
     * called when every dirty object rendering even it's culled
     */
    render: new SyncHook<[DisplayObject]>(),
    /**
     * called after every dirty object get rendered
     */
    afterRender: new SyncHook<[DisplayObject]>(),
    endFrame: new SyncHook<[]>(),
    destroy: new SyncHook<[]>(),
    /**
     * use async but faster method such as GPU-based picking in `g-plugin-device-renderer`
     */
    pick: new AsyncSeriesWaterfallHook<[PickingResult], PickingResult>(),

    /**
     * Unsafe but sync version of pick.
     */
    pickSync: new SyncWaterfallHook<[PickingResult], PickingResult>(),
    /**
     * used in event system
     */
    pointerDown: new SyncHook<[InteractivePointerEvent]>(),
    pointerUp: new SyncHook<[InteractivePointerEvent]>(),
    pointerMove: new SyncHook<[InteractivePointerEvent]>(),
    pointerOut: new SyncHook<[InteractivePointerEvent]>(),
    pointerOver: new SyncHook<[InteractivePointerEvent]>(),
    pointerWheel: new SyncHook<[InteractivePointerEvent]>(),
    pointerCancel: new SyncHook<[InteractivePointerEvent]>(),
    click: new SyncHook<[InteractivePointerEvent]>(),
  };

  async init() {
    const context = { ...this.globalRuntime, ...this.context };

    // register rendering plugins
    this.context.renderingPlugins.forEach((plugin) => {
      plugin.apply(context, runtime);
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
    const { renderer } = this.context.config;
    const { enableDirtyRectangleRendering } = renderer.getConfig();
    return (
      !enableDirtyRectangleRendering ||
      this.context.renderingContext.renderReasons.has(
        RenderReason.CAMERA_CHANGED,
      )
    );
  }

  render(canvasConfig: Partial<CanvasConfig>, rerenderCallback: () => void) {
    this.stats.total = 0;
    this.stats.rendered = 0;
    this.zIndexCounter = 0;

    const { renderingContext } = this.context;

    this.globalRuntime.sceneGraphService.syncHierarchy(renderingContext.root);
    this.globalRuntime.sceneGraphService.triggerPendingEvents();

    if (renderingContext.renderReasons.size && this.inited) {
      this.renderDisplayObject(
        renderingContext.root,
        canvasConfig,
        renderingContext,
      );

      this.hooks.beginFrame.call();

      renderingContext.renderListCurrentFrame.forEach((object) => {
        this.hooks.beforeRender.call(object);
        this.hooks.render.call(object);
        this.hooks.afterRender.call(object);
      });

      this.hooks.endFrame.call();
      renderingContext.renderListCurrentFrame = [];
      renderingContext.renderReasons.clear();

      rerenderCallback();
    }

    // console.log('stats', this.stats);
  }

  private renderDisplayObject(
    displayObject: DisplayObject,
    canvasConfig: Partial<CanvasConfig>,
    renderingContext: RenderingContext,
  ) {
    const { enableDirtyCheck, enableCulling } =
      canvasConfig.renderer.getConfig();
    // recalc style values

    if (this.globalRuntime.enableCSSParsing) {
      this.globalRuntime.styleValueRegistry.recalc(displayObject);
    }

    // TODO: relayout

    // dirtycheck first
    const objectChanged = enableDirtyCheck
      ? this.hooks.dirtycheck.call(displayObject)
      : displayObject;
    if (objectChanged) {
      const objectToRender = enableCulling
        ? this.hooks.cull.call(objectChanged, this.context.camera)
        : objectChanged;

      if (objectToRender) {
        this.stats.rendered++;
        renderingContext.renderListCurrentFrame.push(objectToRender);
      }
    }

    displayObject.renderable.dirty = false;
    displayObject.sortable.renderOrder = this.zIndexCounter++;

    this.stats.total++;

    // sort is very expensive, use cached result if possible
    const sortable = displayObject.sortable;
    if (sortable.dirty) {
      this.sort(displayObject, sortable);
      sortable.dirty = false;
      sortable.dirtyChildren = [];
      sortable.dirtyReason = undefined;
    }

    // recursive rendering its children
    (sortable.sorted || displayObject.childNodes).forEach(
      (child: DisplayObject) => {
        this.renderDisplayObject(child, canvasConfig, renderingContext);
      },
    );
  }

  private sort(displayObject: DisplayObject, sortable: Sortable) {
    if (
      sortable.sorted &&
      sortable.dirtyReason !== SortReason.Z_INDEX_CHANGED
    ) {
      // avoid re-sorting the whole children list
      sortable.dirtyChildren.forEach((child) => {
        const index = displayObject.childNodes.indexOf(child as IChildNode);
        if (index === -1) {
          // remove from sorted list
          const index = sortable.sorted.indexOf(child);
          sortable.sorted.splice(index, 1);
        } else {
          if (sortable.sorted.length === 0) {
            sortable.sorted.push(child);
          } else {
            const index = sortedIndex(
              sortable.sorted as IElement[],
              child as IElement,
            );
            sortable.sorted.splice(index, 0, child);
          }
        }
      });
    } else {
      sortable.sorted = displayObject.childNodes.slice().sort(sortByZIndex);
    }
  }

  destroy() {
    this.inited = false;
    this.hooks.destroy.call();
    this.globalRuntime.sceneGraphService.clearPendingEvents();
  }

  dirtify() {
    // need re-render
    this.context.renderingContext.renderReasons.add(
      RenderReason.DISPLAY_OBJECT_CHANGED,
    );
  }
}
