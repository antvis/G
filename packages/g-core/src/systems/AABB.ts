import { Entity, Matcher, System, EntityManager } from '@antv/g-ecs';
import { mat3, vec3 } from 'gl-matrix';
import RBush from 'rbush';
import { inject, injectable } from 'inversify';
import { Geometry, Transform } from '../components';
import { Renderable } from '../components/Renderable';
import { ShapeAttrs, ShapeCfg } from '../types';
import { AABB as _AABB } from '../shapes/AABB';
import { RBushNode, SHAPE } from '..';

@injectable()
export class AABB implements System {
  static tag = 's-aabb';
  static trigger = new Matcher().allOf(Renderable, Transform, Geometry);

  @inject(EntityManager)
  private entityManager: EntityManager;

  /**
   * spatial index with RTree which can speed up the search for AABBs
   */
  private tree = new RBush();

  execute(entities: Entity[]) {
    entities.forEach((entity) => {
      const renderable = entity.getComponent(Renderable);
      const geometry = entity.getComponent(Geometry);
      const transform = entity.getComponent(Transform);

      // update mesh.aabb
      if (renderable.aabbDirty) {
        if (renderable.aabb) {
          if (!renderable.dirtyAABB) {
            renderable.dirtyAABB = new _AABB();
          }
          // save last dirty aabb
          renderable.dirtyAABB.update(
            vec3.copy(vec3.create(), renderable.aabb.center),
            vec3.copy(vec3.create(), renderable.aabb.halfExtents)
          );
        } else {
          renderable.aabb = new _AABB();
        }

        // apply transform to geometry.aabb
        // @see https://stackoverflow.com/questions/6053522/how-to-recalculate-axis-aligned-bounding-box-after-translate-rotate
        renderable.aabb.setFromTransformedAABB(geometry.aabb, transform.worldTransform);

        // insert node in RTree
        if (renderable.rBushNode) {
          this.tree.remove(renderable.rBushNode);
        }
        const [minX, minY] = renderable.aabb.getMin();
        const [maxX, maxY] = renderable.aabb.getMax();
        renderable.rBushNode = {
          name: entity.getName(),
          minX,
          minY,
          maxX,
          maxY,
        };
        this.tree.insert(renderable.rBushNode);

        // updating aabb finished
        renderable.aabbDirty = false;

        // need to update dirty rectangle
        renderable.dirty = true;
      }
    });
  }

  tearDown() {
    this.tree.clear();
  }

  /**
   * TODO: merge dirty rectangles with some strategies.
   * For now, we just simply merge all the rectangles into one.
   * @see https://idom.me/articles/841.html
   */
  mergeDirtyRectangles(
    dirtyRenderables: Renderable[]
  ): {
    rectangle: _AABB | undefined;
    entities: Entity[];
  } {
    // merge into a big AABB
    let dirtyRectangle: _AABB | undefined;
    let rBushNodes: RBushNode[] = [];
    dirtyRenderables.forEach(({ aabb, dirtyAABB }) => {
      if (aabb) {
        if (!dirtyRectangle) {
          dirtyRectangle = new _AABB(aabb.center, aabb.halfExtents);
        } else {
          dirtyRectangle.add(aabb);
        }
      }
      if (dirtyAABB) {
        if (!dirtyRectangle) {
          dirtyRectangle = new _AABB(dirtyAABB.center, dirtyAABB.halfExtents);
        } else {
          dirtyRectangle.add(dirtyAABB);
        }
      }
    });

    if (dirtyRectangle) {
      // search in r-tree, get all affected nodes
      const [minX, minY] = dirtyRectangle.getMin();
      const [maxX, maxY] = dirtyRectangle.getMax();
      rBushNodes = this.search({
        minX,
        minY,
        maxX,
        maxY,
      });
    }

    return {
      rectangle: dirtyRectangle,
      entities: rBushNodes.map(({ name }) => this.entityManager.getEntityByName(name)),
    };
  }

  search(bbox: { minX: number; minY: number; maxX: number; maxY: number }): RBushNode[] {
    return this.tree.search(bbox) as RBushNode[];
  }

  updateAABB(type: SHAPE, attributes: ShapeAttrs, aabb: _AABB): void {
    const {
      x = 0,
      y = 0,
      r = 0,
      rx = 0,
      ry = 0,
      width = 0,
      height = 0,
      stroke,
      lineWidth = 0,
      lineAppendWidth = 0,
    } = attributes;
    let halfExtents: vec3 = vec3.create();
    let center: vec3 = vec3.create();
    if (type === SHAPE.Circle) {
      halfExtents = vec3.fromValues(r, r, 0);
    } else if (type === SHAPE.Ellipse) {
      halfExtents = vec3.fromValues(rx, ry, 0);
    } else if (type === SHAPE.Image) {
      halfExtents = vec3.fromValues(width / 2, height / 2, 0);
      center = vec3.fromValues(x, y, 0);
    }

    // append line width
    vec3.add(halfExtents, halfExtents, vec3.fromValues(lineWidth + lineAppendWidth, lineWidth + lineAppendWidth, 0));

    aabb.update(center, halfExtents);
  }
}
