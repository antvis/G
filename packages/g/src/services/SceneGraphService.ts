import { isNil } from '@antv/util';
import { EventEmitter } from 'eventemitter3';
import { Transform } from '../components/Transform';
import { Sortable } from '../components/Sortable';
import { inject, injectable } from 'inversify';
import { Geometry, Renderable } from '../components';
import { mat4, quat, vec2, vec3 } from 'gl-matrix';
import { AABB } from '../shapes';
import { SceneGraphSelector, SceneGraphSelectorFactory } from './SceneGraphSelector';
import { Element } from '../dom/Element';

export function sortByZIndex(o1: Element, o2: Element) {
  const zIndex1 = Number(o1.style.zIndex);
  const zIndex2 = Number(o2.style.zIndex);
  if (zIndex1 === zIndex2) {
    const parent = o1.parentNode;
    if (parent) {
      const children = parent.childNodes || [];
      return children.indexOf(o1) - children.indexOf(o2);
    }
  }
  return zIndex1 - zIndex2;
}

export enum SCENE_GRAPH_EVENT {
  AABBChanged = 'AABBChanged',
}

export const SceneGraphService = 'SceneGraphService';
export interface SceneGraphService {
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
   */
  matches<T extends Element>(query: string, root: T): boolean;
  querySelector<T extends Element>(query: string, root: T): T | null;
  querySelectorAll<T extends Element>(query: string, root: T): T[];
  attach<T extends Element>(child: T, parent: T, index?: number): void;
  detach<T extends Element>(child: T): void;
  sort<T extends Element>(object1: T, object2: T): number;
  getOrigin<T extends Element>(element: T): vec3;
  setOrigin<T extends Element>(element: T, origin: vec3 | number, y?: number, z?: number): void;
  setPosition<T extends Element>(element: T, position: vec3 | vec2): void;
  setLocalPosition<T extends Element>(element: T, position: vec3 | vec2): void;
  scaleLocal<T extends Element>(element: T, scaling: vec3 | vec2): void;
  setLocalScale<T extends Element>(element: T, scaling: vec3 | vec2): void;
  getLocalScale<T extends Element>(element: T): vec3;
  getScale<T extends Element>(element: T): vec3;
  translate<T extends Element>(
    element: T,
    translation: vec3 | number,
    y?: number,
    z?: number,
  ): void;
  translateLocal<T extends Element>(
    element: T,
    translation: vec3 | number,
    y?: number,
    z?: number,
  ): void;
  getPosition<T extends Element>(element: T): vec3;
  getLocalPosition<T extends Element>(element: T): vec3;
  setEulerAngles<T extends Element>(
    element: T,
    degrees: vec3 | number,
    y?: number,
    z?: number,
  ): void;
  setLocalEulerAngles<T extends Element>(
    element: T,
    degrees: vec3 | number,
    y?: number,
    z?: number,
  ): void;
  rotateLocal<T extends Element>(element: T, degrees: vec3 | number, y?: number, z?: number): void;
  rotate<T extends Element>(element: T, degrees: vec3 | number, y?: number, z?: number): void;
  getRotation<T extends Element>(element: T): quat;
  getLocalRotation<T extends Element>(element: T): quat;
  getWorldTransform<T extends Element>(element: T, transform?: Transform): mat4;
  getLocalTransform<T extends Element>(element: T, transform?: Transform): mat4;
  getBounds<T extends Element>(element: T): AABB | null;
  getLocalBounds<T extends Element>(element: T): AABB | null;
  getGeometryBounds<T extends Element>(element: T): AABB | null;
  on(event: string, fn: (...args: any[]) => void, context?: any): this;
  off(event: string, fn: (...args: any[]) => void, context?: any): this;

  dirtifyAABBToRoot<T extends Element>(element: T): void;
}

/**
 * update transform in scene graph
 *
 * @see https://community.khronos.org/t/scene-graphs/50542/7
 */
@injectable()
export class DefaultSceneGraphService extends EventEmitter implements SceneGraphService {
  @inject(SceneGraphSelectorFactory)
  private sceneGraphSelectorFactory: () => SceneGraphSelector;

  matches(query: string, root: Element) {
    return this.sceneGraphSelectorFactory().is(query, root);
  }

  querySelector<T extends Element>(query: string, root: T) {
    return this.sceneGraphSelectorFactory().selectOne(query, root);
  }

  querySelectorAll<T extends Element>(query: string, root: T) {
    return this.sceneGraphSelectorFactory().selectAll(query, root);
    // .filter((node) => !node.shadow);
  }

