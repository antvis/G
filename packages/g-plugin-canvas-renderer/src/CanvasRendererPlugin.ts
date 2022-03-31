import type {
  DisplayObject,
  RenderingService,
  RenderingPlugin,
  ParsedColorStyleProperty,
  FederatedEvent,
} from '@antv/g';
import {
  AABB,
  Shape,
  DisplayObjectPool,
  CanvasConfig,
  ContextService,
  RenderingContext,
  RenderingPluginContribution,
  getEuler,
  fromRotationTranslationScale,
  Camera,
  DefaultCamera,
  PARSED_COLOR_TYPE,
  RenderReason,
  ElementEvent,
} from '@antv/g';
import { isArray, isNil } from '@antv/util';
import { inject, singleton } from 'mana-syringe';
import { vec3, mat4, quat } from 'gl-matrix';
import RBush from 'rbush';
import type { PathGenerator } from './shapes/paths';
import { PathGeneratorFactory } from './shapes/paths';
import type { StyleRenderer } from './shapes/styles';
import { StyleRendererFactory } from './shapes/styles';
import { GradientPool } from './shapes/GradientPool';
import { ImagePool } from './shapes/ImagePool';
import { RBushNode } from './components/RBushNode';
import type { RBushNodeAABB } from './components/RBushNode';

