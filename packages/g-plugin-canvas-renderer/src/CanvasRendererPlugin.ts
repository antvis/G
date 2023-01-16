import type {
  CSSRGB,
  DisplayObject,
  FederatedEvent,
  ParsedBaseStyleProps,
  RBushNodeAABB,
  RenderingPlugin,
  RBush,
  RenderingPluginContext,
  ContextService,
  CanvasContext,
  GlobalRuntime,
} from '@antv/g-lite';
import {
  AABB,
  CanvasEvent,
  CustomEvent,
  ElementEvent,
  Shape,
} from '@antv/g-lite';
import type { PathGenerator } from '@antv/g-plugin-canvas-path-generator';
import { isNil } from '@antv/util';
import { mat4, vec3 } from 'gl-matrix';
import type { CanvasRendererPluginOptions } from './interfaces';

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
export class CanvasRendererPlugin implements RenderingPlugin {
  static tag = 'CanvasRenderer';

  private context: RenderingPluginContext;

  private pathGeneratorFactory: Record<Shape, PathGenerator<any>>;

  /**
   * RBush used in dirty rectangle rendering
   */
  private rBush: RBush<RBushNodeAABB>;

  constructor(
    private canvasRendererPluginOptions: CanvasRendererPluginOptions, // private styleRendererFactory: Record<Shape, StyleRenderer>,
  ) {}

  private removedRBushNodeAABBs: RBushNodeAABB[] = [];

  private renderQueue: DisplayObject[] = [];

  /**
   * This stack is only used by clipPath for now.
   */
  private restoreStack: DisplayObject[] = [];

  private clearFullScreen = false;

  /**
   * view projection matrix
   */
  private vpMatrix = mat4.create();
  private dprMatrix = mat4.create();
  private tmpMat4 = mat4.create();
  private vec3a = vec3.create();
  private vec3b = vec3.create();
  private vec3c = vec3.create();
  private vec3d = vec3.create();

