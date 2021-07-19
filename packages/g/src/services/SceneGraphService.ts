import { Entity } from '@antv/g-ecs';
import { isNil } from '@antv/util';
import EventEmitter from 'eventemitter3';
import { Transform } from '../components/Transform';
import { SceneGraphNode } from '../components/SceneGraphNode';
import { Sortable } from '../components/Sortable';
import { inject, injectable } from 'inversify';
import { Geometry, Renderable } from '../components';
import { mat4, quat, vec3 } from 'gl-matrix';
import { DisplayObject } from '../DisplayObject';
import { AABB } from '../shapes';
import { SceneGraphSelector, SceneGraphSelectorFactory } from './SceneGraphSelector';

function sortByZIndex(e1: Entity, e2: Entity) {
  const sortable1 = e1.getComponent(Sortable);
  const sortable2 = e2.getComponent(Sortable);
  if (sortable1.zIndex === sortable2.zIndex) {
    const parent = e1.getComponent(SceneGraphNode).parent;
    if (parent) {
      const children = parent.getComponent(SceneGraphNode).children || [];
      return children.indexOf(e1) - children.indexOf(e2);
    }
  }
  return sortable1.zIndex - sortable2.zIndex;
}

export enum SCENE_GRAPH_EVENT {
  AABBChanged = 'AABBChanged',
}

/**
 * update transform in scene graph
 *
 * @see https://community.khronos.org/t/scene-graphs/50542/7
 */
@injectable()
export class SceneGraphService extends EventEmitter {
  @inject(SceneGraphSelectorFactory)
  private sceneGraphSelectorFactory: () => SceneGraphSelector;

  matches(query: string, root: DisplayObject<any>) {
    return this.sceneGraphSelectorFactory().is(query, root);
  }

  querySelector(query: string, root: DisplayObject<any>) {
    return this.sceneGraphSelectorFactory().selectOne(query, root);
  }

  querySelectorAll(query: string, root: DisplayObject<any>) {
    return this.sceneGraphSelectorFactory()
      .selectAll(query, root)
      .filter((node) => !node.getEntity().getComponent(SceneGraphNode).shadow);
  }

  attach(entity: Entity, parentEntity: Entity, index?: number) {
    const hierarchy = entity.getComponent(SceneGraphNode);
    if (hierarchy && hierarchy.parent) {
      this.detach(entity);
    }

    hierarchy.parent = parentEntity;
    const parentSceneGraphNode = parentEntity.getComponent(SceneGraphNode);
    if (!isNil(index)) {
      parentSceneGraphNode.children.splice(index!, 0, entity);
    } else {
      parentSceneGraphNode.children.push(entity);
    }

    this.dirtifyWorld(entity, entity.getComponent(Transform));
  }

  detach(entity: Entity) {
    const hierarchy = entity.getComponent(SceneGraphNode);
    if (hierarchy.parent) {
      const transform = entity.getComponent(Transform);
      mat4.getScaling(transform.localScale, transform.worldTransform);
      mat4.getTranslation(transform.localPosition, transform.worldTransform);
      mat4.getRotation(transform.localRotation, transform.worldTransform);
      transform.localDirtyFlag = true;

      const parentSceneGraphNode = hierarchy.parent.getComponent(SceneGraphNode);
      if (parentSceneGraphNode) {
        const index = parentSceneGraphNode.children.indexOf(entity);
        if (index > -1) {
          parentSceneGraphNode.children.splice(index, 1);
        }
      }

      this.dirtifyWorld(entity, transform);
      hierarchy.parent = null;
    }
  }

  /**
   * compare two display objects by hierarchy-index and z-index
   *
   * use materialized path
   * @see https://stackoverflow.com/questions/31470730/comparing-tree-nodes
   */
  sort = (object1: DisplayObject<any>, object2: DisplayObject<any>): number => {
    if (!object1.parentNode) {
      return -1;
    }

    if (!object2.parentNode) {
      return 1;
    }

    const hierarchyDiff = this.getDepth(object1) - this.getDepth(object2);

    let o1 = object1;
    let o2 = object2;
    if (hierarchyDiff < 0) {
      o2 = object2.getAncestor(-hierarchyDiff)!;
      if (o2 === o1) {
        return -1;
      }
    } else if (hierarchyDiff > 0) {
      o1 = object1.getAncestor(hierarchyDiff)!;
      if (o2 === o1) {
        return 1;
      }
    }

    while (o1 && o2 && o1.parentNode !== o2.parentNode) {
      o1 = o1.parentNode!;
      o2 = o2.parentNode!;
    }

    const parent = o1.parentNode;
    if (parent) {
      const parentEntity = parent.getEntity();
      const parentSortable = parentEntity.getComponent(Sortable);

      // no need to re-sort, use cached sorted children
      if (!parentSortable.sorted) {
        parentSortable.sorted = [...parentEntity.getComponent(SceneGraphNode).children];
      }
      if (parentSortable.dirty) {
        parentSortable.sorted.sort(sortByZIndex);
        parentSortable.dirty = false;
      }

      return (
        parentSortable.sorted.indexOf(o1.getEntity()) -
        parentSortable.sorted.indexOf(o2.getEntity())
      );
    }

    return -1;
  };

