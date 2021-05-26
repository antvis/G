import {
  AABB,
  SHAPE,
  DisplayObject,
  CanvasConfig,
  ContextService,
  Renderable,
  RenderingService,
  RenderingContext,
  RenderingPlugin,
  getEuler,
  fromRotationTranslationScale,
  ShapeAttrs,
} from '@antv/g';
import { isArray } from '@antv/util';
import { inject, injectable } from 'inversify';
import { vec3 } from 'gl-matrix';
import { PathGeneratorFactory, PathGenerator } from './shapes/paths';
import { StyleRenderer, StyleRendererFactory } from './shapes/styles';
import { StyleParser } from './shapes/StyleParser';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const SHAPE_ATTRS_MAP: Record<string, string> = {
  fill: 'fillStyle',
  stroke: 'strokeStyle',
  opacity: 'globalAlpha',
};

@injectable()
export class CanvasRendererPlugin implements RenderingPlugin {
  static tag = 'CanvasRendererPlugin';

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  @inject(ContextService)
  private contextService: ContextService<CanvasRenderingContext2D>;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  @inject(StyleParser)
  private styleParser: StyleParser;

  @inject(PathGeneratorFactory)
  private pathGeneratorFactory: (tagName: SHAPE) => PathGenerator;

  @inject(StyleRendererFactory)
  private styleRendererFactory: (tagName: SHAPE) => StyleRenderer;

  /**
   * save the last dirty rect in DEBUG mode
   */
  private lastDirtyRectangle: Rect;

  apply(renderingService: RenderingService) {
    renderingService.hooks.beforeRender.tap(CanvasRendererPlugin.tag, () => {
      const context = this.contextService.getContext();

      const {
        enableDirtyRectangleRendering,
        enableDirtyRectangleRenderingDebug,
      } = this.canvasConfig?.renderer.getConfig();
      const dirtyAABB = this.renderingContext.dirtyRectangle;

      if (context) {
        if (!enableDirtyRectangleRendering) {
          context.clearRect(0, 0, this.canvasConfig.width, this.canvasConfig.height);
          context.save();
        } else {
          const dirtyRectangle = this.convertAABB2Rect(dirtyAABB);

          context.clearRect(dirtyRectangle.x, dirtyRectangle.y, dirtyRectangle.width, dirtyRectangle.height);
          if (enableDirtyRectangleRenderingDebug) {
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
          if (enableDirtyRectangleRenderingDebug) {
            this.drawDirtyRectangle(context, dirtyRectangle);
            this.lastDirtyRectangle = dirtyRectangle;
          }
        }
      }
    });

    renderingService.hooks.afterRender.tap(CanvasRendererPlugin.tag, () => {
      const context = this.contextService.getContext()!;
      context.restore();
    });

    renderingService.hooks.render.tap(CanvasRendererPlugin.tag, (objects: DisplayObject[]) => {
      const context = this.contextService.getContext()!;
      objects.forEach((object) => {
        const nodeType = object.nodeType;

        // reset transformation
        context.save();

        const originMatrix = context.getTransform();

        // apply RTS transformation in world space
        this.applyTransform(context, object);

        // apply attributes to context
        this.applyAttributesToContext(context, object.attributes);

        // generate path in local space
        const generatePath = this.pathGeneratorFactory(nodeType);
        if (generatePath) {
          generatePath(context, object.attributes);
        }

        // fill & stroke
        const styleRenderer = this.styleRendererFactory(nodeType);
        if (styleRenderer) {
          styleRenderer.render(context, object.attributes);
        }

        context.setTransform(originMatrix);

        // finish rendering, clear dirty flag
        const renderable = object.getEntity().getComponent(Renderable);
        renderable.dirty = false;

        context.restore();
      });
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

  private applyTransform(context: CanvasRenderingContext2D, object: DisplayObject) {
    // const { width, height } = this.canvasConfig;
    const [ex, ey, ez] = getEuler(vec3.create(), object.getRotation());

    const [x, y] = object.getPosition();
    const [scaleX, scaleY] = object.getScale();

    // TODO: use MVP matrix
    // const viewMatrix = this.camera.getViewTransform()!;
    // const viewProjectionMatrix = mat4.multiply(
    //   mat4.create(),
    //   this.camera.getPerspective(),
    //   viewMatrix,
    // );

    // const modelMatrix = this.sceneGraphService.getWorldTransform(entity, entity.getComponent(Transform));
    // const mvpMatrix = mat4.multiply(
    //   mat4.create(),
    //   viewProjectionMatrix,
    //   modelMatrix,
    // );

    // const [tx, ty] = mat4.getTranslation(vec3.create(), mvpMatrix);
    // const [sx, sy] = mat4.getScaling(vec3.create(), mvpMatrix);
    // const rotation = mat4.getRotation(quat.create(), mvpMatrix);
    // const [eux, euy, euz] = getEuler(vec3.create(), rotation);

    // gimbal lock at 90 degrees
    const rts = fromRotationTranslationScale(ex || ez, x, y, scaleX, scaleY);

    // @see https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Transformations
    context.transform(rts[0], rts[1], rts[3], rts[4], rts[6], rts[7]);
  }

  private applyAttributesToContext(context: CanvasRenderingContext2D, attrs: ShapeAttrs) {
    for (const k in attrs) {
      let v = attrs[k];
      // 转换一下不与 canvas 兼容的属性名
      const name = SHAPE_ATTRS_MAP[k] ? SHAPE_ATTRS_MAP[k] : k;
      if (name === 'lineDash' && context.setLineDash) {
        isArray(v) && context.setLineDash(v);
      } else {
        if (name === 'strokeStyle' || name === 'fillStyle') {
          // 如果存在渐变、pattern 这个开销有些大
          // 可以考虑缓存机制，通过 hasUpdate 来避免一些运算
          v = this.styleParser.parse(v);
        } else if (name === 'globalAlpha') {
          // opacity 效果可以叠加，子元素的 opacity 需要与父元素 opacity 相乘
          v = v * context.globalAlpha;
        }
        // @ts-ignore
        context[name] = v;
      }
    }
  }
}