  attach<T extends Element>(child: T, parent: T, index?: number) {
    if (child.parentNode) {
      this.detach(child);
    }

    const entity = child.getEntity();
    child.parentNode = parent;
    if (!isNil(index)) {
      child.parentNode.childNodes.splice(index!, 0, child);
    } else {
      child.parentNode.childNodes.push(child);
    }

    // parent needs re-sort
    const sortable = parent.getEntity().getComponent(Sortable);
    if (sortable) {
      sortable.dirty = true;
    }

    const transform = entity.getComponent(Transform);
    if (transform) {
      this.dirtifyWorld(child, transform);
    }
  }

  detach(child: Element) {
    if (child.parentNode) {
      const entity = child.getEntity();

      const transform = entity.getComponent(Transform);
      if (transform) {
        const worldTransform = this.getWorldTransform(child, transform);
        mat4.getScaling(transform.localScale, worldTransform);
        mat4.getTranslation(transform.localPosition, worldTransform);
        mat4.getRotation(transform.localRotation, worldTransform);
        transform.localDirtyFlag = true;
      }

      // parent needs re-sort
      const sortable = child.parentNode.getEntity().getComponent(Sortable);
      if (sortable) {
        sortable.dirty = true;
      }

      const index = child.parentNode.childNodes.indexOf(child);
      if (index > -1) {
        child.parentNode.childNodes.splice(index, 1);
      }

      if (transform) {
        this.dirtifyWorld(child, transform);
      }
      child.parentNode = null;
    }
  }

  /**
   * compare two display objects by hierarchy-index and z-index
   *
   * use materialized path
   * @see https://stackoverflow.com/questions/31470730/comparing-tree-nodes
   */
  sort = (object1: Element, object2: Element): number => {
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
        parentSortable.sorted = [...parent.childNodes];
      }
      if (parentSortable.dirty) {
        parentSortable.sorted = [...parent.childNodes].sort(sortByZIndex);
        parentSortable.dirty = false;
      }

