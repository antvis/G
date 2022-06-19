import type {
  CSSRGB,
  DisplayObject,
  FederatedEvent,
  ParsedBaseStyleProps,
  RBushNodeAABB,
  RenderingPlugin,
  RenderingService,
} from '@antv/g';
import {
  AABB,
  Camera,
  CanvasConfig,
  ContextService,
  DefaultCamera,
  DisplayObjectPool,
  ElementEvent,
  fromRotationTranslationScale,
  getEuler,
  inject,
  isNil,
  RBush,
  RBushRoot,
  RenderingContext,
  RenderingPluginContribution,
  RenderReason,
  Shape,
  singleton,
} from '@antv/g';
import type { PathGenerator } from '@antv/g-plugin-canvas-path-generator';
import { PathGeneratorFactory } from '@antv/g-plugin-canvas-path-generator';
import { mat4, quat, vec3 } from 'gl-matrix';
import type { StyleRenderer } from './shapes/styles';
import { StyleRendererFactory } from './shapes/styles';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * support 2 modes in rendering:
 * * immediate
 * * delayed: render at the end of frame with dirty-rectangle
 */
@singleton({ contrib: RenderingPluginContribution })
export class CanvasRendererPlugin implements RenderingPlugin {
  static tag = 'CanvasRenderer';

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  @inject(DefaultCamera)
  private camera: Camera;

  @inject(ContextService)
  private contextService: ContextService<CanvasRenderingContext2D>;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  @inject(PathGeneratorFactory)
  private pathGeneratorFactory: (tagName: Shape | string) => PathGenerator<any>;
  private pathGeneratorFactoryCache: Record<Shape | string, PathGenerator<any>> = {};

  @inject(StyleRendererFactory)
  private styleRendererFactory: (tagName: Shape | string) => StyleRenderer;
  private styleRendererFactoryCache: Record<Shape | string, StyleRenderer> = {};

  @inject(DisplayObjectPool)
  private displayObjectPool: DisplayObjectPool;

  /**
   * RBush used in dirty rectangle rendering
   */
  @inject(RBushRoot)
  private rBush: RBush<RBushNodeAABB>;

  private removedRBushNodeAABBs: RBushNodeAABB[] = [];

  private renderQueue: DisplayObject[] = [];

  private restoreStack: DisplayObject[] = [];

  private clearFullScreen = false;

  private tmpVec3 = vec3.create();
  private tmpMat4 = mat4.create();

  apply(renderingService: RenderingService) {
    const handleUnmounted = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;

      // remove r-bush node
      // @ts-ignore
      const rBushNode = object.rBushNode;

      if (rBushNode.aabb) {
        // save removed aabbs for dirty-rectangle rendering later
        this.removedRBushNodeAABBs.push(rBushNode.aabb);
      }
    };

    const handleCulled = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;
      // @ts-ignore
      const rBushNode = object.rBushNode;

