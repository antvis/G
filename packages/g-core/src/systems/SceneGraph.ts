import { Entity, Matcher, System, EntityManager } from '@antv/g-ecs';
import { Transform } from '../components/Transform';
import { Hierarchy } from '../components/Hierarchy';
import { Sortable } from '../components/Sortable';
import { inject, injectable } from 'inversify';
import { Renderable } from '../components';
import { mat4 } from 'gl-matrix';

function sortByZIndex(e1: Entity, e2: Entity) {
  const sortable1 = e1.getComponent(Sortable);
  const sortable2 = e2.getComponent(Sortable);

  return sortable1.zIndex - sortable2.zIndex;
}

/**
 * update transform in scene graph
 *
 * @see https://community.khronos.org/t/scene-graphs/50542/7
 */
@injectable()
export class SceneGraph implements System {
  static tag = 's-scenegraph';
  static trigger = new Matcher().allOf(Hierarchy, Transform);

  @inject(EntityManager)
  private entityManager: EntityManager;

  private topologicalSortDirty = true;
  private topologicalSortResult: Entity[] = [];

  execute(entities: Entity[]) {
    entities.forEach((entity) => {
      const hierarchy = entity.getComponent(Hierarchy);
      const transform = entity.getComponent(Transform);
      if (transform.dirtyFlag || transform.localDirtyFlag) {
        // need to update AABB in renderable
        const renderable = entity.getComponent(Renderable);
        if (renderable) {
          renderable.aabbDirty = true;
        }
        transform.updateTransform();
      }

      const transformParent = hierarchy.parent && hierarchy.parent.getComponent(Transform);
      if (transformParent) {
        transform.updateTransformWithParent(transformParent);
      }
    });
  }

  attach(entity: Entity, parent: Entity, isChildAlreadyInLocalSpace?: boolean) {
    const hierarchy = entity.getComponent(Hierarchy);
    if (hierarchy && hierarchy.parent) {
      this.detach(entity);
    }

    hierarchy.parent = parent;
    const parentHierarchy = parent.getComponent(Hierarchy);
    parentHierarchy.children.push(entity);

    const renderable = hierarchy.parent.getComponent(Renderable);
    if (renderable) {
      renderable.aabbDirty = true;
    }

    const transformParent = parent.getComponent(Transform);
    const transformChild = entity.getComponent(Transform);
    transformChild.parent = transformParent;

    if (!isChildAlreadyInLocalSpace && transformParent) {
      transformChild.matrixTransform(mat4.invert(mat4.create(), transformParent.worldTransform));
      transformChild.updateTransform();
    }
    if (transformParent) {
      transformChild.updateTransformWithParent(transformParent);
    }
  }

  detach(entity: Entity) {
    const hierarchy = entity.getComponent(Hierarchy);
    if (hierarchy) {
      const transform = entity.getComponent(Transform);
      if (transform) {
        transform.parent = null;
        transform.applyTransform();
      }

      const parentHierarchy = hierarchy.parent?.getComponent(Hierarchy);
      if (parentHierarchy) {
        const index = parentHierarchy.children.indexOf(entity);
        if (index > -1) {
          parentHierarchy.children.splice(index, 1);
        }
      }

      // inform parent mesh to update its aabb
      const renderable = hierarchy.parent?.getComponent(Renderable);
      if (renderable) {
        renderable.aabbDirty = true;
      }

      hierarchy.parent = null;
    }
  }

  detachChildren(parent: Entity) {
    this.getChildren(parent).forEach((entity) => {
      this.detach(entity);
    });
  }

  /**
   * do DFS in scenegraph
   */
  visit(entity: Entity, visitor: (e: Entity, ...args: any) => void | boolean, ...args: any) {
    if (visitor(entity, ...args)) {
      return;
    }
    const entities = this.getChildren(entity);
    for (const child of entities) {
      this.visit(child, visitor, ...args);
    }
  }

  /**
   * execute topological sort on current scene graph, account for z-index on `Sortbale` component
   */
  sort() {
    if (!this.topologicalSortDirty) {
      return this.topologicalSortResult;
    }

    const entities = this.entityManager.queryByMatcher(SceneGraph.trigger);
    const rootGroup = entities.filter((entity: Entity) => entity.getComponent(Hierarchy).parent === null);

    const sorted: Entity[] = [];
    this.flatten(rootGroup, sorted);
    this.topologicalSortResult = sorted;
    this.topologicalSortDirty = false;

    return this.topologicalSortResult;
  }

  private getChildren(parent: Entity): Entity[] {
    return parent.getComponent(Hierarchy).children;
  }

  private flatten(entities: Entity[], result: Entity[]) {
    if (entities.length) {
      entities.sort(sortByZIndex).forEach((entity) => {
        const hierarchy = entity.getComponent(Hierarchy);
        this.flatten(hierarchy.children, result);
        result.push(entity);
      });
    }
  }

  setTopologicalSortDirty(dirty: boolean) {
    this.topologicalSortDirty = dirty;
  }
}
