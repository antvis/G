import { inject, singleton } from 'mana-syringe';
import RBush from 'rbush';
import type { RBushNodeAABB } from '../components';
import { RBushRoot } from '../components';
import { StyleValueRegistry } from '../css';
import type { DisplayObject } from '../display-objects';
import type { Element, FederatedEvent } from '../dom';
import { ElementEvent } from '../dom';
import type { RenderingPlugin, RenderingService } from '../services';
import { RenderingContext, RenderingPluginContribution, SceneGraphService } from '../services';

@singleton({ contrib: RenderingPluginContribution })
export class PrepareRendererPlugin implements RenderingPlugin {
  static tag = 'Prepare';

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  @inject(StyleValueRegistry)
  private styleValueRegistry: StyleValueRegistry;

  @inject(SceneGraphService)
  private sceneGraphService: SceneGraphService;

  /**
   * RBush used in dirty rectangle rendering
   */
  @inject(RBushRoot)
  private rBush: RBush<RBushNodeAABB>;

  /**
   * sync to RBush later
   */
  private toSync = new Set<DisplayObject>();
  private pushToSync(list: DisplayObject[]) {
    list.forEach((i) => {
      this.toSync.add(i);
    });
  }

  apply(renderingService: RenderingService) {
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
          this.pushToSync([node]);
        });
      }

      this.pushToSync(e.composedPath().slice(0, -2) as DisplayObject[]);

      renderingService.dirtify();
    };

    const handleMounted = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;

      this.pushToSync(e.composedPath().slice(0, -2) as DisplayObject[]);

      // recalc style values
      this.styleValueRegistry.recalc(object);

      this.sceneGraphService.dirtifyToRoot(object);
      renderingService.dirtify();
    };

    const handleUnmounted = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;
      const rBushNode = object.rBushNode;
      if (rBushNode.aabb) {
        this.rBush.remove(rBushNode.aabb);

        this.toSync.delete(object);
      }

      this.sceneGraphService.dirtifyToRoot(e.target as Element);
      renderingService.dirtify();
    };

    renderingService.hooks.init.tapPromise(PrepareRendererPlugin.tag, async () => {
      this.renderingContext.root.addEventListener(ElementEvent.MOUNTED, handleMounted);
      this.renderingContext.root.addEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      this.renderingContext.root.addEventListener(
        ElementEvent.ATTR_MODIFIED,
        handleAttributeChanged,
      );
      this.renderingContext.root.addEventListener(ElementEvent.BOUNDS_CHANGED, handleBoundsChanged);
    });

    renderingService.hooks.destroy.tap(PrepareRendererPlugin.tag, () => {
      this.renderingContext.root.removeEventListener(ElementEvent.MOUNTED, handleMounted);
      this.renderingContext.root.removeEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      this.renderingContext.root.removeEventListener(
        ElementEvent.ATTR_MODIFIED,
        handleAttributeChanged,
      );
      this.renderingContext.root.removeEventListener(
        ElementEvent.BOUNDS_CHANGED,
        handleBoundsChanged,
      );
    });

    renderingService.hooks.endFrame.tap(PrepareRendererPlugin.tag, () => {
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
        if (rBushNode) {
          this.rBush.remove(rBushNode.aabb);
        }

        const renderBounds = node.getRenderBounds();
        if (renderBounds) {
          const [minX, minY] = renderBounds.getMin();
          const [maxX, maxY] = renderBounds.getMax();
          rBushNode.aabb = {
            id: node.entity,
            minX,
            minY,
            maxX,
            maxY,
          };
        }

        if (rBushNode.aabb) {
          bulk.push(rBushNode.aabb);
        }
      });

    // use bulk inserting, which is ~2-3 times faster
    // @see https://github.com/mourner/rbush#bulk-inserting-data
    this.rBush.load(bulk);

    bulk.length = 0;
    this.toSync.clear();
  }
}
