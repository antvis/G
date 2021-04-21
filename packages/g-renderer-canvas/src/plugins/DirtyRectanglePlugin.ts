import { Entity } from '@antv/g-ecs';
import { AABB, CanvasConfig, ContextService, RenderingService, RenderingPlugin } from '@antv/g';
import { inject, injectable } from 'inversify';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

@injectable()
export class DirtyRectanglePlugin implements RenderingPlugin {
  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  @inject(ContextService)
  private contextService: ContextService<CanvasRenderingContext2D>;

  /**
   * save the last dirty rect in DEBUG mode
   */
  private lastDirtyRectangle: Rect;

  apply(renderingService: RenderingService) {
    renderingService.hooks.beginFrame.tapPromise('DirtyRectanglePlugin', async (entities: Entity[]) => {
      const context = this.contextService.getContext();
      const dirtyAABB = renderingService.context.dirtyRectangle;

      if (context) {
        if (!dirtyAABB) {
          context.clearRect(0, 0, this.canvasConfig.width, this.canvasConfig.height);
          context.save();
        } else {
          const dirtyRectangle = this.convertAABB2Rect(dirtyAABB);

          context.clearRect(dirtyRectangle.x, dirtyRectangle.y, dirtyRectangle.width, dirtyRectangle.height);
          if (this.canvasConfig.dirtyRectangle?.debug) {
            if (this.lastDirtyRectangle) {
              context.clearRect(
                this.lastDirtyRectangle.x,
                this.lastDirtyRectangle.y,
                this.lastDirtyRectangle.width,
                this.lastDirtyRectangle.height
              );
            }
          }

          // clip dirty rectangle
          context.save();
          context.beginPath();
          context.rect(dirtyRectangle.x, dirtyRectangle.y, dirtyRectangle.width, dirtyRectangle.height);
          context.clip();

          // draw dirty rectangle on DEBUG mode
          if (this.canvasConfig.dirtyRectangle?.debug) {
            this.drawDirtyRectangle(context, dirtyRectangle);
            this.lastDirtyRectangle = dirtyRectangle;
          }
        }
      }
    });

    renderingService.hooks.endFrame.tapPromise('DirtyRectanglePlugin', async () => {
      const context = this.contextService.getContext();
      context?.restore();
    });
  }

  private convertAABB2Rect(aabb: AABB): Rect {
    const min = aabb.getMin();
    const max = aabb.getMax();
    // expand the rectangle a bit to avoid artifacts
    // @see https://www.yuque.com/antv/ou292n/bi8nix#ExvCu
    const minX = Math.floor(min[0]);
    const minY = Math.floor(min[1]);
    const maxX = Math.ceil(max[0]);
    const maxY = Math.ceil(max[1]);
    const width = maxX - minX;
    const height = maxY - minY;

    return { x: minX, y: minY, width, height };
  }

  private drawDirtyRectangle(context: CanvasRenderingContext2D, { x, y, width, height }: Rect) {
    context.beginPath();
    context.rect(x + 1, y + 1, width - 1, height - 1);
    context.closePath();

    context.lineWidth = 1;
    context.stroke();
  }
}
