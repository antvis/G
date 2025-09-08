import type RBush from 'rbush';
import { runtime } from '../global-runtime';
import type { RBushNodeAABB } from '../components';
import { DisplayObject } from '../display-objects';
import {
  type FederatedEvent,
  type CustomEvent,
  type MutationRecord,
  ElementEvent,
} from '../dom';
import type { RenderingPlugin, RenderingPluginContext } from '../services';
import { raf } from '../utils';
import { AABB } from '../shapes';

export class PrepareRendererPlugin implements RenderingPlugin {
  static tag = 'Prepare';
  private rBush: RBush<RBushNodeAABB>;

  private mutationRecords: MutationRecord[] = [];
  private ricSyncRTreeId: number;
  private isFirstTimeRendering = true;
  private syncing = false;

  isFirstTimeRenderingFinished = false;

  apply(context: RenderingPluginContext) {
    const { config, renderingService, renderingContext, rBushRoot } = context;
    const canvas = renderingContext.root.ownerDocument.defaultView;

    this.rBush = rBushRoot;

    const handleAttributeChanged = (e: FederatedEvent) => {
      renderingService.dirty();
    };

    const handleBoundsChanged = (
      e: CustomEvent<{ detail: MutationRecord[] }>,
    ) => {
      const records = e.detail;
      // ! WARN: push is used instead of direct assignment because syncTasks are processed asynchronously.
      this.mutationRecords.push(...records);

      renderingService.dirty();
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

      if (rBushNode?.aabb) {
        this.rBush.remove(rBushNode.aabb);
      }

      runtime.sceneGraphService.dirtyToRoot(object);
      renderingService.dirty();
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

      this.mutationRecords = [];

      if (
        this.ricSyncRTreeId &&
        runtime.globalThis.requestIdleCallback &&
        runtime.globalThis.cancelIdleCallback
      ) {
        runtime.globalThis.cancelIdleCallback(this.ricSyncRTreeId);
      }
    });

    const ric =
      runtime.globalThis.requestIdleCallback ?? raf.bind(runtime.globalThis);
    const enableRICSyncRTree = config.future?.experimentalRICSyncRTree === true;

    renderingService.hooks.endFrame.tap(PrepareRendererPlugin.tag, () => {
      if (this.isFirstTimeRendering) {
        this.isFirstTimeRendering = false;
        this.syncing = true;
        ric(() => {
          this.syncRTree(true);
          this.isFirstTimeRenderingFinished = true;
        });
      } else if (
        enableRICSyncRTree &&
        runtime.globalThis.requestIdleCallback &&
        runtime.globalThis.cancelIdleCallback
      ) {
        runtime.globalThis.cancelIdleCallback(this.ricSyncRTreeId);
        this.ricSyncRTreeId = runtime.globalThis.requestIdleCallback(() =>
          this.syncRTree(),
        );
      } else {
        this.syncRTree();
      }
    });
  }

  private syncNode(node: DisplayObject, force = false) {
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
    if (!force && (this.syncing || this.mutationRecords.length === 0)) {
      return;
    }

    this.syncing = true;

    // bounds changed, need re-inserting its children
    const bulk: RBushNodeAABB[] = [];
    const synced = new Set<DisplayObject>();

    const sync = (node: DisplayObject) => {
      if (node.isConnected && !synced.has(node) && node.renderable) {
        const aabb = this.syncNode(node, force);
        if (aabb) {
          bulk.push(aabb);
          synced.add(node);
        }
      }
    };

    // TODO: Logical redundancy, repeated traversal
    const recordCount = this.mutationRecords.length;
    for (let i = 0; i < recordCount; i++) {
      const record = this.mutationRecords[i];
      const { _boundsChangeData, target } = record;
      if (!target.isConnected) {
        continue;
      }

      if (_boundsChangeData?.affectChildren) {
        target.forEach(sync);
      }

      let parent = target;
      while (parent) {
        sync(parent as DisplayObject);
        parent = parent.parentElement as DisplayObject;
      }
    }
    this.mutationRecords = [];

    // use bulk inserting, which is ~2-3 times faster
    // @see https://github.com/mourner/rbush#bulk-inserting-data
    this.rBush.load(bulk);

    bulk.length = 0;
    this.syncing = false;
  }
}
