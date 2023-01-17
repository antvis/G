import type {
  BaseStyleProps,
  DisplayObject,
  ParsedBaseStyleProps,
  PickingResult,
  RenderingPlugin,
  Shape,
  IDocument,
  RenderingPluginContext,
  CanvasConfig,
  GlobalRuntime,
} from '@antv/g-lite';
import { findClosestClipPathTarget, Point } from '@antv/g-lite';
import type { PathGenerator } from '@antv/g-plugin-canvas-path-generator';
import { mat4, vec3 } from 'gl-matrix';

export type PointInPathPicker<T extends BaseStyleProps> = (
  displayObject: DisplayObject<T>,
  point: Point,
  isClipPath?: boolean,
  isPointInPath?: (
    runtime: GlobalRuntime,
    displayObject: DisplayObject<T>,
    point: Point,
  ) => boolean,
  runtime?: GlobalRuntime,
) => boolean;

const tmpVec3a = vec3.create();
const tmpVec3b = vec3.create();
const tmpVec3c = vec3.create();
const tmpMat4 = mat4.create();

/**
 * pick shape(s) with Mouse/Touch event
 *
 * 1. find AABB with r-tree
 * 2. do math calculation with geometry in an accurate way
 */
export class CanvasPickerPlugin implements RenderingPlugin {
  static tag = 'CanvasPicker';

  private canvasConfig: Partial<CanvasConfig>;
  private pathGeneratorFactory: Record<Shape, PathGenerator<any>>;
  private pointInPathPickerFactory: Record<Shape, PointInPathPicker<any>>;

  apply(context: RenderingPluginContext, runtime: GlobalRuntime) {
    const {
      config,
      renderingService,
      renderingContext,
      // @ts-ignore
      pathGeneratorFactory,
      // @ts-ignore
      pointInPathPickerFactory,
    } = context;
    this.canvasConfig = config;
    this.pathGeneratorFactory = pathGeneratorFactory;
    this.pointInPathPickerFactory = pointInPathPickerFactory;

    const document = renderingContext.root?.ownerDocument;

    renderingService.hooks.pick.tapPromise(
      CanvasPickerPlugin.tag,
      async (result: PickingResult) => {
        return this.pick(document, result, runtime);
      },
    );

    renderingService.hooks.pickSync.tap(
      CanvasPickerPlugin.tag,
      (result: PickingResult) => {
        return this.pick(document, result, runtime);
      },
    );
  }

  private pick(
    document: IDocument,
    result: PickingResult,
    runtime: GlobalRuntime,
  ) {
    const {
      topmost,
      position: { x, y },
    } = result;

    // position in world space
    const position = vec3.set(tmpVec3a, x, y, 0);

    // query by AABB first with spatial index(r-tree)
    const hitTestList = document.elementsFromBBox(
      position[0],
      position[1],
      position[0],
      position[1],
    );

    // test with clip path & origin shape
    // @see https://github.com/antvis/g/issues/1064
    const pickedDisplayObjects: DisplayObject[] = [];
    for (const displayObject of hitTestList) {
      const worldTransform = displayObject.getWorldTransform();
      const isHitOriginShape = this.isHit(
        displayObject,
        position,
        worldTransform,
        false,
        runtime,
      );
      if (isHitOriginShape) {
        // should look up in the ancestor node
        const clipped = findClosestClipPathTarget(displayObject);
        if (clipped) {
          const { clipPath } = clipped.parsedStyle as ParsedBaseStyleProps;
          const isHitClipPath = this.isHit(
            clipPath,
            position,
            clipPath.getWorldTransform(),
            true,
            runtime,
          );
          if (isHitClipPath) {
            if (topmost) {
              result.picked = [displayObject];
              return result;
            } else {
              pickedDisplayObjects.push(displayObject);
            }
          }
        } else {
          if (topmost) {
            result.picked = [displayObject];
            return result;
          } else {
            pickedDisplayObjects.push(displayObject);
          }
        }
      }
    }

    result.picked = pickedDisplayObjects;
    return result;
  }

  private isHit = (
    displayObject: DisplayObject,
    position: vec3,
    worldTransform: mat4,
    isClipPath: boolean,
    runtime: GlobalRuntime,
  ) => {
    // use picker for current shape's type
    const pick = this.pointInPathPickerFactory[displayObject.nodeName];
    if (pick) {
      // invert with world matrix
      const invertWorldMat = mat4.invert(tmpMat4, worldTransform);

      // transform client position to local space, do picking in local space
      const localPosition = vec3.transformMat4(
        tmpVec3b,
        vec3.set(tmpVec3c, position[0], position[1], 0),
        invertWorldMat,
      );

      // account for anchor
      const { halfExtents } = displayObject.getGeometryBounds();
      const { anchor } = displayObject.parsedStyle as ParsedBaseStyleProps;
      localPosition[0] += ((anchor && anchor[0]) || 0) * halfExtents[0] * 2;
      localPosition[1] += ((anchor && anchor[1]) || 0) * halfExtents[1] * 2;
      if (
        pick(
          displayObject,
          new Point(localPosition[0], localPosition[1]),
          isClipPath,
          this.isPointInPath,
          runtime,
        )
      ) {
        return true;
      }
    }

    return false;
  };

  /**
   * use native picking method
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/isPointInPath
   */
  private isPointInPath = (
    runtime: GlobalRuntime,
    displayObject: DisplayObject,
    position: Point,
  ) => {
    const context = runtime.offscreenCanvas.getOrCreateContext(
      this.canvasConfig.offscreenCanvas,
    ) as CanvasRenderingContext2D;

    const generatePath = this.pathGeneratorFactory[displayObject.nodeName];
    if (generatePath) {
      context.beginPath();
      generatePath(context, displayObject.parsedStyle);
      context.closePath();
    }

    return context.isPointInPath(position.x, position.y);
  };
}
