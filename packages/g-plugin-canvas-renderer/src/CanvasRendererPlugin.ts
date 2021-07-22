import {
  AABB,
  SHAPE,
  DisplayObject,
  DisplayObjectPool,
  CanvasConfig,
  ContextService,
  SceneGraphService,
  SCENE_GRAPH_EVENT,
  Renderable,
  RenderingService,
  RenderingContext,
  RenderingPlugin,
  getEuler,
  fromRotationTranslationScale,
  Camera,
} from '@antv/g';
import { isArray } from '@antv/util';
import { inject, injectable } from 'inversify';
import { vec3, mat4, quat } from 'gl-matrix';
import RBush from 'rbush';
import { PathGeneratorFactory, PathGenerator } from './shapes/paths';
import { StyleRenderer, StyleRendererFactory } from './shapes/styles';
import { StyleParser } from './shapes/StyleParser';
import { RBushNode, RBushNodeAABB } from './components/RBushNode';

export const RBushRoot = Symbol('RBushRoot');

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

/**
 * support 2 modes in rendering:
 * * immediate
 * * delayed: render at the end of frame with dirty-rectangle
 */
@injectable()
export class CanvasRendererPlugin implements RenderingPlugin {
  static tag = 'CanvasRendererPlugin';

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  @inject(Camera)
  private camera: Camera;

  @inject(ContextService)
  private contextService: ContextService<CanvasRenderingContext2D>;

  @inject(SceneGraphService)
  private sceneGraphService: SceneGraphService;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  @inject(StyleParser)
  private styleParser: StyleParser;

  @inject(PathGeneratorFactory)
  private pathGeneratorFactory: (tagName: SHAPE) => PathGenerator<any>;

  @inject(StyleRendererFactory)
  private styleRendererFactory: (tagName: SHAPE) => StyleRenderer;

  @inject(DisplayObjectPool)
  private displayObjectPool: DisplayObjectPool;

  /**
   * RBush used in dirty rectangle rendering
   */
  @inject(RBushRoot)
  private rBush: RBush<RBushNodeAABB>;

  private renderQueue: DisplayObject<any>[] = [];

  /**
   * save the last dirty rect in DEBUG mode
   */
  private lastDirtyRectangle: Rect;

  apply(renderingService: RenderingService) {
    renderingService.hooks.init.tap(CanvasRendererPlugin.tag, () => {
      const context = this.contextService.getContext();
      const dpr = this.contextService.getDPR();
      // scale all drawing operations by the dpr
      // @see https://www.html5rocks.com/en/tutorials/canvas/hidpi/
      context && context.scale(dpr, dpr);

      this.sceneGraphService.on(SCENE_GRAPH_EVENT.AABBChanged, this.handleEntityAABBChanged);
    });

    renderingService.hooks.mounted.tap(CanvasRendererPlugin.tag, (object: DisplayObject<any>) => {
      object.getEntity().addComponent(RBushNode);
      this.sceneGraphService.emit(SCENE_GRAPH_EVENT.AABBChanged, object);
    });

    renderingService.hooks.unmounted.tap(CanvasRendererPlugin.tag, (object: DisplayObject<any>) => {
      const rBushNode = object.getEntity().getComponent(RBushNode);
      this.rBush.remove(rBushNode.aabb);

      object.getEntity().removeComponent(RBushNode);
    });

    renderingService.hooks.destroy.tap(CanvasRendererPlugin.tag, () => {
      this.sceneGraphService.off(SCENE_GRAPH_EVENT.AABBChanged, this.handleEntityAABBChanged);
    });

    renderingService.hooks.beginFrame.tap(CanvasRendererPlugin.tag, () => {
      const context = this.contextService.getContext();

      const {
        enableDirtyRectangleRendering,
        enableDirtyRectangleRenderingDebug,
      } = this.canvasConfig.renderer.getConfig();

      if (context) {
        context.save();

        if (!enableDirtyRectangleRendering) {
          context.clearRect(0, 0, this.canvasConfig.width, this.canvasConfig.height);
        }

        // account for camera's world matrix
        this.applyTransform(context, this.camera.getOrthoMatrix());
      }
    });

    // render at the end of frame
    renderingService.hooks.endFrame.tap(CanvasRendererPlugin.tag, () => {
      const { enableDirtyRectangleRendering } = this.canvasConfig.renderer.getConfig();
      const context = this.contextService.getContext()!;
      if (enableDirtyRectangleRendering) {
        // calc dirty rectangle
        const dirtyAABB = this.mergeDirtyAABBs(this.renderQueue);
        // TODO: removed objects
        if (!dirtyAABB) {
          return;
        }

        // clear & clip dirty rectangle
        const { x, y, width, height } = this.convertAABB2Rect(dirtyAABB);
        context.clearRect(x, y, width, height);
        context.beginPath();
        context.rect(x, y, width, height);
        context.clip();

        // search objects intersect with dirty rectangle
        const dirtyObjects = this.searchDirtyObjects(dirtyAABB);

        // do rendering
        dirtyObjects
          // sort by z-index
          .sort(this.sceneGraphService.sort)
          .forEach((object) => {
            this.renderDisplayObject(object);
          });

        // save dirty AABBs in last frame
        this.renderQueue.forEach((object) => {
          this.saveDirtyAABB(object);
        });

        // clear queue
        this.renderQueue = [];
      }

      context.restore();
    });

    renderingService.hooks.render.tap(CanvasRendererPlugin.tag, (object: DisplayObject<any>) => {
      const { enableDirtyRectangleRendering } = this.canvasConfig.renderer.getConfig();
      if (!enableDirtyRectangleRendering) {
        // render immediately
        this.renderDisplayObject(object);
      } else {
        // render at the end of frame
        this.renderQueue.push(object);
      }
    });
  }

