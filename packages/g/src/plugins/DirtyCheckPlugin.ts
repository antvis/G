import { inject, injectable } from 'inversify';
import { Renderable, SceneGraphNode } from '../components';
import { CanvasConfig } from '../types';
import { RenderingService, RenderingPlugin } from '../services/RenderingService';
import { RenderingContext, RENDER_REASON } from '../services/RenderingContext';
import { SceneGraphService } from '../services/SceneGraphService';
import { DisplayObject } from '../DisplayObject';
import { DisplayObjectPool } from '../DisplayObjectPool';

/**
 * Filter dirty renderables and calculate the "dirty rectangle" which will be clear when frame began
 */
@injectable()
export class DirtyCheckPlugin implements RenderingPlugin {
  static tag = 'DirtyCheckPlugin';

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  apply(renderer: RenderingService) {
    renderer.hooks.prepare.tap(DirtyCheckPlugin.tag, (object: DisplayObject | null) => {
      if (object) {
        // if (object.getEntity().getComponent(SceneGraphNode).shadow) {
        //   return null;
        // }
        const { enableDirtyRectangleRendering } = this.canvasConfig.renderer.getConfig();

        const renderable = object.getEntity().getComponent(Renderable);
        const isDirty = renderable.dirty
          || this.renderingContext.renderReasons.has(RENDER_REASON.CameraChanged);
        if (
          isDirty ||
          (!enableDirtyRectangleRendering && !renderable.instanced)
        ) {
          return object;
        } else {
          return null;
        }
      }

      return object;
    });

    // renderer.hooks.prepare.tap(DirtyCheckPlugin.tag, (objects: DisplayObject[]) => {
    //   let dirtyObjects = objects.filter(
    //     (object) => object.getEntity().getComponent(Renderable).dirty,
    //   );
    //   const { enableDirtyRectangleRendering } = this.canvasConfig.renderer.getConfig();

    //   // skip rendering if nothing to redraw
    //   if (dirtyObjects.length === 0) {
    //     this.renderingContext.dirtyRectangle = undefined;
    //     return [];
    //   } else {
    //     // 即使最终待渲染对象为 0 也需要强制渲染一次
    //     this.renderingContext.force = true;
    //   }

    //   if (!enableDirtyRectangleRendering) {
    //     this.renderingContext.dirtyRectangle = undefined;
    //     return objects;
    //   }

    //   // TODO: use threshold when too much dirty renderables
    //   const dirtyRectangle = this.mergeDirtyRectangles(dirtyObjects);
    //   this.renderingContext.removedAABBs.forEach((removedAABB) => {
    //     removedAABB && dirtyRectangle && dirtyRectangle.add(removedAABB);
    //   });
    //   this.renderingContext.removedAABBs = [];
    //   // set dirty rectangle manually
    //   this.renderingContext.dirtyRectangle = dirtyRectangle;

    //   if (!dirtyRectangle) {
    //     this.renderingContext.dirtyRectangle = undefined;
    //     return [];
    //   }

    //   // search in r-tree, get all affected nodes
    //   const [minX, minY] = dirtyRectangle.getMin();
    //   const [maxX, maxY] = dirtyRectangle.getMax();
    //   const rBushNodes = this.renderingContext.rBush.search({
    //     minX,
    //     minY,
    //     maxX,
    //     maxY,
    //   });

    //   dirtyObjects = rBushNodes.map(({ name }) => this.displayObjectPool.getByName(name));

    //   return dirtyObjects;
    // });
  }
}
