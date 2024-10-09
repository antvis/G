import type RBush from 'rbush';
import { runtime } from '../global-runtime';
import type { RBushNodeAABB } from '../components';
import type { DisplayObject } from '../display-objects';
import type { FederatedEvent } from '../dom';
import { ElementEvent } from '../dom';
import type { RenderingPlugin, RenderingPluginContext } from '../services';
import { raf } from '../utils';
import { AABB } from '../shapes';

export class PrepareRendererPlugin implements RenderingPlugin {
  static tag = 'Prepare';
  private rBush: RBush<RBushNodeAABB>;

  /**
   * sync to RBush later
   */
  private toSync = new Set<DisplayObject>();

  private syncing = false;

  isFirstTimeRenderingFinished = false;

  apply(context: RenderingPluginContext) {
    const { renderingService, renderingContext, rBushRoot } = context;
    const canvas = renderingContext.root.ownerDocument.defaultView;

    this.rBush = rBushRoot;

    const handleAttributeChanged = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;
      object.renderable.dirty = true;
      renderingService.dirtify();
    };

    const handleBoundsChanged = (e: FederatedEvent) => {
      const { affectChildren } = e.detail;
      const object = e.target as DisplayObject;
      if (affectChildren) {
        object.forEach((node: DisplayObject) => {
          this.toSync.add(node);
        });
      }

      let p = object;
      while (p) {
        if (p.renderable) {
          this.toSync.add(p);
        }
        p = p.parentElement as DisplayObject;
      }

      // this.pushToSync(e.composedPath().slice(0, -2) as DisplayObject[]);
      renderingService.dirtify();
    };

    const handleMounted = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;

      if (runtime.enableSizeAttenuation) {
        runtime.styleValueRegistry.updateSizeAttenuation(
          object,
          canvas.getCamera().getZoom(),
        );
      }

      if (runtime.enableCSSParsing) {
        // recalc style values
        runtime.styleValueRegistry.recalc(object);
      }

      runtime.sceneGraphService.dirtifyToRoot(object);
      renderingService.dirtify();
    };

    const handleUnmounted = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;
      const rBushNode = object.rBushNode;
      if (rBushNode.aabb) {
        this.rBush.remove(rBushNode.aabb);
      }

      this.toSync.delete(object);

      runtime.sceneGraphService.dirtifyToRoot(object);
      renderingService.dirtify();
    };

    renderingService.hooks.init.tap(PrepareRendererPlugin.tag, () => {
      canvas.addEventListener(ElementEvent.MOUNTED, handleMounted);
      canvas.addEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      canvas.addEventListener(
        ElementEvent.ATTR_MODIFIED,
        handleAttributeChanged,
      );
      canvas.addEventListener(ElementEvent.BOUNDS_CHANGED, handleBoundsChanged);
    });

    renderingService.hooks.destroy.tap(PrepareRendererPlugin.tag, () => {
      canvas.removeEventListener(ElementEvent.MOUNTED, handleMounted);
      canvas.removeEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      canvas.removeEventListener(
        ElementEvent.ATTR_MODIFIED,
        handleAttributeChanged,
      );
      canvas.removeEventListener(
        ElementEvent.BOUNDS_CHANGED,
        handleBoundsChanged,
      );

      this.toSync.clear();
    });

    const ric =
      runtime.globalThis.requestIdleCallback ?? raf.bind(runtime.globalThis);
    renderingService.hooks.endFrame.tap(PrepareRendererPlugin.tag, () => {
      const frame = context.renderingService.frame;
      if (frame === 1) {
        // skip
      } else if (frame === 2) {
        this.syncing = true;
        ric(() => {
          this.syncRTree(true);
          this.isFirstTimeRenderingFinished = true;
        });
      } else {
        this.syncRTree();
      }
    });
  }

  private syncRTree(force = false) {
    if (!force && (this.syncing || this.toSync.size === 0)) {
      return;
    }

    this.syncing = true;

    // bounds changed, need re-inserting its children
    const bulk: RBushNodeAABB[] = [];

    this.toSync.forEach((node) => {
      if (!node.isConnected) return;

      const rBushNode = node.rBushNode;

      // clear dirty node
      if (rBushNode?.aabb) {
        this.rBush.remove(rBushNode.aabb);
      }

      const renderBounds = node.getRenderBounds();
      if (renderBounds) {
        const renderable = node.renderable;

        if (force) {
          if (!renderable.dirtyRenderBounds) {
            renderable.dirtyRenderBounds = new AABB();
          }
          // save last dirty aabb
          renderable.dirtyRenderBounds.update(
            renderBounds.center,
            renderBounds.halfExtents,
          );
        }

        const [minX, minY] = renderBounds.getMin();
        const [maxX, maxY] = renderBounds.getMax();

        if (!rBushNode.aabb) {
          rBushNode.aabb = {} as RBushNodeAABB;
        }
        rBushNode.aabb.displayObject = node;
        rBushNode.aabb.minX = minX;
        rBushNode.aabb.minY = minY;
        rBushNode.aabb.maxX = maxX;
        rBushNode.aabb.maxY = maxY;
      }

      if (rBushNode.aabb) {
        // TODO: NaN occurs when width/height of Rect is 0
        if (
          !isNaN(rBushNode.aabb.maxX) &&
          !isNaN(rBushNode.aabb.maxX) &&
          !isNaN(rBushNode.aabb.minX) &&
          !isNaN(rBushNode.aabb.minY)
        ) {
          bulk.push(rBushNode.aabb);
        }
      }
    });

    // use bulk inserting, which is ~2-3 times faster
    // @see https://github.com/mourner/rbush#bulk-inserting-data
    this.rBush.load(bulk);

    bulk.length = 0;
    this.toSync.clear();
    this.syncing = false;
  }
}