export const RBushRoot = 'RBushRoot';

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
  static tag = 'CanvasRendererPlugin';

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  @inject(DefaultCamera)
  private camera: Camera;

  @inject(ContextService)
  private contextService: ContextService<CanvasRenderingContext2D>;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  @inject(ImagePool)
  private imagePool: ImagePool;

  @inject(GradientPool)
  private gradientPool: GradientPool;

  @inject(PathGeneratorFactory)
  private pathGeneratorFactory: (tagName: Shape | string) => PathGenerator<any>;

  @inject(StyleRendererFactory)
  private styleRendererFactory: (tagName: Shape | string) => StyleRenderer;

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

  private enableBatch = false;
  private batchedStyleHash = '';
  private batchedDisplayObject = null;

  private syncRTree() {
    // bounds changed, need re-inserting its children
    const bulk: RBushNodeAABB[] = [];

    Array.from(this.toSync)
      // some objects may be removed since last frame
      .filter((object) => object.isConnected)
      .forEach((node: DisplayObject) => {
        // @ts-ignore
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

    this.toSync.clear();
  }

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
    const handleMounted = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;
      // @ts-ignore
      object.rBushNode = new RBushNode();

      // @ts-ignore
      this.pushToSync(e.composedPath().slice(0, -2));
    };

    const handleUnmounted = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;

      // remove r-bush node
      // @ts-ignore
      const rBushNode = object.rBushNode;

      if (rBushNode.aabb) {
        this.rBush.remove(rBushNode.aabb);

        this.toSync.delete(object);

        // save removed aabbs for dirty-rectangle rendering later
        this.removedRBushNodeAABBs.push(rBushNode.aabb);
      }
    };

    const handleBoundsChanged = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;
      // skip if this object mounted on another scenegraph root
      if (object.ownerDocument?.documentElement !== this.renderingContext.root) {
        return;
      }

      const { affectChildren } = e.detail;

      if (affectChildren) {
        object.forEach((node: DisplayObject) => {
          this.pushToSync([node]);
        });
      }

      // @ts-ignore
      this.pushToSync(e.composedPath().slice(0, -2));
    };

    renderingService.hooks.init.tap(CanvasRendererPlugin.tag, () => {
      this.renderingContext.root.addEventListener(ElementEvent.MOUNTED, handleMounted);
      this.renderingContext.root.addEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      this.renderingContext.root.addEventListener(ElementEvent.BOUNDS_CHANGED, handleBoundsChanged);
    });

    renderingService.hooks.destroy.tap(CanvasRendererPlugin.tag, () => {
      this.renderingContext.root.removeEventListener(ElementEvent.MOUNTED, handleMounted);
      this.renderingContext.root.removeEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      this.renderingContext.root.removeEventListener(
        ElementEvent.BOUNDS_CHANGED,
        handleBoundsChanged,
      );
    });

    renderingService.hooks.beginFrame.tap(CanvasRendererPlugin.tag, () => {
      const context = this.contextService.getContext();

      const { enableDirtyRectangleRendering } = this.canvasConfig.renderer.getConfig();

      // clear fullscreen when:
      // 1. dirty rectangle rendering disabled
      // 2. camera changed
      this.clearFullScreen =
        !enableDirtyRectangleRendering ||
        this.renderingContext.renderReasons.has(RenderReason.CAMERA_CHANGED);

      if (context) {
        context.save();

        if (this.clearFullScreen) {
          context.clearRect(0, 0, this.canvasConfig.width, this.canvasConfig.height);
        }

        // account for camera's world matrix
        this.applyTransform(context, this.camera.getOrthoMatrix());
      }
    });

    // render at the end of frame
    renderingService.hooks.endFrame.tap(CanvasRendererPlugin.tag, () => {
      this.syncRTree();

      const { enableDirtyRectangleRendering, enableDirtyRectangleRenderingDebug } =
        this.canvasConfig.renderer.getConfig();
      const context = this.contextService.getContext()!;
      let dirtyObjects = this.renderQueue;

      if (enableDirtyRectangleRendering) {
        // eg. camera changed
        if (!this.clearFullScreen) {
          // merge removed AABB
          const dirtyRenderBounds = this.safeMergeAABB(
            this.mergeDirtyAABBs(this.renderQueue.filter((o) => o.nodeName !== Shape.GROUP)),
            ...this.removedRBushNodeAABBs.map(({ minX, minY, maxX, maxY }) => {
              const aabb = new AABB();
              aabb.setMinMax(vec3.fromValues(minX, minY, 0), vec3.fromValues(maxX, maxY, 0));
              return aabb;
            }),
          );
          this.removedRBushNodeAABBs = [];

          if (AABB.isEmpty(dirtyRenderBounds)) {
            return;
          }

          // clear & clip dirty rectangle
          const { x, y, width, height } = this.convertAABB2Rect(dirtyRenderBounds);
          context.clearRect(x, y, width, height);
          context.beginPath();
          context.rect(x, y, width, height);
          context.clip();

          // draw dirty rectangle
          if (enableDirtyRectangleRenderingDebug) {
            context.lineWidth = 4;
            context.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${
              Math.random() * 255
            }, 1)`;
            context.strokeRect(x, y, width, height);
          }

          // search objects intersect with dirty rectangle
          dirtyObjects = this.searchDirtyObjects(dirtyRenderBounds);
        }

        // do rendering
        dirtyObjects
          // sort by z-index
          .sort((a, b) => a.sortable.renderOrder - b.sortable.renderOrder)
          .forEach((object) => {
            // culled object should not be rendered
            if (object && object.isVisible()) {
              this.renderDisplayObject(object, renderingService);
            }
          });

        if (this.enableBatch && this.batchedStyleHash) {
          this.flush(context, renderingService);
        }

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
      const { enableDirtyRectangleRendering } = this.canvasConfig.renderer.getConfig();
      if (!enableDirtyRectangleRendering) {
        // render immediately
        this.renderDisplayObject(object, renderingService);
      } else {
        // render at the end of frame
        this.renderQueue.push(object);
      }
    });
  }

  private flush(context: CanvasRenderingContext2D, renderingService: RenderingService) {
    if (this.batchedDisplayObject) {
      const styleRenderer = this.styleRendererFactory(this.batchedDisplayObject.nodeName);
      if (styleRenderer) {
        // apply attributes to context
        this.applyAttributesToContext(context, this.batchedDisplayObject, renderingService);

        // close path first
        context.closePath();
        styleRenderer.render(
          context,
          this.batchedDisplayObject.parsedStyle,
          this.batchedDisplayObject,
        );

        context.restore();
      }

      this.batchedStyleHash = '';
      this.batchedDisplayObject = null;
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

    const styleRenderer = this.styleRendererFactory(nodeName);

    let startBatch = false;
    if (this.enableBatch && styleRenderer) {
      const hash = styleRenderer.hash(object.attributes);
      if (this.batchedStyleHash && hash !== this.batchedStyleHash) {
        this.flush(context, renderingService);
      }

      if (!this.batchedStyleHash) {
        this.batchedStyleHash = hash;
        this.batchedDisplayObject = object;
        startBatch = true;
      }
    }

    // reset transformation
    context.save();

    // apply RTS transformation in world space
    this.applyTransform(context, object.getLocalTransform());

    // clip path
    const clipPathShape = object.style.clipPath;
    if (clipPathShape) {
      context.save();

      // apply clip shape's RTS
      this.applyTransform(context, clipPathShape.getLocalTransform());

      // generate path in local space
      const generatePath = this.pathGeneratorFactory(clipPathShape.nodeName);
      if (generatePath) {
        this.useAnchor(context, clipPathShape, () => {
          context.beginPath();
          generatePath(context, clipPathShape.parsedStyle);
          context.closePath();
        });
      }

      context.restore();
      context.clip();
    }

    // fill & stroke

    if (!this.enableBatch) {
      context.save();
      // apply attributes to context
      this.applyAttributesToContext(context, object, renderingService);
    }

    // apply anchor in local space
    this.useAnchor(context, object, () => {
      // generate path in local space
      const generatePath = this.pathGeneratorFactory(object.nodeName);
      if (generatePath) {
        if (startBatch || !this.enableBatch) {
          context.beginPath();
        }
        generatePath(context, object.parsedStyle);
        if (
          !this.enableBatch &&
          object.nodeName !== Shape.LINE &&
          object.nodeName !== Shape.PATH &&
          object.nodeName !== Shape.POLYLINE
        ) {
          context.closePath();
        }
      }

      // fill & stroke
      if (styleRenderer && !this.enableBatch) {
        styleRenderer.render(context, object.parsedStyle, object);
      }
    });

    // restore applied attributes, eg. shadowBlur shadowColor...
    if (!this.enableBatch) {
      context.restore();
    }

    // finish rendering, clear dirty flag
    object.renderable.dirty = false;

    this.restoreStack.push(object);
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

  private getColor(
    parsedColor: ParsedColorStyleProperty,
    object: DisplayObject,
    context: CanvasRenderingContext2D,
    renderingService: RenderingService,
  ) {
    let color: CanvasGradient | CanvasPattern | string;
    if (
      parsedColor.type === PARSED_COLOR_TYPE.LinearGradient ||
      parsedColor.type === PARSED_COLOR_TYPE.RadialGradient
    ) {
      const bounds = object.getGeometryBounds();
      const width = (bounds && bounds.halfExtents[0] * 2) || 0;
      const height = (bounds && bounds.halfExtents[1] * 2) || 0;
      color = this.gradientPool.getOrCreateGradient(
        {
          type: parsedColor.type,
          ...parsedColor.value,
          width,
          height,
        },
        context,
      );
    } else if (parsedColor.type === PARSED_COLOR_TYPE.Pattern) {
      const pattern = this.imagePool.getPatternSync(parsedColor.value);
      if (pattern) {
        color = pattern;
      } else {
        this.imagePool.createPattern(parsedColor.value, context).then(() => {
          // set dirty rectangle flag
          object.renderable.dirty = true;
          renderingService.dirtify();
        });
      }
    } else {
      // constant, eg. rgba(255,255,255,1)
      color = parsedColor.formatted;
    }

    return color;
  }

  private applyAttributesToContext(
    context: CanvasRenderingContext2D,
    object: DisplayObject,
    renderingService: RenderingService,
  ) {
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
    } = object.parsedStyle;
    // @see https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/setLineDash
    if (lineDash && isArray(lineDash)) {
      context.setLineDash(lineDash);
    }

    // @see https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/lineDashOffset
    if (!isNil(lineDashOffset)) {
      context.lineDashOffset = lineDashOffset;
    }

    if (!isNil(opacity)) {
      context.globalAlpha *= opacity;
    }

    if (!isNil(stroke)) {
      context.strokeStyle = this.getColor(stroke, object, context, renderingService);
    }

    if (!isNil(fill)) {
      context.fillStyle = this.getColor(fill, object, context, renderingService);
    }

    if (!isNil(filter)) {
      // use raw filter string
      context.filter = object.style.filter;
    }

    if (!isNil(shadowColor)) {
      context.shadowColor = (shadowColor as ParsedColorStyleProperty).formatted;
      context.shadowBlur = shadowBlur;
      context.shadowOffsetX = shadowOffsetX;
      context.shadowOffsetY = shadowOffsetY;
    }
  }

  private useAnchor(
    context: CanvasRenderingContext2D,
    object: DisplayObject,
    callback: () => void,
  ): void {
    const contentBounds = object.getGeometryBounds();
    if (contentBounds) {
      const { halfExtents } = contentBounds;

      // apply anchor, use true size, not include stroke,
      // eg. bounds = true size + half lineWidth
      const { anchor = [0, 0] } = object.parsedStyle || {};
      context.translate(-anchor[0] * halfExtents[0] * 2, -anchor[1] * halfExtents[1] * 2);

      callback();
    } else {
      callback();
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
