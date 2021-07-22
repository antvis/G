import { isNil } from '@antv/util';
import { EventEmitter } from 'eventemitter3';
import { Transform } from '../components/Transform';
import { SceneGraphNode } from '../components/SceneGraphNode';
import { Sortable } from '../components/Sortable';
import { inject, injectable } from 'inversify';
import { Geometry, Renderable } from '../components';
import { mat4, quat, vec3 } from 'gl-matrix';
import { DisplayObject } from '../DisplayObject';
import { AABB } from '../shapes';
import { SceneGraphSelector, SceneGraphSelectorFactory } from './SceneGraphSelector';

export function sortByZIndex(o1: DisplayObject<any>, o2: DisplayObject<any>) {
  const sortable1 = o1.getEntity().getComponent(Sortable);
  const sortable2 = o2.getEntity().getComponent(Sortable);
  if (sortable1.zIndex === sortable2.zIndex) {
    const parent = o1.parent;
    if (parent) {
      const children = parent.children || [];
      return children.indexOf(o1) - children.indexOf(o2);
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

  attach(child: DisplayObject<any>, parent: DisplayObject<any>, index?: number) {
    if (child.parent) {
      this.detach(child);
    }

    const entity = child.getEntity();
    child.parent = parent;
    if (!isNil(index)) {
      child.parent.children.splice(index!, 0, child);
    } else {
      child.parent.children.push(child);
    }

    this.dirtifyWorld(child, entity.getComponent(Transform));
  }

  detach(child: DisplayObject<any>) {
    if (child.parent) {
      const entity = child.getEntity();

      const transform = entity.getComponent(Transform);
      mat4.getScaling(transform.localScale, transform.worldTransform);
      mat4.getTranslation(transform.localPosition, transform.worldTransform);
      mat4.getRotation(transform.localRotation, transform.worldTransform);
      transform.localDirtyFlag = true;

      const index = child.parent.children.indexOf(child);
      if (index > -1) {
        child.parent.children.splice(index, 1);
      }

      this.dirtifyWorld(child, transform);
      child.parent = null;
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
        parentSortable.sorted = [...parent.children];
      }
      if (parentSortable.dirty) {
        parentSortable.sorted.sort(sortByZIndex);
        parentSortable.dirty = false;
      }

      return (
        parentSortable.sorted.indexOf(o1) -
        parentSortable.sorted.indexOf(o2)
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

  setOrigin(displayObject: DisplayObject<any>, origin: vec3 | number, y = 0, z = 0) {
    if (typeof origin === 'number') {
      origin = vec3.fromValues(origin, y, z);
    }
    const transform = displayObject.getEntity().getComponent(Transform);
    if (vec3.equals(origin, transform.origin)) {
      return;
    }

    const originVec = transform.origin;
    originVec[0] = origin[0];
    originVec[1] = origin[1];
    originVec[2] = origin[2] || 0;
    this.dirtifyLocal(displayObject, transform);
  }

  /**
   * rotate in world space
   */
  rotate = (() => {
    const parentInvertRotation = quat.create();
    return (displayObject: DisplayObject<any>, degrees: vec3 | number, y = 0, z = 0) => {
      if (typeof degrees === 'number') {
        degrees = vec3.fromValues(degrees, y, z);
      }

      const transform = displayObject.getEntity().getComponent(Transform);

      if (displayObject.parent === null) {
        this.rotateLocal(displayObject, degrees);
      } else {
        const rotation = quat.create();
        quat.fromEuler(rotation, degrees[0], degrees[1], degrees[2]);
        const rot = this.getRotation(displayObject);
        const parentRot = this.getRotation(displayObject.parent);

        quat.copy(parentInvertRotation, parentRot);
        quat.invert(parentInvertRotation, parentInvertRotation);
        quat.multiply(parentInvertRotation, parentInvertRotation, rotation);
        quat.multiply(transform.localRotation, rotation, rot);
        quat.normalize(transform.localRotation, transform.localRotation);

        if (!transform.localDirtyFlag) {
          this.dirtifyLocal(displayObject, transform);
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
    return (displayObject: DisplayObject<any>, degrees: vec3 | number, y = 0, z = 0) => {
      if (typeof degrees === 'number') {
        degrees = vec3.fromValues(degrees, y, z);
      }
      const transform = displayObject.getEntity().getComponent(Transform);
      quat.fromEuler(rotation, degrees[0], degrees[1], degrees[2]);
      quat.mul(transform.localRotation, transform.localRotation, rotation);

      if (!transform.localDirtyFlag) {
        this.dirtifyLocal(displayObject, transform);
      }
    };
  })();

  /**
   * set euler angles(degrees) in world space
   */
  setEulerAngles = (() => {
    const invParentRot = quat.create();

    return (displayObject: DisplayObject<any>, degrees: vec3 | number, y = 0, z = 0) => {
      if (typeof degrees === 'number') {
        degrees = vec3.fromValues(degrees, y, z);
      }

      const transform = displayObject.getEntity().getComponent(Transform);

      if (displayObject.parent === null) {
        this.setLocalEulerAngles(displayObject, degrees);
      } else {
        quat.fromEuler(transform.localRotation, degrees[0], degrees[1], degrees[2]);
        const parentRotation = this.getRotation(displayObject.parent);
        quat.copy(invParentRot, quat.invert(quat.create(), parentRotation));
        quat.mul(transform.localRotation, transform.localRotation, invParentRot);

        this.dirtifyLocal(displayObject, transform);
      }
    };
  })();

  /**
   * set euler angles(degrees) in local space
   */
  setLocalEulerAngles(displayObject: DisplayObject<any>, degrees: vec3 | number, y = 0, z = 0) {
    if (typeof degrees === 'number') {
      degrees = vec3.fromValues(degrees, y, z);
    }
    const transform = displayObject.getEntity().getComponent(Transform);
    quat.fromEuler(transform.localRotation, degrees[0], degrees[1], degrees[2]);
    this.dirtifyLocal(displayObject, transform);
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
    return (displayObject: DisplayObject<any>, translation: vec3 | number, y: number = 0, z: number = 0) => {
      if (typeof translation === 'number') {
        translation = vec3.fromValues(translation, y, z);
      }
      const transform = displayObject.getEntity().getComponent(Transform);
      if (vec3.equals(translation, vec3.create())) {
        return;
      }
      vec3.transformQuat(translation, translation, transform.localRotation);
      vec3.add(transform.localPosition, transform.localPosition, translation);

      this.dirtifyLocal(displayObject, transform);
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

    return (displayObject: DisplayObject<any>, position: vec3 | number, y: number = 0, z: number = 0) => {
      if (typeof position === 'number') {
        position = vec3.fromValues(position, y, z);
      }

      const transform = displayObject.getEntity().getComponent(Transform);
      transform.position = position;

      if (displayObject.parent === null) {
        vec3.copy(transform.localPosition, position);
      } else {
        const parentTransform = displayObject.parent.getEntity().getComponent(Transform);
        mat4.copy(parentInvertMatrix, parentTransform.worldTransform);
        mat4.invert(parentInvertMatrix, parentInvertMatrix);
        vec3.transformMat4(transform.localPosition, position, parentInvertMatrix);
        this.dirtifyLocal(displayObject, transform);
      }

      if (!transform.localDirtyFlag) {
        this.dirtifyLocal(displayObject, transform);
      }
    };
  })();

  /**
   * move to position in local space
   */
  setLocalPosition(displayObject: DisplayObject<any>, position: vec3 | number, y: number = 0, z: number = 0) {
    if (typeof position === 'number') {
      position = vec3.fromValues(position, y, z);
    }
    const transform = displayObject.getEntity().getComponent(Transform);
    if (vec3.equals(transform.localPosition, position)) {
      return;
    }
    vec3.copy(transform.localPosition, position);
    if (!transform.localDirtyFlag) {
      this.dirtifyLocal(displayObject, transform);
    }
  }

  /**
   * scale in local space
   */
  scaleLocal(displayObject: DisplayObject<any>, scaling: vec3 | number, y: number = 1, z: number = 1) {
    if (typeof scaling === 'number') {
      scaling = vec3.fromValues(scaling, y, z);
    }
    const transform = displayObject.getEntity().getComponent(Transform);
    vec3.multiply(transform.localScale, transform.localScale, scaling);
    this.dirtifyLocal(displayObject, transform);
  }

  setLocalScale(displayObject: DisplayObject<any>, scaling: vec3 | number, y: number = 1, z: number = 1) {
    if (typeof scaling === 'number') {
      scaling = vec3.fromValues(scaling, y, z);
    }
    const transform = displayObject.getEntity().getComponent(Transform);
    if (vec3.equals(transform.localScale, scaling)) {
      return;
    }

    vec3.copy(transform.localScale, scaling);
    this.dirtifyLocal(displayObject, transform);
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

    return (displayObject: DisplayObject<any>, translation: vec3 | number, y: number = 0, z: number = 0) => {
      if (typeof translation === 'number') {
        translation = vec3.fromValues(translation, y, z);
      }
      if (vec3.equals(translation, vec3.create())) {
        return;
      }

      vec3.add(tr, this.getPosition(displayObject), translation);

      this.setPosition(displayObject, tr);
    };
  })();

  dirtifyLocal(displayObject: DisplayObject<any>, transform: Transform) {
    if (!transform.localDirtyFlag) {
      transform.localDirtyFlag = true;
      if (!transform.dirtyFlag) {
        this.dirtifyWorld(displayObject, transform);
      }
    }
  }

  dirtifyWorld(displayObject: DisplayObject<any>, transform: Transform) {
    this.dirtifyWorldInternal(displayObject, transform);
  }

  getPosition(displayObject: DisplayObject<any>) {
    const transform = displayObject.getEntity().getComponent(Transform);
    return mat4.getTranslation(transform.position, this.getWorldTransform(displayObject, transform));
  }

  getRotation(displayObject: DisplayObject<any>) {
    const transform = displayObject.getEntity().getComponent(Transform);
    return mat4.getRotation(transform.rotation, this.getWorldTransform(displayObject, transform));
  }

  getScale(displayObject: DisplayObject<any>) {
    const transform = displayObject.getEntity().getComponent(Transform);
    return mat4.getScaling(transform.scaling, this.getWorldTransform(displayObject, transform));
  }

  getWorldTransform(displayObject: DisplayObject<any>, transform: Transform = displayObject.getEntity().getComponent(Transform)) {
    if (!transform.localDirtyFlag && !transform.dirtyFlag) {
      return transform.worldTransform;
    }

    if (displayObject.parent) {
      this.getWorldTransform(displayObject.parent);
    }

    this.updateTransform(displayObject, transform);

    return transform.worldTransform;
  }

  getLocalPosition(displayObject: DisplayObject<any>) {
    return displayObject.getEntity().getComponent(Transform).localPosition;
  }

  getLocalRotation(displayObject: DisplayObject<any>) {
    return displayObject.getEntity().getComponent(Transform).localRotation;
  }

  getLocalScale(displayObject: DisplayObject<any>) {
    return displayObject.getEntity().getComponent(Transform).localScale;
  }

  getLocalTransform(displayObject: DisplayObject<any>) {
    const transform = displayObject.getEntity().getComponent(Transform);
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

  getLocalBounds(displayObject: DisplayObject<any>): AABB | null {
    if (displayObject.parent) {
      const parentInvert = mat4.invert(mat4.create(), this.getWorldTransform(displayObject.parent));
      const bounds = this.getBounds(displayObject);

      if (bounds) {
        const localBounds = new AABB();
        localBounds.setFromTransformedAABB(bounds, parentInvert);
        return localBounds;
      }
    }

    return this.getBounds(displayObject);
  }

  getBounds(displayObject: DisplayObject<any>): AABB | null {
    const entity = displayObject.getEntity();
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
      aabb.setFromTransformedAABB(geometryAABB, this.getWorldTransform(displayObject));
    }

    // merge children's aabbs
    const children = displayObject.children;
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
    this.emit(SCENE_GRAPH_EVENT.AABBChanged, displayObject);

    return renderable.aabb || null;
  }

  private dirtifyAABBToRoot(displayObject: DisplayObject<any>) {
    let p: DisplayObject<any> | null = displayObject;
    while (p) {
      const renderable = p.getEntity().getComponent(Renderable);
      renderable.aabbDirty = true;
      renderable.dirty = true;
      this.emit(SCENE_GRAPH_EVENT.AABBChanged, p);
      p = p.parent;
    }
  }

  private dirtifyWorldInternal(displayObject: DisplayObject<any>, transform: Transform) {
    if (!transform.dirtyFlag) {
      transform.dirtyFlag = true;
      displayObject.children.forEach((child) => {
        const childTransform = child.getEntity().getComponent(Transform);
        if (!childTransform.dirtyFlag) {
          this.dirtifyWorldInternal(child, childTransform);
        }
      });

      // bubble up to root
      this.dirtifyAABBToRoot(displayObject);
    }
  }

  private updateTransform(displayObject: DisplayObject<any>, transform: Transform) {
    if (transform.localDirtyFlag) {
      this.getLocalTransform(displayObject);
    }
    if (transform.dirtyFlag) {
      const parent = displayObject.parent;
      const parentTransform = parent && parent.getEntity().getComponent(Transform);
      if (parent === null || !parentTransform) {
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