      return parentSortable.sorted.indexOf(o1) - parentSortable.sorted.indexOf(o2);
    }

    return -1;
  };

  private getDepth(element: Element) {
    let o: Element = element;
    let depth = 0;
    while (o) {
      o = o.parentNode!;
      depth++;
    }
    return depth;
  }

  getOrigin(element: Element) {
    return element.getEntity().getComponent(Transform).origin;
  }

  setOrigin(element: Element, origin: vec3 | number, y = 0, z = 0) {
    if (typeof origin === 'number') {
      origin = vec3.fromValues(origin, y, z);
    }
    const transform = element.getEntity().getComponent(Transform);
    if (vec3.equals(origin, transform.origin)) {
      return;
    }

    const originVec = transform.origin;
    originVec[0] = origin[0];
    originVec[1] = origin[1];
    originVec[2] = origin[2] || 0;
    this.dirtifyLocal(element, transform);
  }

  /**
   * rotate in world space
   */
  rotate = (() => {
    const parentInvertRotation = quat.create();
    return (element: Element, degrees: vec3 | number, y = 0, z = 0) => {
      if (typeof degrees === 'number') {
        degrees = vec3.fromValues(degrees, y, z);
      }

      const transform = element.getEntity().getComponent(Transform);

      if (element.parentNode === null) {
        this.rotateLocal(element, degrees);
      } else {
        const rotation = quat.create();
        quat.fromEuler(rotation, degrees[0], degrees[1], degrees[2]);
        const rot = this.getRotation(element);
        const parentRot = this.getRotation(element.parentNode);

        quat.copy(parentInvertRotation, parentRot);
        quat.invert(parentInvertRotation, parentInvertRotation);
        quat.multiply(parentInvertRotation, parentInvertRotation, rotation);
        quat.multiply(transform.localRotation, rotation, rot);
        quat.normalize(transform.localRotation, transform.localRotation);

        if (!transform.localDirtyFlag) {
          this.dirtifyLocal(element, transform);
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
    return (element: Element, degrees: vec3 | number, y = 0, z = 0) => {
      if (typeof degrees === 'number') {
        degrees = vec3.fromValues(degrees, y, z);
      }
      const transform = element.getEntity().getComponent(Transform);
      quat.fromEuler(rotation, degrees[0], degrees[1], degrees[2]);
      quat.mul(transform.localRotation, transform.localRotation, rotation);

      if (!transform.localDirtyFlag) {
        this.dirtifyLocal(element, transform);
      }
    };
  })();

  /**
   * set euler angles(degrees) in world space
   */
  setEulerAngles = (() => {
    const invParentRot = quat.create();

    return (element: Element, degrees: vec3 | number, y = 0, z = 0) => {
      if (typeof degrees === 'number') {
        degrees = vec3.fromValues(degrees, y, z);
      }

      const transform = element.getEntity().getComponent(Transform);

      if (element.parentNode === null) {
        this.setLocalEulerAngles(element, degrees);
      } else {
        quat.fromEuler(transform.localRotation, degrees[0], degrees[1], degrees[2]);
        const parentRotation = this.getRotation(element.parentNode);
        quat.copy(invParentRot, quat.invert(quat.create(), parentRotation));
        quat.mul(transform.localRotation, transform.localRotation, invParentRot);

        this.dirtifyLocal(element, transform);
      }
    };
  })();

  /**
   * set euler angles(degrees) in local space
   */
  setLocalEulerAngles(element: Element, degrees: vec3 | number, y = 0, z = 0) {
    if (typeof degrees === 'number') {
      degrees = vec3.fromValues(degrees, y, z);
    }
    const transform = element.getEntity().getComponent(Transform);
    quat.fromEuler(transform.localRotation, degrees[0], degrees[1], degrees[2]);
    this.dirtifyLocal(element, transform);
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
    return (element: Element, translation: vec3 | number, y: number = 0, z: number = 0) => {
      if (typeof translation === 'number') {
        translation = vec3.fromValues(translation, y, z);
      }
      const transform = element.getEntity().getComponent(Transform);
      if (vec3.equals(translation, vec3.create())) {
        return;
      }
      vec3.transformQuat(translation, translation, transform.localRotation);
      vec3.add(transform.localPosition, transform.localPosition, translation);

      this.dirtifyLocal(element, transform);
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

    return (element: Element, position: vec3 | vec2) => {
      const transform = element.getEntity().getComponent(Transform);
      position = vec3.fromValues(position[0], position[1], position[2] || transform.position[2]);

      if (vec3.equals(transform.position, position)) {
        return;
      }

      transform.position = position;

      if (element.parentNode === null) {
        vec3.copy(transform.localPosition, position);
      } else {
        const parentTransform = element.parentNode.getEntity().getComponent(Transform);
        mat4.copy(parentInvertMatrix, parentTransform.worldTransform);
        mat4.invert(parentInvertMatrix, parentInvertMatrix);
        vec3.transformMat4(transform.localPosition, position, parentInvertMatrix);
        this.dirtifyLocal(element, transform);
      }

      if (!transform.localDirtyFlag) {
        this.dirtifyLocal(element, transform);
      }
    };
  })();

  /**
   * move to position in local space
   */
  setLocalPosition(element: Element, position: vec3 | vec2) {
    const transform = element.getEntity().getComponent(Transform);
    position = vec3.fromValues(position[0], position[1], position[2] || transform.localPosition[2]);
    if (vec3.equals(transform.localPosition, position)) {
      return;
    }
    vec3.copy(transform.localPosition, position);
    if (!transform.localDirtyFlag) {
      this.dirtifyLocal(element, transform);
    }
  }

  /**
   * scale in local space
   */
  scaleLocal(element: Element, scaling: vec3 | vec2) {
    const transform = element.getEntity().getComponent(Transform);
    vec3.multiply(
      transform.localScale,
      transform.localScale,
      vec3.fromValues(scaling[0], scaling[1], scaling[2] || 1),
    );
    this.dirtifyLocal(element, transform);
  }

  setLocalScale(element: Element, scaling: vec3 | vec2) {
    const transform = element.getEntity().getComponent(Transform);
    const updatedScaling = vec3.fromValues(
      scaling[0],
      scaling[1],
      scaling[2] || transform.localScale[2],
    );

    if (vec3.equals(updatedScaling, transform.localScale)) {
      return;
    }

    vec3.copy(transform.localScale, updatedScaling);
    this.dirtifyLocal(element, transform);
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

    return (element: Element, translation: vec3 | number, y: number = 0, z: number = 0) => {
      if (typeof translation === 'number') {
        translation = vec3.fromValues(translation, y, z);
      }
      if (vec3.equals(translation, vec3.create())) {
        return;
      }

      vec3.add(tr, this.getPosition(element), translation);

      this.setPosition(element, tr);
    };
  })();

  dirtifyLocal(element: Element, transform: Transform) {
    if (!transform.localDirtyFlag) {
      transform.localDirtyFlag = true;
      if (!transform.dirtyFlag) {
        this.dirtifyWorld(element, transform);
      }
    }
  }

  dirtifyWorld(element: Element, transform: Transform) {
    this.dirtifyWorldInternal(element, transform);
  }

  getPosition(element: Element) {
    const transform = element.getEntity().getComponent(Transform);
    return mat4.getTranslation(transform.position, this.getWorldTransform(element, transform));
  }

  getRotation(element: Element) {
    const transform = element.getEntity().getComponent(Transform);
    return mat4.getRotation(transform.rotation, this.getWorldTransform(element, transform));
  }

  getScale(element: Element) {
    const transform = element.getEntity().getComponent(Transform);
    return mat4.getScaling(transform.scaling, this.getWorldTransform(element, transform));
  }

  getWorldTransform(
    element: Element,
    transform: Transform = element.getEntity().getComponent(Transform),
  ) {
    if (!transform.localDirtyFlag && !transform.dirtyFlag) {
      return transform.worldTransform;
    }

    if (element.parentNode) {
      this.getWorldTransform(element.parentNode);
    }

    this.updateTransform(element, transform);

    return transform.worldTransform;
  }

  getLocalPosition(element: Element) {
    return element.getEntity().getComponent(Transform).localPosition;
  }

  getLocalRotation(element: Element) {
    return element.getEntity().getComponent(Transform).localRotation;
  }

  getLocalScale(element: Element) {
    return element.getEntity().getComponent(Transform).localScale;
  }

  getLocalTransform(element: Element) {
    const transform = element.getEntity().getComponent(Transform);
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

  /**
   * account for children in local space
   */
  getLocalBounds(element: Element): AABB | null {
    if (element.parentNode) {
      const parentInvert = mat4.invert(mat4.create(), this.getWorldTransform(element.parentNode));
      const bounds = this.getBounds(element);

      if (bounds) {
        const localBounds = new AABB();
        localBounds.setFromTransformedAABB(bounds, parentInvert);
        return localBounds;
      }
    }

    return this.getBounds(element);
  }

  /**
   * won't account for children
   */
  getGeometryBounds(element: Element): AABB | null {
    const entity = element.getEntity();
    let geometryAABB = entity.getComponent(Geometry).aabb;
    let aabb = null;
    if (geometryAABB) {
      aabb = new AABB();
      // apply transformation to aabb
      aabb.setFromTransformedAABB(geometryAABB, this.getWorldTransform(element));
    }
    return aabb;
  }

  /**
   * account for children in world space
   */
  getBounds(element: Element): AABB | null {
    const entity = element.getEntity();
    const renderable = entity.getComponent(Renderable);
    if (!renderable.aabbDirty && renderable.aabb) {
      return renderable.aabb;
    }

    // reset with geometry's aabb
    let aabb = this.getGeometryBounds(element);
    // merge children's aabbs
    const children = element.childNodes;
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

    // account for clip path
    if (element.style.clipPath) {
      const clipPathBounds = this.getGeometryBounds(element.style.clipPath);
      if (clipPathBounds) {
        // intersect with original geometry
        clipPathBounds.setFromTransformedAABB(clipPathBounds, this.getWorldTransform(element));
      }
      if (!aabb) {
        aabb = clipPathBounds;
      } else if (clipPathBounds) {
        aabb = clipPathBounds.intersection(aabb);
      }
    }

    if (aabb) {
      renderable.aabb = aabb;
    }
    renderable.aabbDirty = false;
    this.emit(SCENE_GRAPH_EVENT.AABBChanged, element);

    return renderable.aabb || null;
  }

  dirtifyAABBToRoot(element: Element) {
    let p: Element | null = element;
    while (p) {
      const renderable = p.getEntity().getComponent(Renderable);
      if (renderable) {
        renderable.aabbDirty = true;
        renderable.dirty = true;
        this.emit(SCENE_GRAPH_EVENT.AABBChanged, p);
      }
      p = p.parentNode;
    }
  }

  private dirtifyWorldInternal(element: Element, transform: Transform) {
    if (!transform.dirtyFlag) {
      transform.dirtyFlag = true;
      element.childNodes.forEach((child) => {
        const childTransform = child.getEntity().getComponent(Transform);
        if (!childTransform.dirtyFlag) {
          this.dirtifyWorldInternal(child, childTransform);
        }
      });

      // bubble up to root
      this.dirtifyAABBToRoot(element);
    }
  }

  private updateTransform(element: Element, transform: Transform) {
    if (transform.localDirtyFlag) {
      this.getLocalTransform(element);
    }
    if (transform.dirtyFlag) {
      const parent = element.parentNode;
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
