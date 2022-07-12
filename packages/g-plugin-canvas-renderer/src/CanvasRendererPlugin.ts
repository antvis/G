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
  CanvasEvent,
  ContextService,
  CustomEvent,
  DefaultCamera,
  DisplayObjectPool,
  ElementEvent,
  inject,
  isNil,
  RBush,
  RBushRoot,
  RenderingContext,
  RenderingPluginContribution,
  Shape,
  singleton,
} from '@antv/g';
import type { PathGenerator } from '@antv/g-plugin-canvas-path-generator';
import { PathGeneratorFactory } from '@antv/g-plugin-canvas-path-generator';
import { mat4, vec3 } from 'gl-matrix';
import type { StyleRenderer } from './shapes/styles';
import { StyleRendererFactory } from './shapes/styles';
import { CanvasRendererPluginOptions } from './tokens';

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

  @inject(CanvasRendererPluginOptions)
  private canvasRendererPluginOptions: CanvasRendererPluginOptions;

  /**
   * RBush used in dirty rectangle rendering
   */
  @inject(RBushRoot)
  private rBush: RBush<RBushNodeAABB>;

  private removedRBushNodeAABBs: RBushNodeAABB[] = [];

  private renderQueue: DisplayObject[] = [];

  private restoreStack: DisplayObject[] = [];

  private clearFullScreen = false;

  /**
   * view projection matrix
   */
  private vpMatrix = mat4.create();
  private dprMatrix = mat4.create();
  private tmpMat4 = mat4.create();
  private tmpVec3 = vec3.create();

  apply(renderingService: RenderingService) {
    const canvas = this.renderingContext.root.ownerDocument.defaultView;

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
      const dpr = this.contextService.getDPR();
      const { width, height } = this.canvasConfig;
      const context = this.contextService.getContext();
      this.clearRect(context, 0, 0, width * dpr, height * dpr);

      mat4.fromScaling(this.dprMatrix, vec3.fromValues(dpr, dpr, 1));
    });

    renderingService.hooks.destroy.tap(CanvasRendererPlugin.tag, () => {
      this.renderingContext.root.removeEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      this.renderingContext.root.removeEventListener(ElementEvent.CULLED, handleCulled);
    });

    renderingService.hooks.beginFrame.tap(CanvasRendererPlugin.tag, () => {
      const context = this.contextService.getContext();
      const dpr = this.contextService.getDPR();
      const { width, height } = this.canvasConfig;
      const { dirtyObjectNumThreshold, dirtyObjectRatioThreshold } =
        this.canvasRendererPluginOptions;

      // some heuristic conditions such as 80% object changed
      const { total, rendered } = renderingService.getStats();
      const ratio = rendered / total;

      this.clearFullScreen =
        renderingService.disableDirtyRectangleRendering() ||
        (rendered > dirtyObjectNumThreshold && ratio > dirtyObjectRatioThreshold);

      if (context) {
        context.resetTransform();
        if (this.clearFullScreen) {
          this.clearRect(context, 0, 0, width * dpr, height * dpr);
        }
      }
    });

    // render at the end of frame
    renderingService.hooks.endFrame.tap(CanvasRendererPlugin.tag, () => {
      const context = this.contextService.getContext();
      // clear & clip dirty rectangle
      mat4.multiply(this.vpMatrix, this.dprMatrix, this.camera.getOrthoMatrix());

      if (this.clearFullScreen) {
        this.renderingContext.root.forEach((object: DisplayObject) => {
          if (object.isVisible() && !object.isCulled()) {
            this.renderDisplayObject(object, renderingService);
            // if we did a full screen rendering last frame
            this.saveDirtyAABB(object);
          }
        });
      } else {
        // merge removed AABB
        const dirtyRenderBounds = this.safeMergeAABB(
          this.mergeDirtyAABBs(this.renderQueue),
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

        const dirtyRect = this.convertAABB2Rect(dirtyRenderBounds);
        const { x, y, width, height } = dirtyRect;

        const tl = vec3.transformMat4(this.tmpVec3, vec3.fromValues(x, y, 0), this.vpMatrix);
        const br = vec3.transformMat4(
          vec3.create(),
          vec3.fromValues(x + width, y + height, 0),
          this.vpMatrix,
        );

        const ix = Math.floor(tl[0]);
        const iy = Math.floor(tl[1]);
        const iwidth = Math.ceil(br[0] - tl[0]);
        const iheight = Math.ceil(br[1] - tl[1]);

        context.save();
        this.clearRect(context, ix, iy, iwidth, iheight);
        context.beginPath();
        context.rect(ix, iy, iwidth, iheight);
        context.clip();

        // @see https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Transformations
        context.setTransform(
          this.vpMatrix[0],
          this.vpMatrix[1],
          this.vpMatrix[4],
          this.vpMatrix[5],
          this.vpMatrix[12],
          this.vpMatrix[13],
        );

        // draw dirty rectangle
        const { enableDirtyRectangleRenderingDebug } = this.canvasConfig.renderer.getConfig();
        if (enableDirtyRectangleRenderingDebug) {
          canvas.dispatchEvent(
            new CustomEvent(CanvasEvent.DIRTY_RECTANGLE, {
              dirtyRect,
            }),
          );
        }

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

        context.restore();

        // save dirty AABBs in last frame
        this.renderQueue.forEach((object) => {
          this.saveDirtyAABB(object);
        });

        // clear queue
        this.renderQueue = [];
      }

      // pop restore stack, eg. root -> parent -> child
      this.restoreStack.forEach(() => {
        context.restore();
      });
      // clear restore stack
      this.restoreStack = [];
    });

    renderingService.hooks.render.tap(CanvasRendererPlugin.tag, (object: DisplayObject) => {
      if (!this.clearFullScreen) {
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
    // clearRect is faster than fillRect @see https://stackoverflow.com/a/30830253
    context.clearRect(x, y, width, height);
    const { background } = this.canvasConfig;
    if (background) {
      context.fillStyle = background;
      context.fillRect(x, y, width, height);
    }
  }

  private renderDisplayObject(object: DisplayObject, renderingService: RenderingService) {
    const context = this.contextService.getContext();

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
    if (this.pathGeneratorFactoryCache[nodeName] === undefined) {
      this.pathGeneratorFactoryCache[nodeName] = this.pathGeneratorFactory(nodeName);
    }
    const generatePath = this.pathGeneratorFactoryCache[nodeName];

    // clip path
    const clipPathShape = object.parsedStyle.clipPath;
    if (clipPathShape) {
      this.applyWorldTransform(context, clipPathShape, object.getWorldTransform());

      // generate path in local space
      if (this.pathGeneratorFactoryCache[clipPathShape.nodeName] === undefined) {
        this.pathGeneratorFactoryCache[clipPathShape.nodeName] = this.pathGeneratorFactory(
          clipPathShape.nodeName,
        );
      }
      const generatePath = this.pathGeneratorFactoryCache[clipPathShape.nodeName];
      if (generatePath) {
        context.save();

        // save clip
        this.restoreStack.push(object);

        context.beginPath();
        generatePath(context, clipPathShape.parsedStyle);
        context.closePath();
        context.clip();
      }
    }

    // fill & stroke

    if (styleRenderer) {
      this.applyWorldTransform(context, object);

      context.save();

      // apply attributes to context
      this.applyAttributesToContext(context, object);
    }

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

      // restore applied attributes, eg. shadowBlur shadowColor...
      context.restore();
    }

    // finish rendering, clear dirty flag
    object.renderable.dirty = false;
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
    // TODO: skip descendant if ancestor is caculated, but compareNodePosition is really slow
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

  /**
   * TODO: batch the same global attributes
   */
  private applyAttributesToContext(context: CanvasRenderingContext2D, object: DisplayObject) {
    const { stroke, fill, opacity, lineDash, lineDashOffset } =
      object.parsedStyle as ParsedBaseStyleProps;
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
  }

  private applyWorldTransform(
    context: CanvasRenderingContext2D,
    object: DisplayObject,
    matrix?: mat4,
  ) {
    let tx = 0;
    let ty = 0;
    const { anchor } = (object.parsedStyle || {}) as ParsedBaseStyleProps;
    const anchorX = (anchor && anchor[0].value) || 0;
    const anchorY = (anchor && anchor[1].value) || 0;
    if (anchorX !== 0 || anchorY !== 0) {
      const bounds = object.getGeometryBounds();
      const width = (bounds && bounds.halfExtents[0] * 2) || 0;
      const height = (bounds && bounds.halfExtents[1] * 2) || 0;
      tx = -(anchorX * width);
      ty = -(anchorY * height);
    }

    // apply clip shape's RTS
    if (matrix) {
      mat4.copy(this.tmpMat4, object.getLocalTransform());
      this.tmpVec3[0] = tx;
      this.tmpVec3[1] = ty;
      this.tmpVec3[2] = 0;
      mat4.translate(this.tmpMat4, this.tmpMat4, this.tmpVec3);
      mat4.multiply(this.tmpMat4, matrix, this.tmpMat4);
      mat4.multiply(this.tmpMat4, this.vpMatrix, this.tmpMat4);
    } else {
      // apply RTS transformation in world space
      mat4.copy(this.tmpMat4, object.getWorldTransform());
      this.tmpVec3[0] = tx;
      this.tmpVec3[1] = ty;
      this.tmpVec3[2] = 0;
      mat4.translate(this.tmpMat4, this.tmpMat4, this.tmpVec3);
      mat4.multiply(this.tmpMat4, this.vpMatrix, this.tmpMat4);
    }

    // @see https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Transformations
    context.setTransform(
      this.tmpMat4[0],
      this.tmpMat4[1],
      this.tmpMat4[4],
      this.tmpMat4[5],
      this.tmpMat4[12],
      this.tmpMat4[13],
    );
  }

  private safeMergeAABB(...aabbs: AABB[]): AABB {
    const merged = new AABB();
    aabbs.forEach((aabb) => {
      merged.add(aabb);
    });
    return merged;
  }
}
