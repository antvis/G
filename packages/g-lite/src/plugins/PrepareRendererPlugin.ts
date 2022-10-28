import type RBush from 'rbush';
import { runtime } from '../global-runtime';
import type { RBushNodeAABB } from '../components';
import type { DisplayObject } from '../display-objects';
import type { FederatedEvent } from '../dom';
import { ElementEvent } from '../dom';
import type { RenderingPlugin, RenderingPluginContext } from '../services';

export class PrepareRendererPlugin implements RenderingPlugin {
  static tag = 'Prepare';
  private rBush: RBush<RBushNodeAABB>;

  /**
   * sync to RBush later
   */
  private toSync = new Set<DisplayObject>();

  // private isFirstTimeRendering = true;

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

      // recalc style values
      runtime.styleValueRegistry.recalc(object);

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

    renderingService.hooks.init.tapPromise(PrepareRendererPlugin.tag, async () => {
      canvas.addEventListener(ElementEvent.MOUNTED, handleMounted);
      canvas.addEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      canvas.addEventListener(ElementEvent.ATTR_MODIFIED, handleAttributeChanged);
      canvas.addEventListener(ElementEvent.BOUNDS_CHANGED, handleBoundsChanged);
    });

    renderingService.hooks.destroy.tap(PrepareRendererPlugin.tag, () => {
      canvas.removeEventListener(ElementEvent.MOUNTED, handleMounted);
      canvas.removeEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      canvas.removeEventListener(ElementEvent.ATTR_MODIFIED, handleAttributeChanged);
      canvas.removeEventListener(ElementEvent.BOUNDS_CHANGED, handleBoundsChanged);
    });

    renderingService.hooks.endFrame.tap(PrepareRendererPlugin.tag, () => {
      // if (this.isFirstTimeRendering) {
      //   // @see https://github.com/antvis/G/issues/1117
      //   setTimeout(() => this.syncRTree());
      //   this.isFirstTimeRendering = false;
      // } else {
      //   this.syncRTree();
      // }

      this.syncRTree();
    });
  }

  private syncRTree() {
    // bounds changed, need re-inserting its children
    const bulk: RBushNodeAABB[] = [];

    Array.from(this.toSync)
      // some objects may be removed since last frame
      .filter((object) => object.isConnected)
      .forEach((node: DisplayObject) => {
        const rBushNode = node.rBushNode;

        // clear dirty node
        if (rBushNode && rBushNode.aabb) {
          this.rBush.remove(rBushNode.aabb);
        }

        const renderBounds = node.getRenderBounds();
        if (renderBounds) {
          const [minX, minY] = renderBounds.getMin();
          const [maxX, maxY] = renderBounds.getMax();

          if (!rBushNode.aabb) {
            // @ts-ignore
            rBushNode.aabb = {};
          }
          rBushNode.aabb.id = node.entity;
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
  }
}