  private renderDisplayObject(object: DisplayObject<any>) {
    const context = this.contextService.getContext()!;

    const nodeType = object.nodeType;

    // reset transformation
    context.save();

    // apply RTS transformation in world space
    this.applyTransform(context, object.getWorldTransform());

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

    // finish rendering, clear dirty flag
    const renderable = object.getEntity().getComponent(Renderable);
    renderable.dirty = false;

    context.restore();
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

  /**
   * TODO: merge dirty rectangles with some strategies.
   * For now, we just simply merge all the rectangles into one.
   * @see https://idom.me/articles/841.html
   */
  private mergeDirtyAABBs(dirtyObjects: DisplayObject<any>[]): AABB | undefined {
    // merge into a big AABB
    let dirtyRectangle: AABB | undefined;
    dirtyObjects.forEach((object) => {
      const aabb = object.getBounds();
      if (aabb) {
        if (!dirtyRectangle) {
          dirtyRectangle = new AABB(aabb.center, aabb.halfExtents);
        } else {
          dirtyRectangle.add(aabb);
        }
      }

      const { dirtyAABB } = object.getEntity().getComponent(Renderable);
      if (dirtyAABB) {
        if (!dirtyRectangle) {
          dirtyRectangle = new AABB(dirtyAABB.center, dirtyAABB.halfExtents);
        } else {
          dirtyRectangle.add(dirtyAABB);
        }
      }
    });

    return dirtyRectangle;
  }

  private searchDirtyObjects(dirtyRectangle: AABB) {
    // search in r-tree, get all affected nodes
    const [minX, minY] = dirtyRectangle.getMin();
    const [maxX, maxY] = dirtyRectangle.getMax();
    const rBushNodes = this.rBush.search({
      minX,
      minY,
      maxX,
      maxY,
    });

    return rBushNodes.map(({ name }) => this.displayObjectPool.getByName(name));
  }

  private saveDirtyAABB(object: DisplayObject<any>) {
    const entity = object.getEntity();
    const renderable = entity.getComponent(Renderable);
    if (!renderable.dirtyAABB) {
      renderable.dirtyAABB = new AABB();
    }
    const bounds = object.getBounds();
    if (bounds) {
      // save last dirty aabb
      renderable.dirtyAABB.update(bounds.center, bounds.halfExtents);
    }
  }

  private drawDirtyRectangle(context: CanvasRenderingContext2D, { x, y, width, height }: Rect) {
    context.beginPath();
    context.rect(x + 1, y + 1, width - 1, height - 1);
    context.closePath();

    context.lineWidth = 1;
    context.stroke();
  }

  private handleEntityAABBChanged = (object: DisplayObject<any>) => {
    const entity = object.getEntity();
    const { enableDirtyRectangleRendering } = this.canvasConfig.renderer.getConfig();

    // don not use rbush when dirty-rectangle rendering disabled
    if (!enableDirtyRectangleRendering) {
      return;
    }

    const renderable = entity.getComponent(Renderable);
    const rBushNode = entity.getComponent(RBushNode);

    if (rBushNode) {

      // insert node in RTree
      if (rBushNode.aabb) {
        this.rBush.remove(rBushNode.aabb);
      }

      if (renderable.aabb) {
        const [minX, minY] = renderable.aabb.getMin();
        const [maxX, maxY] = renderable.aabb.getMax();
        rBushNode.aabb = {
          name: entity.getName(),
          minX,
          minY,
          maxX,
          maxY,
        };
      }

      this.rBush.insert(rBushNode.aabb);
    }
  };

  private applyTransform(context: CanvasRenderingContext2D, transform: mat4) {
    const [tx, ty] = mat4.getTranslation(vec3.create(), transform);
    const [sx, sy] = mat4.getScaling(vec3.create(), transform);
    const rotation = mat4.getRotation(quat.create(), transform);
    const [eux, euy, euz] = getEuler(vec3.create(), rotation);
    // gimbal lock at 90 degrees
    const rts = fromRotationTranslationScale(eux || euz, tx, ty, sx, sy);

    // @see https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Transformations
    context.transform(rts[0], rts[1], rts[3], rts[4], rts[6], rts[7]);
  }

  private applyAttributesToContext(context: CanvasRenderingContext2D, attrs: any) {
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
