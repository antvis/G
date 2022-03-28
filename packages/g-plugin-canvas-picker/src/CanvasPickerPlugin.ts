import type {
  Shape,
  DisplayObject,
  RenderingService,
  RenderingPlugin,
  PickingResult,
  BaseStyleProps,
  Element,
} from '@antv/g';
import {
  DisplayObjectPool,
  RenderingPluginContribution,
  SceneGraphService,
  OffscreenCanvasCreator,
  Point,
} from '@antv/g';
import { PathGeneratorFactory, RBushRoot } from '@antv/g-plugin-canvas-renderer';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { RBush, PathGenerator, RBushNodeAABB } from '@antv/g-plugin-canvas-renderer';
import { mat4, vec3 } from 'gl-matrix';
import { inject, singleton } from 'mana-syringe';

export const PointInPathPickerFactory = 'PointInPathPicker';
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
@singleton({ contrib: RenderingPluginContribution })
export class CanvasPickerPlugin implements RenderingPlugin {
  static tag = 'CanvasPickerPlugin';

  @inject(SceneGraphService)
  private sceneGraphService: SceneGraphService;

  @inject(DisplayObjectPool)
  private displayObjectPool: DisplayObjectPool;

  @inject(OffscreenCanvasCreator)
  private offscreenCanvas: OffscreenCanvasCreator;

  @inject(RBushRoot)
  private rBush: RBush<RBushNodeAABB>;

  @inject(PathGeneratorFactory)
  private pathGeneratorFactory: (tagName: Shape | string) => PathGenerator<any>;

  @inject(PointInPathPickerFactory)
  private pointInPathPickerFactory: (tagName: Shape | string) => PointInPathPicker<any>;

  apply(renderingService: RenderingService) {
    renderingService.hooks.pick.tap(CanvasPickerPlugin.tag, (result: PickingResult) => {
      // position in world space
      const { x, y } = result.position;
      const position = vec3.fromValues(x, y, 0);
      const pickedDisplayObjects: DisplayObject[] = [];

      // query by AABB first with spatial index(r-tree)
      const rBushNodes = this.rBush.search({
        minX: position[0],
        minY: position[1],
        maxX: position[0],
        maxY: position[1],
      });

      const queriedIds = rBushNodes.map((node) => node.id);
      rBushNodes.forEach(({ id }) => {
        const displayObject = this.displayObjectPool.getByEntity(id);
        if (displayObject.isVisible() && displayObject.interactive) {
          // parent is not included, eg. parent is clipped
          if (
            displayObject.parentNode &&
            queriedIds.indexOf((displayObject.parentNode as Element).entity) === -1
          ) {
            return;
          }

          // test with clip path
          const objectToTest = displayObject.style.clipPath || displayObject;
          let worldTransform = displayObject.getWorldTransform();

          // clipped's world matrix * clipPath's local matrix
          if (displayObject.style.clipPath) {
            worldTransform = mat4.multiply(
              mat4.create(),
              worldTransform,
              displayObject.style.clipPath.getLocalTransform(),
            );
          }

          if (this.isHit(objectToTest, position, worldTransform)) {
            pickedDisplayObjects.push(displayObject);
          }
        }
      });

      // find group with max z-index
      pickedDisplayObjects.sort((a, b) => a.sortable.renderOrder - b.sortable.renderOrder);

      result.picked = pickedDisplayObjects[pickedDisplayObjects.length - 1] || null;
      return result;
    });
  }

  private isHit = (displayObject: DisplayObject, position: vec3, worldTransform: mat4) => {
    // use picker for current shape's type
    const pick = this.pointInPathPickerFactory(displayObject.nodeName);
    if (pick) {
      // invert with world matrix
      const invertWorldMat = mat4.invert(mat4.create(), worldTransform);

      // transform client position to local space, do picking in local space
      const localPosition = vec3.transformMat4(
        vec3.create(),
        vec3.fromValues(position[0], position[1], 0),
        invertWorldMat,
      );

      // account for anchor
      const { halfExtents } = displayObject.getGeometryBounds();
      const { anchor = [0, 0] } = displayObject.parsedStyle;
      localPosition[0] += anchor[0] * halfExtents[0] * 2;
      localPosition[1] += anchor[1] * halfExtents[1] * 2;
      if (pick(displayObject, new Point(localPosition[0], localPosition[1]), this.isPointInPath)) {
        return true;
      }
    }

    return false;
  };

  /**
   * use native picking method
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/isPointInPath
   */
  private isPointInPath = (displayObject: DisplayObject, position: Point) => {
    const context = this.offscreenCanvas.getOrCreateContext() as CanvasRenderingContext2D;
    const generatePath = this.pathGeneratorFactory(displayObject.nodeName);
    if (generatePath) {
      generatePath(context, displayObject.parsedStyle);
    }

    return context.isPointInPath(position.x, position.y);
  };
}