      if (rBushNode.aabb) {
        // save removed aabbs for dirty-rectangle rendering later
        this.removedRBushNodeAABBs.push(rBushNode.aabb);
      }
    };

    renderingService.hooks.init.tapPromise(CanvasRendererPlugin.tag, async () => {
      this.renderingContext.root.addEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      this.renderingContext.root.addEventListener(ElementEvent.CULLED, handleCulled);

      // clear fullscreen
      const { width, height } = this.canvasConfig;
      const context = this.contextService.getContext();
      this.clearRect(context, 0, 0, width, height);
    });

    renderingService.hooks.destroy.tap(CanvasRendererPlugin.tag, () => {
      this.renderingContext.root.removeEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      this.renderingContext.root.removeEventListener(ElementEvent.CULLED, handleCulled);
    });

    renderingService.hooks.beginFrame.tap(CanvasRendererPlugin.tag, () => {
      const context = this.contextService.getContext();
      const { width, height } = this.canvasConfig;

      // clear fullscreen when:
      // 1. dirty rectangle rendering disabled
      // 2. camera changed
      this.clearFullScreen = this.shouldClearFullScreen();

      if (context) {
        context.save();

        if (this.clearFullScreen) {
          this.clearRect(context, 0, 0, width, height);
        }

        // account for camera's world matrix
        this.applyTransform(context, this.camera.getOrthoMatrix());
      }
    });

    // render at the end of frame
    renderingService.hooks.endFrame.tap(CanvasRendererPlugin.tag, () => {
      const context = this.contextService.getContext();
      if (this.clearFullScreen) {
      } else {
        // merge removed AABB
        const dirtyRenderBounds = this.safeMergeAABB(
          this.mergeDirtyAABBs(
            // should not ignore group since clipPath may affect its children
            // this.renderQueue.filter((o) => o.nodeName !== Shape.GROUP)),
            this.renderQueue,
          ),
          ...this.removedRBushNodeAABBs.map(({ minX, minY, maxX, maxY }) => {
            const aabb = new AABB();
            aabb.setMinMax(vec3.fromValues(minX, minY, 0), vec3.fromValues(maxX, maxY, 0));
            return aabb;
          }),
        );
        this.removedRBushNodeAABBs = [];

        if (AABB.isEmpty(dirtyRenderBounds)) {
          this.renderQueue = [];
          return;
        }

        // clear & clip dirty rectangle
        const { x, y, width, height } = this.convertAABB2Rect(dirtyRenderBounds);
        this.clearRect(context, x, y, width, height);
        context.beginPath();
        context.rect(x, y, width, height);
        context.clip();

        // draw dirty rectangle
        // if (enableDirtyRectangleRenderingDebug) {
        //   context.lineWidth = 4;
        //   context.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${
        //     Math.random() * 255
        //   }, 1)`;
        //   context.strokeRect(x, y, width, height);
        // }

        // search objects intersect with dirty rectangle
        const dirtyObjects = this.searchDirtyObjects(dirtyRenderBounds);

        // do rendering
        dirtyObjects
          // sort by z-index
          .sort((a, b) => a.sortable.renderOrder - b.sortable.renderOrder)
          .forEach((object) => {
            // culled object should not be rendered
            if (object && object.isVisible() && !object.isCulled()) {
              this.renderDisplayObject(object, renderingService);
            }
          });

        // save dirty AABBs in last frame
        this.renderQueue.forEach((object) => {
          this.saveDirtyAABB(object);
        });

        // clear queue
        this.renderQueue = [];
      }

      // pop restore stack, eg. root -> parent -> child
      this.restoreStack.forEach((s) => {
        context.restore();
      });
      // clear restore stack
      this.restoreStack = [];
      this.clearFullScreen = false;

      context.restore();
    });

    renderingService.hooks.render.tap(CanvasRendererPlugin.tag, (object: DisplayObject) => {
      if (this.clearFullScreen) {
        if (object.isVisible() && !object.isCulled()) {
          // render immediately
          this.renderDisplayObject(object, renderingService);
        }
      } else {
        // render at the end of frame
        this.renderQueue.push(object);
      }
    });
  }

  private clearRect(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
  ) {
    context.clearRect(x, y, width, height);
    const { background } = this.canvasConfig;
    if (background) {
      context.fillStyle = background;
      context.fillRect(x, y, width, height);
    }
  }

  private renderDisplayObject(object: DisplayObject, renderingService: RenderingService) {
    const context = this.contextService.getContext()!;

    // restore to its parent
    let parent = this.restoreStack[this.restoreStack.length - 1];
    while (parent && object.parentNode !== parent) {
      context.restore();
      this.restoreStack.pop();
      parent = this.restoreStack[this.restoreStack.length - 1];
    }

    const nodeName = object.nodeName;

    if (this.styleRendererFactoryCache[nodeName] === undefined) {
      this.styleRendererFactoryCache[nodeName] = this.styleRendererFactory(nodeName);
    }
    const styleRenderer = this.styleRendererFactoryCache[nodeName];

    // reset transformation
    context.save();

    // apply RTS transformation in world space
    this.applyTransform(context, object.getLocalTransform());

    // clip path
    const clipPathShape = object.style.clipPath;
    if (clipPathShape) {
      context.save();

      // const parentTransform =
      //   (object.parentElement as DisplayObject)?.getWorldTransform() || mat4.identity(this.tmpMat4);
      // mat4.multiply(this.tmpMat4, parentTransform, clipPathShape.getLocalTransform());

      // apply clip shape's RTS
      this.applyTransform(context, clipPathShape.getLocalTransform());

      // generate path in local space
      if (this.pathGeneratorFactoryCache[clipPathShape.nodeName] === undefined) {
        this.pathGeneratorFactoryCache[clipPathShape.nodeName] = this.pathGeneratorFactory(
          clipPathShape.nodeName,
        );
      }
      const generatePath = this.pathGeneratorFactoryCache[clipPathShape.nodeName];
      if (generatePath) {
        this.useAnchor(context, clipPathShape);
        context.beginPath();
        generatePath(context, clipPathShape.parsedStyle);
        context.closePath();
      }

      context.restore();
      context.clip();
    }

    // fill & stroke

    context.save();
    // apply attributes to context
    this.applyAttributesToContext(context, object);

    // apply anchor in local space
    this.useAnchor(context, object);
    // generate path in local space

    if (this.pathGeneratorFactoryCache[object.nodeName] === undefined) {
      this.pathGeneratorFactoryCache[object.nodeName] = this.pathGeneratorFactory(object.nodeName);
    }
    const generatePath = this.pathGeneratorFactoryCache[object.nodeName];
    if (generatePath) {
      context.beginPath();
      generatePath(context, object.parsedStyle);
      if (
        object.nodeName !== Shape.LINE &&
        object.nodeName !== Shape.PATH &&
        object.nodeName !== Shape.POLYLINE
      ) {
        context.closePath();
      }
    }

    // fill & stroke
    if (styleRenderer) {
      styleRenderer.render(context, object.parsedStyle, object, renderingService);
    }

    // restore applied attributes, eg. shadowBlur shadowColor...
    context.restore();

    // finish rendering, clear dirty flag
    object.renderable.dirty = false;

    this.restoreStack.push(object);
  }

  private shouldClearFullScreen() {
    const { renderer } = this.canvasConfig;
    const { enableDirtyRectangleRendering } = renderer.getConfig();
    return (
      !enableDirtyRectangleRendering ||
      this.renderingContext.renderReasons.has(RenderReason.CAMERA_CHANGED)
    );
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
  private mergeDirtyAABBs(dirtyObjects: DisplayObject[]): AABB {
    // merge into a big AABB
    const aabb = new AABB();
    dirtyObjects.forEach((object) => {
      const renderBounds = object.getRenderBounds();
      aabb.add(renderBounds);

      const { dirtyRenderBounds } = object.renderable;
      if (dirtyRenderBounds) {
        aabb.add(dirtyRenderBounds);
      }
    });

    return aabb;
  }

  private searchDirtyObjects(dirtyRectangle: AABB): DisplayObject[] {
    // search in r-tree, get all affected nodes
    const [minX, minY] = dirtyRectangle.getMin();
    const [maxX, maxY] = dirtyRectangle.getMax();
    const rBushNodes = this.rBush.search({
      minX,
      minY,
      maxX,
      maxY,
    });

    return rBushNodes.map(({ id }) => this.displayObjectPool.getByEntity(id));
  }

  private saveDirtyAABB(object: DisplayObject) {
    const renderable = object.renderable;
    if (!renderable.dirtyRenderBounds) {
      renderable.dirtyRenderBounds = new AABB();
    }
    const renderBounds = object.getRenderBounds();
    if (renderBounds) {
      // save last dirty aabb
      renderable.dirtyRenderBounds.update(renderBounds.center, renderBounds.halfExtents);
    }
  }

  private applyTransform(context: CanvasRenderingContext2D, transform: mat4) {
    const [tx, ty] = mat4.getTranslation(vec3.create(), transform);
    const [sx, sy] = mat4.getScaling(vec3.create(), transform);
    const rotation = mat4.getRotation(quat.create(), transform);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [eux, euy, euz] = getEuler(vec3.create(), rotation);
    // gimbal lock at 90 degrees
    const rts = fromRotationTranslationScale(eux || euz, tx, ty, sx, sy);

    // @see https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Transformations
    context.transform(rts[0], rts[1], rts[3], rts[4], rts[6], rts[7]);
  }

  private applyAttributesToContext(context: CanvasRenderingContext2D, object: DisplayObject) {
    const {
      stroke,
      fill,
      opacity,
      lineDash,
      lineDashOffset,
      filter,
      shadowColor,
      shadowBlur,
      shadowOffsetX,
      shadowOffsetY,
    } = object.parsedStyle as ParsedBaseStyleProps;
    // @see https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/setLineDash
    if (lineDash && Array.isArray(lineDash)) {
      context.setLineDash(lineDash.map((segment) => segment.value));
    }

    // @see https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/lineDashOffset
    if (!isNil(lineDashOffset)) {
      context.lineDashOffset = lineDashOffset.value;
    }

    if (!isNil(opacity)) {
      context.globalAlpha *= opacity.value;
    }

    if (!isNil(stroke) && !Array.isArray(stroke) && !(stroke as CSSRGB).isNone) {
      context.strokeStyle = object.attributes.stroke;
    }

    if (!isNil(fill) && !Array.isArray(fill) && !(fill as CSSRGB).isNone) {
      context.fillStyle = object.attributes.fill;
    }

    if (!isNil(filter)) {
      // use raw filter string
      context.filter = object.style.filter;
    }

    if (!isNil(shadowColor)) {
      context.shadowColor = shadowColor.toString();
      context.shadowBlur = (shadowBlur && shadowBlur.value) || 0;
      context.shadowOffsetX = (shadowOffsetX && shadowOffsetX.value) || 0;
      context.shadowOffsetY = (shadowOffsetY && shadowOffsetY.value) || 0;
    }
  }

  private useAnchor(context: CanvasRenderingContext2D, object: DisplayObject): void {
    const { anchor } = (object.parsedStyle || {}) as ParsedBaseStyleProps;

    const bounds = object.getGeometryBounds();
    const width = (bounds && bounds.halfExtents[0] * 2) || 0;
    const height = (bounds && bounds.halfExtents[1] * 2) || 0;
    let defX = 0;
    let defY = 0;
    if (
      object.nodeName === Shape.LINE ||
      object.nodeName === Shape.POLYLINE ||
      object.nodeName === Shape.POLYGON ||
      object.nodeName === Shape.PATH
    ) {
      defX = object.parsedStyle.defX;
      defY = object.parsedStyle.defY;
    }

    const tx = -(((anchor && anchor[0].value) || 0) * width + defX);
    const ty = -(((anchor && anchor[1].value) || 0) * height + defY);

    if (tx !== 0 || ty !== 0) {
      // apply anchor, use true size, not include stroke,
      // eg. bounds = true size + half lineWidth
      context.translate(tx, ty);
    }
  }

  private safeMergeAABB(...aabbs: AABB[]): AABB {
    const merged = new AABB();
    aabbs.forEach((aabb) => {
      merged.add(aabb);
    });
    return merged;
  }
}