  private getDepth(object: DisplayObject<any>) {
    let o: DisplayObject<any> = object;
    let depth = 0;
    while (o) {
      o = o.parentNode!;
      depth++;
    }
    return depth;
  }

  setOrigin(entity: Entity, origin: vec3 | number, y = 0, z = 0) {
    if (typeof origin === 'number') {
      origin = vec3.fromValues(origin, y, z);
    }
    const transform = entity.getComponent(Transform);
    if (vec3.equals(origin, transform.origin)) {
      return;
    }

    const originVec = transform.origin;
    originVec[0] = origin[0];
    originVec[1] = origin[1];
    originVec[2] = origin[2] || 0;
    this.dirtifyLocal(entity, transform);
  }

  /**
   * rotate in world space
   */
  rotate = (() => {
    const parentInvertRotation = quat.create();
    return (entity: Entity, degrees: vec3 | number, y = 0, z = 0) => {
      if (typeof degrees === 'number') {
        degrees = vec3.fromValues(degrees, y, z);
      }

      const transform = entity.getComponent(Transform);
      const hierarchy = entity.getComponent(SceneGraphNode);
      if (hierarchy.parent === null) {
        this.rotateLocal(entity, degrees);
      } else {
        const rotation = quat.create();
        quat.fromEuler(rotation, degrees[0], degrees[1], degrees[2]);
        const rot = this.getRotation(entity);
        const parentRot = this.getRotation(hierarchy.parent);

        quat.copy(parentInvertRotation, parentRot);
        quat.invert(parentInvertRotation, parentInvertRotation);
        quat.multiply(parentInvertRotation, parentInvertRotation, rotation);
        quat.multiply(transform.localRotation, rotation, rot);
        quat.normalize(transform.localRotation, transform.localRotation);

        if (!transform.localDirtyFlag) {
          this.dirtifyLocal(entity, transform);
        }
      }
    };
  })();

  /**
   * rotate in local space
   * @see @see https://docs.microsoft.com/en-us/windows/win32/api/directxmath/nf-directxmath-xmquaternionrotationrollpitchyaw
   */
  rotateLocal = (() => {
    const rotation = quat.create();
    return (entity: Entity, degrees: vec3 | number, y = 0, z = 0) => {
      if (typeof degrees === 'number') {
        degrees = vec3.fromValues(degrees, y, z);
      }
      const transform = entity.getComponent(Transform);
      quat.fromEuler(rotation, degrees[0], degrees[1], degrees[2]);
      quat.mul(transform.localRotation, transform.localRotation, rotation);

      if (!transform.localDirtyFlag) {
        this.dirtifyLocal(entity, transform);
      }
    };
  })();

  /**
   * set euler angles(degrees) in world space
   */
  setEulerAngles = (() => {
    const invParentRot = quat.create();

    return (entity: Entity, degrees: vec3 | number, y = 0, z = 0) => {
      if (typeof degrees === 'number') {
        degrees = vec3.fromValues(degrees, y, z);
      }

      const transform = entity.getComponent(Transform);
      const hierarchy = entity.getComponent(SceneGraphNode);

      if (hierarchy.parent === null) {
        this.setLocalEulerAngles(entity, degrees);
      } else {
        quat.fromEuler(transform.localRotation, degrees[0], degrees[1], degrees[2]);
        const parentRotation = this.getRotation(hierarchy.parent);
        quat.copy(invParentRot, quat.invert(quat.create(), parentRotation));
        quat.mul(transform.localRotation, transform.localRotation, invParentRot);

        this.dirtifyLocal(entity, transform);
      }
    };
  })();

  /**
   * set euler angles(degrees) in local space
   */
  setLocalEulerAngles(entity: Entity, degrees: vec3 | number, y = 0, z = 0) {
    if (typeof degrees === 'number') {
      degrees = vec3.fromValues(degrees, y, z);
    }
    const transform = entity.getComponent(Transform);
    quat.fromEuler(transform.localRotation, degrees[0], degrees[1], degrees[2]);
    this.dirtifyLocal(entity, transform);
  }

