import {
  AABB,
  SHAPE,
  DisplayObject,
  DisplayObjectPool,
  CanvasConfig,
  ContextService,
  SceneGraphService,
  Renderable,
  RenderingService,
  RenderingContext,
  RenderingPlugin,
  RenderingPluginContribution,
  Cullable,
  getEuler,
  fromRotationTranslationScale,
  Camera,
  DefaultCamera,
  ParsedColorStyleProperty,
  PARSED_COLOR_TYPE,
  RENDER_REASON,
  ElementEvent,
  FederatedEvent,
} from '@antv/g';
import { isArray, isNil } from '@antv/util';
import { inject, singleton } from 'mana-syringe';
import { vec3, mat4, quat } from 'gl-matrix';
import RBush from 'rbush';
import { PathGeneratorFactory, PathGenerator } from './shapes/paths';
import { StyleRenderer, StyleRendererFactory } from './shapes/styles';
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

  @inject(SceneGraphService)
  private sceneGraphService: SceneGraphService;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  @inject(ImagePool)
  private imagePool: ImagePool;

  @inject(GradientPool)
  private gradientPool: GradientPool;

  @inject(PathGeneratorFactory)
  private pathGeneratorFactory: (tagName: SHAPE | string) => PathGenerator<any>;

  @inject(StyleRendererFactory)
  private styleRendererFactory: (tagName: SHAPE | string) => StyleRenderer;

  @inject(DisplayObjectPool)
  private displayObjectPool: DisplayObjectPool;

  /**
   * RBush used in dirty rectangle rendering
   */
  @inject(RBushRoot)
  private rBush: RBush<RBushNodeAABB>;

  private renderQueue: DisplayObject[] = [];

  private restoreStack: DisplayObject[] = [];

  private clearFullScreen = false;

  private enableBatch = false;
  private batchedStyleHash = '';
  private batchedDisplayObject = null;

  /**
   * save the last dirty rect in DEBUG mode
   */
  private lastDirtyRectangle: Rect;

  apply(renderingService: RenderingService) {
    const handleMounted = (e: FederatedEvent) => {
      // const { enableDirtyRectangleRendering } = this.canvasConfig.renderer.getConfig();
      // if (!enableDirtyRectangleRendering) {
      //   return;
      // }

      const object = e.target as DisplayObject;
      // @ts-ignore
      object.rBushNode = new RBushNode();

      handleBoundsChanged(e);
    };

    const handleUnmounted = (e: FederatedEvent) => {
      // const { enableDirtyRectangleRendering } = this.canvasConfig.renderer.getConfig();
      // if (!enableDirtyRectangleRendering) {
      //   return;
      // }

      const object = e.target as DisplayObject;

      // remove r-bush node
      // @ts-ignore
      const rBushNode = object.rBushNode;
      this.rBush.remove(rBushNode.aabb);
      // this.rBush.remove(rBushNode.aabb, (a: RBushNodeAABB, b: RBushNodeAABB) => a.name === b.name);
      // object.entity.removeComponent(RBushNode);
    };

    const handleBoundsChanged = (e: FederatedEvent) => {
      // const { enableDirtyRectangleRendering } = this.canvasConfig.renderer.getConfig();
      // // don not use rbush when dirty-rectangle rendering disabled
      // if (!enableDirtyRectangleRendering) {
      //   return;
      // }

      const object = e.target as DisplayObject;
      // skip if this object mounted on another scenegraph root
      if (object.ownerDocument?.documentElement !== this.renderingContext.root) {
        return;
      }

      // skip Document & Canvas
      const path = e.composedPath().slice(0, -2);
      path.forEach((node) => {
        this.insertRBushNode(node as DisplayObject);
      });
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

      const { enableDirtyRectangleRendering, enableDirtyRectangleRenderingDebug } =
        this.canvasConfig.renderer.getConfig();

      // clear fullscreen when:
      // 1. dirty rectangle rendering disabled
      // 2. camera changed
      this.clearFullScreen =
        !enableDirtyRectangleRendering ||
        this.renderingContext.renderReasons.has(RENDER_REASON.CameraChanged);

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
      const { enableDirtyRectangleRendering } = this.canvasConfig.renderer.getConfig();
      const context = this.contextService.getContext()!;
      if (enableDirtyRectangleRendering) {
        // merge removed AABB
        const dirtyRenderBounds = this.safeMergeAABB(
          this.mergeDirtyAABBs(this.renderQueue),
          ...this.renderingContext.removedRenderBoundsList,
        );
        this.renderingContext.removedRenderBoundsList = [];
        if (!dirtyRenderBounds) {
          return;
        }

        // clear & clip dirty rectangle
        const { x, y, width, height } = this.convertAABB2Rect(dirtyRenderBounds);
        context.clearRect(x, y, width, height);
        context.beginPath();
        context.rect(x, y, width, height);
        context.clip();

        // search objects intersect with dirty rectangle
        const dirtyObjects = this.searchDirtyObjects(dirtyRenderBounds);

        // // append uncullable objects in renderQueue
        // const uncullableObjects = this.renderQueue.filter(
        //   (object) => !object.entity.getComponent(Cullable).enable,
        // );

        // dirtyObjects.push(...uncullableObjects);

        // do rendering
        dirtyObjects
          // .filter((object) => object && object.isConnected)
          // sort by z-index
          .sort(this.sceneGraphService.sort)
          .forEach((object) => {
            if (object.isVisible()) {
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
          object.nodeName !== SHAPE.Path &&
          object.nodeName !== SHAPE.Polyline
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

  private insertRBushNode(object: DisplayObject) {
    // @ts-ignore
    const rBushNode = object.rBushNode;

    if (rBushNode) {
      // insert node in RTree
      this.rBush.remove(rBushNode.aabb);
      // this.rBush.remove(rBushNode.aabb, (a: RBushNodeAABB, b: RBushNodeAABB) => a.name === b.name);

      const renderBounds = object.getRenderBounds();
      if (renderBounds) {
        const [minX, minY] = renderBounds.getMin();
        const [maxX, maxY] = renderBounds.getMax();
        rBushNode.aabb = {
          id: object.entity,
          minX,
          minY,
          maxX,
          maxY,
        };
      }

      // sync rbush node with object's bounds
      this.rBush.insert(rBushNode.aabb);
    }
  }

  /**
   * TODO: merge dirty rectangles with some strategies.
   * For now, we just simply merge all the rectangles into one.
   * @see https://idom.me/articles/841.html
   */
  private mergeDirtyAABBs(dirtyObjects: DisplayObject[]): AABB | undefined {
    // merge into a big AABB
    let dirtyRectangle: AABB | undefined;
    dirtyObjects.forEach((object) => {
      const renderBounds = object.getRenderBounds();
      if (renderBounds) {
        if (!dirtyRectangle) {
          dirtyRectangle = new AABB(renderBounds.center, renderBounds.halfExtents);
        } else {
          dirtyRectangle.add(renderBounds);
        }
      }

      const { dirtyRenderBounds } = object.renderable;
      if (dirtyRenderBounds) {
        if (!dirtyRectangle) {
          dirtyRectangle = new AABB(dirtyRenderBounds.center, dirtyRenderBounds.halfExtents);
        } else {
          dirtyRectangle.add(dirtyRenderBounds);
        }
      }
    });

    return dirtyRectangle;
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

  // private drawDirtyRectangle(context: CanvasRenderingContext2D, { x, y, width, height }: Rect) {
  //   context.beginPath();
  //   context.rect(x + 1, y + 1, width - 1, height - 1);
  //   context.closePath();

  //   context.lineWidth = 1;
  //   context.stroke();
  // }

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
      filter,
      shadowColor,
      shadowBlur,
      shadowOffsetX,
      shadowOffsetY,
    } = object.parsedStyle;
    if (lineDash && isArray(lineDash)) {
      context.setLineDash(lineDash);
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
    callback: Function,
  ): void {
    const contentBounds = object.getGeometryBounds();
    if (contentBounds) {
      const { halfExtents } = contentBounds;
      context.save();

      // apply anchor, use true size, not include stroke,
      // eg. bounds = true size + half lineWidth
      const { anchor = [0, 0] } = object.parsedStyle || {};
      // context.translate(-anchor[0] * width, -anchor[1] * height);
      context.translate(-anchor[0] * halfExtents[0] * 2, -anchor[1] * halfExtents[1] * 2);

      callback();
      context.restore();
    } else {
      callback();
    }
  }

  private safeMergeAABB(...aabbs: (AABB | undefined)[]): AABB | undefined {
    let merged: AABB | undefined;
    aabbs.forEach((aabb) => {
      if (aabb) {
        if (!merged) {
          merged = aabb;
        } else {
          merged.add(aabb);
        }
      }
    });
    return merged;
  }
}
