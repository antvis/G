import {
  container,
  fromRotationTranslationScale,
  getEuler,
  Renderable,
  DisplayObject,
  DisplayObjectPlugin,
  SceneGraphNode,
  SceneGraphService,
  ShapeAttrs,
  Camera,
  DisplayObjectHooks,
} from '@antv/g';
import { Entity } from '@antv/g-ecs';
import { mat3, mat4, quat, vec2, vec3 } from 'gl-matrix';
import { inject, injectable } from 'inversify';
import { StyleRenderer } from '../shapes/styles';
import { PathGenerator } from '../shapes/paths';
import { isArray } from '@antv/util';
import { StyleParser } from '../shapes/StyleParser';
import { RENDERER } from '..';

const SHAPE_ATTRS_MAP: Record<string, string> = {
  fill: 'fillStyle',
  stroke: 'strokeStyle',
  opacity: 'globalAlpha',
};

@injectable()
export class RenderShapePlugin implements DisplayObjectPlugin {
  @inject(SceneGraphService)
  protected sceneGraphService: SceneGraphService;

  @inject(StyleParser)
  private styleParser: StyleParser;

  @inject(Camera)
  private camera: Camera;

  apply() {
    DisplayObjectHooks.render.tap(
      'Rendering',
      (renderer: string, context: CanvasRenderingContext2D, entity: Entity) => {
        if (renderer !== RENDERER) {
          return;
        }

        context.save();

        const originMatrix = context.getTransform();

        // apply RTS transformation
        this.applyTransform(context, entity);

        // apply attributes to context
        this.applyAttributesToContext(context, entity.getComponent(SceneGraphNode).attributes);

        // generate path
        const tagName = entity.getComponent(SceneGraphNode).tagName;
        if (container.isBoundNamed(PathGenerator, tagName)) {
          const generatePath = container.getNamed<PathGenerator>(PathGenerator, tagName);
          generatePath(context, entity);
        }

        // fill & stroke
        if (container.isBoundNamed(StyleRenderer, tagName)) {
          const styleRenderer = container.getNamed<StyleRenderer>(StyleRenderer, tagName);
          styleRenderer.render(context, entity);
        }

        context.setTransform(originMatrix);

        // finish rendering, clear dirty flag
        const renderable = entity.getComponent(Renderable);
        renderable.dirty = false;

        context.restore();
      }
    );
  }

  private applyTransform(context: CanvasRenderingContext2D, entity: Entity) {
    // const { width, height } = this.canvasConfig;

    const [ex, ey, ez] = getEuler(vec3.create(), this.sceneGraphService.getRotation(entity));

    const [x, y] = this.sceneGraphService.getPosition(entity);
    const [scaleX, scaleY] = this.sceneGraphService.getScale(entity);

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