  /**
   * translate in local space
   *
   * @example
   * ```
   * translateLocal(x, y, z)
   * translateLocal(vec3(x, y, z))
   * ```
   */
  translateLocal = (() => {
    return (entity: Entity, translation: vec3 | number, y: number = 0, z: number = 0) => {
      if (typeof translation === 'number') {
        translation = vec3.fromValues(translation, y, z);
      }
      const transform = entity.getComponent(Transform);
      if (vec3.equals(translation, vec3.create())) {
        return;
      }
      vec3.transformQuat(translation, translation, transform.localRotation);
      vec3.add(transform.localPosition, transform.localPosition, translation);

      this.dirtifyLocal(entity, transform);
    };
  })();

  /**
   * move to position in world space
   *
   * 对应 g 原版的 move/moveTo
   * @see https://github.com/antvis/g/blob/master/packages/g-base/src/abstract/element.ts#L684-L689
   */
  setPosition = (() => {
    const parentInvertMatrix = mat4.create();

    return (entity: Entity, position: vec3 | number, y: number = 0, z: number = 0) => {
      if (typeof position === 'number') {
        position = vec3.fromValues(position, y, z);
      }

      const transform = entity.getComponent(Transform);
      transform.position = position;

      const hierarchy = entity.getComponent(SceneGraphNode);
      if (hierarchy.parent === null) {
        vec3.copy(transform.localPosition, position);
      } else {
        const parentTransform = hierarchy.parent.getComponent(Transform);
        mat4.copy(parentInvertMatrix, parentTransform.worldTransform);
        mat4.invert(parentInvertMatrix, parentInvertMatrix);
        vec3.transformMat4(transform.localPosition, position, parentInvertMatrix);
        this.dirtifyLocal(entity, transform);
      }

      if (!transform.localDirtyFlag) {
        this.dirtifyLocal(entity, transform);
      }
    };
  })();

  /**
   * move to position in local space
   */
  setLocalPosition(entity: Entity, position: vec3 | number, y: number = 0, z: number = 0) {
    if (typeof position === 'number') {
      position = vec3.fromValues(position, y, z);
    }
    const transform = entity.getComponent(Transform);
    if (vec3.equals(transform.localPosition, position)) {
      return;
    }
    vec3.copy(transform.localPosition, position);
    if (!transform.localDirtyFlag) {
      this.dirtifyLocal(entity, transform);
    }
  }

  /**
   * scale in local space
   */
  scaleLocal(entity: Entity, scaling: vec3 | number, y: number = 1, z: number = 1) {
    if (typeof scaling === 'number') {
      scaling = vec3.fromValues(scaling, y, z);
    }
    const transform = entity.getComponent(Transform);
    vec3.multiply(transform.localScale, transform.localScale, scaling);
    this.dirtifyLocal(entity, transform);
  }

  setLocalScale(entity: Entity, scaling: vec3 | number, y: number = 1, z: number = 1) {
    if (typeof scaling === 'number') {
      scaling = vec3.fromValues(scaling, y, z);
    }
    const transform = entity.getComponent(Transform);
    if (vec3.equals(transform.localScale, scaling)) {
      return;
    }

    vec3.copy(transform.localScale, scaling);
    this.dirtifyLocal(entity, transform);
  }

  /**
   * translate in world space
   *
   * @example
   * ```
   * translate(x, y, z)
   * translate(vec3(x, y, z))
   * ```
   *
   * 对应 g 原版的 translate 2D
   * @see https://github.com/antvis/g/blob/master/packages/g-base/src/abstract/element.ts#L665-L676
   */
  translate = (() => {
    const tr = vec3.create();

    return (entity: Entity, translation: vec3 | number, y: number = 0, z: number = 0) => {
      if (typeof translation === 'number') {
        translation = vec3.fromValues(translation, y, z);
      }
      if (vec3.equals(translation, vec3.create())) {
        return;
      }

      vec3.add(tr, this.getPosition(entity), translation);

      this.setPosition(entity, tr);
    };
  })();

  dirtifyLocal(entity: Entity, transform: Transform) {
    if (!transform.localDirtyFlag) {
      transform.localDirtyFlag = true;
      if (!transform.dirtyFlag) {
        this.dirtifyWorld(entity, transform);
      }
    }
  }

  dirtifyWorld(entity: Entity, transform: Transform) {
    this.dirtifyWorldInternal(entity, transform);
  }

  getPosition(entity: Entity) {
    const transform = entity.getComponent(Transform);
    return mat4.getTranslation(transform.position, this.getWorldTransform(entity, transform));
  }

  getRotation(entity: Entity) {
    const transform = entity.getComponent(Transform);
    return mat4.getRotation(transform.rotation, this.getWorldTransform(entity, transform));
  }

