import {
  SHAPE,
  DisplayObject,
  DisplayObjectPool,
  RenderingService,
  RenderingPlugin,
  RenderingContext,
  SceneGraphService,
  PickingResult,
  OffscreenCanvasCreator,
  Camera,
  BaseStyleProps,
  Point,
} from '@antv/g';
import { PathGeneratorFactory, PathGenerator, RBushRoot, RBushNodeAABB, RBush } from '@antv/g-plugin-canvas-renderer';
import { mat4, vec3 } from 'gl-matrix';
import { inject, injectable } from 'inversify';

export const PointInPathPickerFactory = Symbol('PointInPathPicker');
export type PointInPathPicker<T extends BaseStyleProps> = (
  displayObject: DisplayObject<T>,
  point: Point,
  isPointInPath?: (displayObject: DisplayObject<T>, point: Point) => boolean,
) => boolean;

/**
 * pick shape(s) with Mouse/Touch event
 *
 * 1. find AABB with r-tree
 * 2. do math calculation with geometry in an accurate way
 */
@injectable()
export class CanvasPickerPlugin implements RenderingPlugin {
  static tag = 'CanvasPickerPlugin';

  @inject(Camera)
  private camera: Camera;

  @inject(SceneGraphService)
  private sceneGraphService: SceneGraphService;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  @inject(DisplayObjectPool)
  private displayObjectPool: DisplayObjectPool;

  @inject(OffscreenCanvasCreator)
  private offscreenCanvas: OffscreenCanvasCreator;

  @inject(RBushRoot)
  private rBush: RBush<RBushNodeAABB>;

  @inject(PathGeneratorFactory)
  private pathGeneratorFactory: (tagName: SHAPE) => PathGenerator<any>;

  @inject(PointInPathPickerFactory)
  private pointInPathPickerFactory: (tagName: SHAPE) => PointInPathPicker<any>;

  apply(renderingService: RenderingService) {
    renderingService.hooks.pick.tap(CanvasPickerPlugin.tag, (result: PickingResult) => {
      // position in world space
      const { x, y } = result.position;
      const position = vec3.fromValues(x, y, 0);
      const invertOrthoMat = mat4.invert(mat4.create(), this.camera.getOrthoMatrix());
      vec3.transformMat4(
        position,
        position,
        invertOrthoMat,
      );

      // query by AABB first with spatial index(r-tree)
      const rBushNodes = this.rBush.search({
        minX: position[0],
        minY: position[1],
        maxX: position[0],
        maxY: position[1],
      });

      const pickedDisplayObjects: DisplayObject[] = [];
      rBushNodes.forEach(({ name }: { name: string }) => {
        const displayObject = this.displayObjectPool.getByName(name);
        const { capture } = displayObject.getConfig();

        if (displayObject.isVisible() && capture) {
          // is in clip path?
          if (displayObject.style.clipPath) {
            if (!this.isHit(displayObject.style.clipPath, position)) {
              return;
            }
          }

          if (this.isHit(displayObject, position)) {
            pickedDisplayObjects.push(displayObject);
          }
        }
      });

      // find group with max z-index
      pickedDisplayObjects.sort(this.sceneGraphService.sort);

      return {
        position: result.position,
        // return last picked
        picked: pickedDisplayObjects[pickedDisplayObjects.length - 1] || null,
      };
    });
  }

  private isHit = (displayObject: DisplayObject, position: vec3) => {
    // use picker for current shape's type
    const pick = this.pointInPathPickerFactory(displayObject.nodeName);
    if (pick) {
      // invert with world matrix
      const invertWorldMat = mat4.invert(mat4.create(), displayObject.getWorldTransform());
      // transform client position to local space, do picking in local space
      const localPosition = vec3.transformMat4(
        vec3.create(),
        vec3.fromValues(position[0], position[1], 0),
        invertWorldMat,
      );
      if (
        pick(displayObject, new Point(localPosition[0], localPosition[1]), this.isPointInPath)
      ) {
        return true;
      }
    }

    return true;
  };

  /**
   * use native picking method
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/isPointInPath
   */
  private isPointInPath = (displayObject: DisplayObject, position: Point) => {
    const context = this.offscreenCanvas.getOrCreateContext() as CanvasRenderingContext2D;
    const generatePath = this.pathGeneratorFactory(displayObject.nodeName);
    if (generatePath) {
      generatePath(context, displayObject.attributes);
    }

    return context.isPointInPath(position.x, position.y);
  };
}
