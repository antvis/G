import type RBush from 'rbush';
import { runtime } from '../global-runtime';
import type { RBushNodeAABB } from '../components';
import { DisplayObject } from '../display-objects';
import type { FederatedEvent } from '../dom';
import { ElementEvent } from '../dom';
import type { RenderingPlugin, RenderingPluginContext } from '../services';
import { raf } from '../utils';
import { AABB } from '../shapes';

export class PrepareRendererPlugin implements RenderingPlugin {
  static tag = 'Prepare';
  private rBush: RBush<RBushNodeAABB>;

  private syncTasks = new Map<DisplayObject, boolean>();

  private isFirstTimeRendering = true;
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
      this.syncTasks.set(e.target as DisplayObject, e.detail.affectChildren);

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
    };

    const handleUnmounted = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;
      const { rBushNode } = object;
      if (rBushNode.aabb) {
        this.rBush.remove(rBushNode.aabb);
      }

      this.syncTasks.delete(object);

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
      this.syncTasks.clear();
    });

    // 首次渲染，使用 requestIdleCallback 或 raf 来避免 syncRtree 任务 阻塞渲染。
    let ric: (cb: () => void) => void;
    if (runtime.globalThis.requestIdleCallback) {
      ric = (cb) => {
        runtime.globalThis.requestIdleCallback(cb, { timeout: 300 });
      };
    } else {
      ric = raf.bind(runtime.globalThis);
    }

    renderingService.hooks.endFrame.tap(PrepareRendererPlugin.tag, () => {
      if (this.isFirstTimeRendering) {
        this.isFirstTimeRendering = false;
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

  private syncNode(node: DisplayObject, force = false) {
    if (!node.isConnected) return;

    const rBushNode = node.rBushNode;

    // clear dirty node
    if (rBushNode.aabb) this.rBush.remove(rBushNode.aabb);

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
        return rBushNode.aabb;
      }
    }
  }

  private syncRTree(force = false) {
    if (!force && (this.syncing || this.syncTasks.size === 0)) {
      return;
    }

    this.syncing = true;

    // bounds changed, need re-inserting its children
    const bulk: RBushNodeAABB[] = [];
    const synced = new Set<DisplayObject>();

    const sync = (node: DisplayObject) => {
      if (!synced.has(node) && node.renderable) {
        const aabb = this.syncNode(node, force);
        if (aabb) {
          bulk.push(aabb);
          synced.add(node);
        }
      }
    };

    this.syncTasks.forEach((affectChildren, node) => {
      if (affectChildren) {
        node.forEach(sync);
      }

      let parent = node;
      while (parent) {
        sync(parent);
        parent = parent.parentElement as DisplayObject;
      }
    });

    // use bulk inserting, which is ~2-3 times faster
    // @see https://github.com/mourner/rbush#bulk-inserting-data
    this.rBush.load(bulk);

    bulk.length = 0;
    this.syncing = false;
  }
}