  getScale(entity: Entity) {
    const transform = entity.getComponent(Transform);
    return mat4.getScaling(transform.scaling, this.getWorldTransform(entity, transform));
  }

  getWorldTransform(entity: Entity, transform: Transform = entity.getComponent(Transform)) {
    if (!transform.localDirtyFlag && !transform.dirtyFlag) {
      return transform.worldTransform;
    }

    const parentEntity = entity.getComponent(SceneGraphNode).parent;

    if (parentEntity) {
      const parentTransform = parentEntity.getComponent(Transform);
      this.getWorldTransform(parentEntity, parentTransform);
    }

    this.updateTransform(entity, transform);

    return transform.worldTransform;
  }

  getLocalPosition(entity: Entity) {
    return entity.getComponent(Transform).localPosition;
  }

  getLocalRotation(entity: Entity) {
    return entity.getComponent(Transform).localRotation;
  }

  getLocalScale(entity: Entity) {
    return entity.getComponent(Transform).localScale;
  }

  getLocalTransform(entity: Entity) {
    const transform = entity.getComponent(Transform);
    if (transform.localDirtyFlag) {
      mat4.fromRotationTranslationScaleOrigin(
        transform.localTransform,
        transform.localRotation,
        transform.localPosition,
        transform.localScale,
        transform.origin,
      );
      transform.localDirtyFlag = false;
    }
    return transform.localTransform;
  }

  getLocalBounds(entity: Entity): AABB | null {
    const parentEntity = entity.getComponent(SceneGraphNode).parent;
    if (parentEntity) {
      const parentInvert = mat4.invert(mat4.create(), this.getWorldTransform(parentEntity));
      const bounds = this.getBounds(entity);

      if (bounds) {
        const localBounds = new AABB();
        localBounds.setFromTransformedAABB(bounds, parentInvert);
        return localBounds;
      }
    }

    return null;
  }

  getBounds(entity: Entity): AABB | null {
    const renderable = entity.getComponent(Renderable);
    if (!renderable.aabbDirty && renderable.aabb) {
      return renderable.aabb;
    }

    // reset with geometry's aabb
    let geometryAABB = entity.getComponent(Geometry).aabb;
    let aabb: AABB | undefined;
    if (geometryAABB) {
      aabb = new AABB();
      // apply transformation to aabb
      aabb.setFromTransformedAABB(geometryAABB, this.getWorldTransform(entity));
    }

    // merge children's aabbs
    const children = entity.getComponent(SceneGraphNode).children;
    children.forEach((child) => {
      const childBounds = this.getBounds(child);
      if (childBounds) {
        if (!aabb) {
          aabb = new AABB();
          aabb.update(childBounds.center, childBounds.halfExtents);
        } else {
          aabb.add(childBounds);
        }
      }
    });

    if (aabb) {
      renderable.aabb = aabb;
    }
    renderable.aabbDirty = false;
    this.emit(SCENE_GRAPH_EVENT.AABBChanged, entity);

    return renderable.aabb || null;
  }

  private dirtifyAABBToRoot(entity: Entity) {
    let p: Entity | null = entity;
    while (p) {
      const renderable = p.getComponent(Renderable);
      renderable.aabbDirty = true;
      renderable.dirty = true;
      p = p.getComponent(SceneGraphNode).parent;
    }
  }

  private dirtifyWorldInternal(entity: Entity, transform: Transform) {
    if (!transform.dirtyFlag) {
      const hierarchy = entity.getComponent(SceneGraphNode);
      transform.dirtyFlag = true;
      hierarchy.children.forEach((childEntity) => {
        const childTransform = childEntity.getComponent(Transform);
        if (!childTransform.dirtyFlag) {
          this.dirtifyWorldInternal(childEntity, childTransform);
        }
      });

      // bubble up to root
      this.dirtifyAABBToRoot(entity);
    }
  }

  private updateTransform(entity: Entity, transform: Transform) {
    if (transform.localDirtyFlag) {
      this.getLocalTransform(entity);
    }
    if (transform.dirtyFlag) {
      const parentEntity = entity.getComponent(SceneGraphNode).parent;
      const parentTransform = parentEntity && parentEntity.getComponent(Transform);
      if (parentEntity === null || !parentTransform) {
        mat4.copy(transform.worldTransform, transform.localTransform);
      } else {
        // TODO: should we support scale compensation?
        // @see https://github.com/playcanvas/engine/issues/1077#issuecomment-359765557
        mat4.multiply(
          transform.worldTransform,
          parentTransform.worldTransform,
          transform.localTransform,
        );
      }
      transform.dirtyFlag = false;
    }
  }
}