  apply(context: RenderingPluginContext, runtime: GlobalRuntime) {
    this.context = context;

    const {
      config,
      camera,
      renderingService,
      renderingContext,
      rBushRoot,
      // @ts-ignore
      pathGeneratorFactory,
    } = context;
    this.rBush = rBushRoot;
    this.pathGeneratorFactory = pathGeneratorFactory;
    const contextService =
      context.contextService as ContextService<CanvasRenderingContext2D>;

    const canvas = renderingContext.root.ownerDocument.defaultView;

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

    renderingService.hooks.init.tapPromise(
      CanvasRendererPlugin.tag,
      async () => {
        canvas.addEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
        canvas.addEventListener(ElementEvent.CULLED, handleCulled);

        // clear fullscreen
        const dpr = contextService.getDPR();
        const { width, height } = config;
        const context = contextService.getContext();
        this.clearRect(
          context,
          0,
          0,
          width * dpr,
          height * dpr,
          config.background,
        );
      },
    );

    renderingService.hooks.destroy.tap(CanvasRendererPlugin.tag, () => {
      canvas.removeEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      canvas.removeEventListener(ElementEvent.CULLED, handleCulled);
      // this.renderQueue = [];
      // this.removedRBushNodeAABBs = [];
      // this.restoreStack = [];
    });

    renderingService.hooks.beginFrame.tap(CanvasRendererPlugin.tag, () => {
      const context = contextService.getContext();
      const dpr = contextService.getDPR();
      const { width, height } = config;
      const { dirtyObjectNumThreshold, dirtyObjectRatioThreshold } =
        this.canvasRendererPluginOptions;

      // some heuristic conditions such as 80% object changed
      const { total, rendered } = renderingService.getStats();
      const ratio = rendered / total;

      this.clearFullScreen =
        renderingService.disableDirtyRectangleRendering() ||
        (rendered > dirtyObjectNumThreshold &&
          ratio > dirtyObjectRatioThreshold);

      if (context) {
        context.resetTransform();
        if (this.clearFullScreen) {
          this.clearRect(
            context,
            0,
            0,
            width * dpr,
            height * dpr,
            config.background,
          );
        }
      }
    });

    const renderByZIndex = (
      object: DisplayObject,
      context: CanvasRenderingContext2D,
    ) => {
      if (object.isVisible() && !object.isCulled()) {
        this.renderDisplayObject(
          object,
          context,
          this.context,
          this.restoreStack,
          runtime,
        );
        // if we did a full screen rendering last frame
        this.saveDirtyAABB(object);
      }

      const sorted = object.sortable.sorted || object.childNodes;

      // should account for z-index
      sorted.forEach((child: DisplayObject) => {
        renderByZIndex(child, context);
      });
    };

    // render at the end of frame
    renderingService.hooks.endFrame.tap(CanvasRendererPlugin.tag, () => {
      const context = contextService.getContext();
      // clear & clip dirty rectangle
      const dpr = contextService.getDPR();
      mat4.fromScaling(this.dprMatrix, vec3.fromValues(dpr, dpr, 1));
      mat4.multiply(this.vpMatrix, this.dprMatrix, camera.getOrthoMatrix());

      if (this.clearFullScreen) {
        renderByZIndex(renderingContext.root, context);
      } else {
        // merge removed AABB
        const dirtyRenderBounds = this.safeMergeAABB(
          this.mergeDirtyAABBs(this.renderQueue),
          ...this.removedRBushNodeAABBs.map(({ minX, minY, maxX, maxY }) => {
            const aabb = new AABB();
            aabb.setMinMax(
              vec3.fromValues(minX, minY, 0),
              vec3.fromValues(maxX, maxY, 0),
            );
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

        const tl = vec3.transformMat4(
          this.vec3a,
          vec3.fromValues(x, y, 0),
          this.vpMatrix,
        );
        const tr = vec3.transformMat4(
          this.vec3b,
          vec3.fromValues(x + width, y, 0),
          this.vpMatrix,
        );
        const bl = vec3.transformMat4(
          this.vec3c,
          vec3.fromValues(x, y + height, 0),
          this.vpMatrix,
        );
        const br = vec3.transformMat4(
          this.vec3d,
          vec3.fromValues(x + width, y + height, 0),
          this.vpMatrix,
        );

        const minx = Math.min(tl[0], tr[0], br[0], bl[0]);
        const miny = Math.min(tl[1], tr[1], br[1], bl[1]);
        const maxx = Math.max(tl[0], tr[0], br[0], bl[0]);
        const maxy = Math.max(tl[1], tr[1], br[1], bl[1]);

        const ix = Math.floor(minx);
        const iy = Math.floor(miny);
        const iwidth = Math.ceil(maxx - minx);
        const iheight = Math.ceil(maxy - miny);

        context.save();
        this.clearRect(context, ix, iy, iwidth, iheight, config.background);
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
        const { enableDirtyRectangleRenderingDebug } =
          config.renderer.getConfig();
        if (enableDirtyRectangleRenderingDebug) {
          canvas.dispatchEvent(
            new CustomEvent(CanvasEvent.DIRTY_RECTANGLE, {
              dirtyRect: {
                x: ix,
                y: iy,
                width: iwidth,
                height: iheight,
              },
            }),
          );
        }

        // search objects intersect with dirty rectangle
        const dirtyObjects = this.searchDirtyObjects(
          runtime,
          dirtyRenderBounds,
        );

        // do rendering
        dirtyObjects
          // sort by z-index
          .sort((a, b) => a.sortable.renderOrder - b.sortable.renderOrder)
          .forEach((object) => {
            // culled object should not be rendered
            if (object && object.isVisible() && !object.isCulled()) {
              this.renderDisplayObject(
                object,
                context,
                this.context,
                this.restoreStack,
                runtime,
              );
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

    renderingService.hooks.render.tap(
      CanvasRendererPlugin.tag,
      (object: DisplayObject) => {
        if (!this.clearFullScreen) {
          // render at the end of frame
          this.renderQueue.push(object);
        }
      },
    );
  }

  private clearRect(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    background: string,
  ) {
    // clearRect is faster than fillRect @see https://stackoverflow.com/a/30830253
    context.clearRect(x, y, width, height);
    if (background) {
      context.fillStyle = background;
      context.fillRect(x, y, width, height);
    }
  }

  renderDisplayObject(
    object: DisplayObject,
    context: CanvasRenderingContext2D,
    canvasContext: CanvasContext,
    restoreStack: DisplayObject[],
    runtime: GlobalRuntime,
  ) {
    const nodeName = object.nodeName;

    // restore to its ancestor

    const parent = restoreStack[restoreStack.length - 1];
    if (
      parent &&
      !(
        object.compareDocumentPosition(parent) & Node.DOCUMENT_POSITION_CONTAINS
      )
    ) {
      context.restore();
      restoreStack.pop();
    }

    // @ts-ignore
    const styleRenderer = this.context.styleRendererFactory[nodeName];
    const generatePath = this.pathGeneratorFactory[nodeName];

    // clip path
    const { clipPath } = object.parsedStyle as ParsedBaseStyleProps;
    if (clipPath) {
      this.applyWorldTransform(context, clipPath);

      // generate path in local space
      const generatePath = this.pathGeneratorFactory[clipPath.nodeName];
      if (generatePath) {
        context.save();

        // save clip
        restoreStack.push(object);

        context.beginPath();
        generatePath(context, clipPath.parsedStyle);
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
      styleRenderer.render(
        context,
        object.parsedStyle,
        object,
        canvasContext,
        this,
        runtime,
      );

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

  private searchDirtyObjects(
    runtime: GlobalRuntime,
    dirtyRectangle: AABB,
  ): DisplayObject[] {
    // search in r-tree, get all affected nodes
    const [minX, minY] = dirtyRectangle.getMin();
    const [maxX, maxY] = dirtyRectangle.getMax();
    const rBushNodes = this.rBush.search({
      minX,
      minY,
      maxX,
      maxY,
    });

    return rBushNodes.map(({ id }) =>
      runtime.displayObjectPool.getByEntity(id),
    );
  }

  private saveDirtyAABB(object: DisplayObject) {
    const renderable = object.renderable;
    if (!renderable.dirtyRenderBounds) {
      renderable.dirtyRenderBounds = new AABB();
    }
    const renderBounds = object.getRenderBounds();
    if (renderBounds) {
      // save last dirty aabb
      renderable.dirtyRenderBounds.update(
        renderBounds.center,
        renderBounds.halfExtents,
      );
    }
  }

  /**
   * TODO: batch the same global attributes
   */
  private applyAttributesToContext(
    context: CanvasRenderingContext2D,
    object: DisplayObject,
  ) {
    const { stroke, fill, opacity, lineDash, lineDashOffset } =
      object.parsedStyle as ParsedBaseStyleProps;
    // @see https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/setLineDash
    if (lineDash) {
      context.setLineDash(lineDash);
    }

    // @see https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/lineDashOffset
    if (!isNil(lineDashOffset)) {
      context.lineDashOffset = lineDashOffset;
    }

    if (!isNil(opacity)) {
      context.globalAlpha *= opacity;
    }

    if (
      !isNil(stroke) &&
      !Array.isArray(stroke) &&
      !(stroke as CSSRGB).isNone
    ) {
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
    const anchorX = (anchor && anchor[0]) || 0;
    const anchorY = (anchor && anchor[1]) || 0;
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
      this.vec3a[0] = tx;
      this.vec3a[1] = ty;
      this.vec3a[2] = 0;
      mat4.translate(this.tmpMat4, this.tmpMat4, this.vec3a);
      mat4.multiply(this.tmpMat4, matrix, this.tmpMat4);
      mat4.multiply(this.tmpMat4, this.vpMatrix, this.tmpMat4);
    } else {
      // apply RTS transformation in world space
      mat4.copy(this.tmpMat4, object.getWorldTransform());
      this.vec3a[0] = tx;
      this.vec3a[1] = ty;
      this.vec3a[2] = 0;
      mat4.translate(this.tmpMat4, this.tmpMat4, this.vec3a);
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
