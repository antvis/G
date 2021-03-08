import { Entity, Matcher, System } from '@antv/g-ecs';
import { Transform as CTransform, Transform } from '../components/Transform';
import { Hierarchy as CHierarchy, Hierarchy } from '../components/Hierarchy';
import { inject, injectable } from 'inversify';
import { Renderable } from '../components';
import { mat4 } from 'gl-matrix';

/**
 * update transform in scene graph
 */
@injectable()
export class SceneGraph implements System {
  static tag = 's-scenegraph';

  // @inject(EntityManager)
  // private entityManager: EntityManager;

  trigger() {
    return new Matcher().anyOf(CHierarchy, CTransform);
  }

  execute(entities: Entity[]) {
    entities.forEach((entity) => {
      const hierarchy = entity.getComponent(CHierarchy);
      const transform = entity.getComponent(CTransform);

      if (transform) {
        if (transform.isDirty() || transform.isLocalDirty()) {
          // TODO: update AABB in mesh component
          // this.setMeshAABBDirty(this.mesh.getComponentByEntity(entity));
          transform.updateTransform();
        }

        if (hierarchy) {
          const transformParent = hierarchy.parentEntity && hierarchy.parentEntity.getComponent(CTransform);
          if (transformParent) {
            transform.updateTransformWithParent(transformParent);
          }
        }
      }
    });
  }

  public attach(entity: Entity, parent: Entity, isChildAlreadyInLocalSpace?: boolean) {
    const hierarchy = entity.addComponent(Hierarchy);
    if (hierarchy && hierarchy.parentEntity) {
      this.detach(entity);
    }

    hierarchy.parentEntity = parent;

    const renderable = hierarchy.parentEntity.getComponent(Renderable);
    if (renderable) {
      renderable.aabbDirty = true;
    }
    // inform parent mesh to update its aabb
    // if (mesh && mesh.children.indexOf(entity) === -1) {
    //   mesh.children.push(entity);
    // }

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

  public detach(entity: Entity) {
    const hierarchy = entity.getComponent(Hierarchy);
    if (hierarchy) {
      const transform = entity.getComponent(Transform);
      if (transform) {
        transform.parent = null;
        transform.applyTransform();
      }

      // inform parent mesh to update its aabb
      const renderable = hierarchy.parentEntity.getComponent(Renderable);
      if (renderable) {
        renderable.aabbDirty = true;
      }
      // if (renderable) {
      //   const index = mesh.children.indexOf(entity);
      //   mesh.children.splice(index, 1);
      // }

      entity.removeComponent(Hierarchy, true);
    }
  }

  public detachChildren(parent: Entity) {
    // this.parentsToDetach.push(parent);
    // // const mesh = this.mesh.getComponentByEntity(parent);
    // // if (mesh) {
    // //   mesh.children = [];
    // // }
    // for (let i = 0; i < this.hierarchy.getCount(); ) {
    //   if (this.hierarchy.getComponent(i)?.parentID === parent) {
    //     const entity = this.hierarchy.getEntity(i);
    //     this.detach(entity);
    //   } else {
    //     ++i;
    //   }
    // }
  }
}
