import { inject, singleton } from 'mana-syringe';
import { isNil } from '@antv/util';
import type { Transform } from '../components';
import type { vec2 } from 'gl-matrix';
import { mat4, quat, vec3 } from 'gl-matrix';
import { AABB, Rectangle } from '../shapes';
import type { SceneGraphSelector } from './SceneGraphSelector';
import { SceneGraphSelectorFactory } from './SceneGraphSelector';
import type { IChildNode, IElement, INode, IParentNode } from '../dom/interfaces';
import { ElementEvent } from '../dom/interfaces';
import type { Element } from '../dom';
import { MutationEvent } from '../dom/MutationEvent';

export function sortByZIndex(o1: IElement, o2: IElement) {
  const zIndex1 = Number(o1.style.zIndex);
  const zIndex2 = Number(o2.style.zIndex);
  if (zIndex1 === zIndex2) {
    // return o1.entity.getComponent(Sortable).lastSortedIndex - o2.entity.getComponent(Sortable).lastSortedIndex;
    const parent = o1.parentNode;
    if (parent) {
      const children = parent.childNodes || [];
      return children.indexOf(o1) - children.indexOf(o2);
    }
  }
  return zIndex1 - zIndex2;
}

export function dirtifyToRoot(element: INode, affectChildren = false) {
  let p = element;
  while (p) {
    const renderable = (p as Element).renderable;
    if (renderable) {
      renderable.renderBoundsDirty = true;
      renderable.boundsDirty = true;
      renderable.dirty = true;
    }
    p = p.parentNode;
  }

  element.emit(ElementEvent.BOUNDS_CHANGED, { affectChildren });
}

export const SceneGraphService = 'SceneGraphService';
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface SceneGraphService {
  matches: <T extends IElement>(query: string, root: T) => boolean;
  querySelector: <R extends IElement, T extends IElement>(query: string, root: R) => T | null;
  querySelectorAll: <R extends IElement, T extends IElement>(query: string, root: R) => T[];
  attach: <C extends INode, P extends INode & IParentNode>(
    child: C,
    parent: P,
    index?: number,
  ) => void;
  detach: <C extends INode>(child: C) => void;
  getOrigin: (element: INode) => vec3;
  setOrigin: (element: INode, origin: vec3 | number, y?: number, z?: number) => void;
  setPosition: (element: INode, position: vec3 | vec2) => void;
  setLocalPosition: (element: INode, position: vec3 | vec2) => void;
  scaleLocal: (element: INode, scaling: vec3 | vec2) => void;
  setLocalScale: (element: INode, scaling: vec3 | vec2) => void;
  getLocalScale: (element: INode) => vec3;
  getScale: (element: INode) => vec3;
  translate: (element: INode, translation: vec3 | number, y?: number, z?: number) => void;
  translateLocal: (element: INode, translation: vec3 | number, y?: number, z?: number) => void;
  getPosition: (element: INode) => vec3;
  getLocalPosition: (element: INode) => vec3;
  setEulerAngles: (element: INode, degrees: vec3 | number, y?: number, z?: number) => void;
  setLocalEulerAngles: (element: INode, degrees: vec3 | number, y?: number, z?: number) => void;
  rotateLocal: (element: INode, degrees: vec3 | number, y?: number, z?: number) => void;
  rotate: (element: INode, degrees: vec3 | number, y?: number, z?: number) => void;
  getRotation: (element: INode) => quat;
  setRotation: (
    element: INode,
    rotation: quat | number,
    y?: number,
    z?: number,
    w?: number,
  ) => void;
  setLocalRotation: (
    element: INode,
    rotation: quat | number,
    y?: number,
    z?: number,
    w?: number,
  ) => void;
  getLocalRotation: (element: INode) => quat;
  getWorldTransform: (element: INode, transform?: Transform) => mat4;
  getLocalTransform: (element: INode, transform?: Transform) => mat4;
  resetLocalTransform: (element: INode) => void;
  getBounds: (element: INode, render?: boolean) => AABB;
  getLocalBounds: (element: INode, render?: boolean) => AABB;
  getGeometryBounds: (element: INode, render?: boolean) => AABB;
  getBoundingClientRect: (element: INode) => Rectangle;
  syncHierarchy: (element: INode) => void;
}

/**
 * update transform in scene graph
 *
 * @see https://community.khronos.org/t/scene-graphs/50542/7
 */
@singleton()
export class DefaultSceneGraphService implements SceneGraphService {
  @inject(SceneGraphSelectorFactory)
  private sceneGraphSelectorFactory: () => SceneGraphSelector;

  matches<T extends IElement>(query: string, root: T) {
    return this.sceneGraphSelectorFactory().is(query, root);
  }

  querySelector<R extends IElement, T extends IElement>(query: string, root: R): T | null {
    return this.sceneGraphSelectorFactory().selectOne<R, T>(query, root);
  }

  querySelectorAll<R extends IElement, T extends IElement>(query: string, root: R): T[] {
    return this.sceneGraphSelectorFactory().selectAll<R, T>(query, root);
    // .filter((node) => !node.shadow);
  }

  attach<C extends INode, P extends INode & IParentNode>(child: C, parent: P, index?: number) {
    if (child.parentNode) {
      this.detach(child);
    }

    child.parentNode = parent;
    if (!isNil(index)) {
      child.parentNode.childNodes.splice(index, 0, child as unknown as INode & IChildNode);
    } else {
      child.parentNode.childNodes.push(child as unknown as INode & IChildNode);
    }

    // parent needs re-sort
    const sortable = (parent as unknown as Element).sortable;
    if (sortable) {
      sortable.dirty = true;
    }

    // this.updateGraphDepth(child);

    const transform = (child as unknown as Element).transformable;
    if (transform) {
      this.dirtifyWorld(child, transform);
    }

    if (transform.frozen) {
      this.unfreezeParentToRoot(child);
    }
  }

  detach<C extends INode>(child: C) {
    if (child.parentNode) {
      const transform = (child as unknown as Element).transformable;
      // if (transform) {
      //   const worldTransform = this.getWorldTransform(child, transform);
      //   mat4.getScaling(transform.localScale, worldTransform);
      //   mat4.getTranslation(transform.localPosition, worldTransform);
      //   mat4.getRotation(transform.localRotation, worldTransform);
      //   transform.localDirtyFlag = true;
      // }

      // parent needs re-sort
      const sortable = (child.parentNode as Element).sortable;
      if (sortable) {
        sortable.dirty = true;
      }

      const index = child.parentNode.childNodes.indexOf(child as unknown as IChildNode & INode);
      if (index > -1) {
        child.parentNode.childNodes.splice(index, 1);
      }

      if (transform) {
        this.dirtifyWorld(child, transform);
      }
      child.parentNode = null;
    }
  }

  getOrigin(element: INode) {
    return (element as Element).transformable.origin;
  }

  setOrigin(element: INode, origin: vec3 | number, y = 0, z = 0) {
    if (typeof origin === 'number') {
      origin = vec3.fromValues(origin, y, z);
    }
    const transform = (element as Element).transformable;
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
    return (element: INode, degrees: vec3 | number, y = 0, z = 0) => {
      if (typeof degrees === 'number') {
        degrees = vec3.fromValues(degrees, y, z);
      }

      const transform = (element as Element).transformable;

      if (element.parentNode === null || !(element.parentNode as Element).transformable) {
        this.rotateLocal(element, degrees);
      } else {
        const rotation = quat.create();
        quat.fromEuler(rotation, degrees[0], degrees[1], degrees[2]);
        const rot = this.getRotation(element);
        const parentRot = this.getRotation(element.parentNode);

        quat.copy(parentInvertRotation, parentRot);
        quat.invert(parentInvertRotation, parentInvertRotation);
        quat.multiply(rotation, parentInvertRotation, rotation);
        quat.multiply(transform.localRotation, rotation, rot);
        quat.normalize(transform.localRotation, transform.localRotation);

        this.dirtifyLocal(element, transform);
      }
    };
  })();

  /**
   * rotate in local space
   * @see @see https://docs.microsoft.com/en-us/windows/win32/api/directxmath/nf-directxmath-xmquaternionrotationrollpitchyaw
   */
  rotateLocal = (() => {
    const rotation = quat.create();
    return (element: INode, degrees: vec3 | number, y = 0, z = 0) => {
      if (typeof degrees === 'number') {
        degrees = vec3.fromValues(degrees, y, z);
      }
      const transform = (element as Element).transformable;
      quat.fromEuler(rotation, degrees[0], degrees[1], degrees[2]);
      quat.mul(transform.localRotation, transform.localRotation, rotation);

      this.dirtifyLocal(element, transform);
    };
  })();

  /**
   * set euler angles(degrees) in world space
   */
  setEulerAngles = (() => {
    const invParentRot = quat.create();

    return (element: INode, degrees: vec3 | number, y = 0, z = 0) => {
      if (typeof degrees === 'number') {
        degrees = vec3.fromValues(degrees, y, z);
      }

      const transform = (element as Element).transformable;

      if (element.parentNode === null || !(element.parentNode as Element).transformable) {
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
  setLocalEulerAngles(element: INode, degrees: vec3 | number, y = 0, z = 0) {
    if (typeof degrees === 'number') {
      degrees = vec3.fromValues(degrees, y, z);
    }
    const transform = (element as Element).transformable;
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
    return (element: INode, translation: vec3 | number, y: number = 0, z: number = 0) => {
      if (typeof translation === 'number') {
        translation = vec3.fromValues(translation, y, z);
      }
      const transform = (element as Element).transformable;
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

    return (element: INode, position: vec3 | vec2) => {
      const transform = (element as Element).transformable;
      position = vec3.fromValues(position[0], position[1], position[2] || transform.position[2]);

      if (vec3.equals(this.getPosition(element), position)) {
        return;
      }

      transform.position = position;

      if (element.parentNode === null || !(element.parentNode as Element).transformable) {
        vec3.copy(transform.localPosition, position);
      } else {
        const parentTransform = (element.parentNode as Element).transformable;
        mat4.copy(parentInvertMatrix, parentTransform.worldTransform);
        mat4.invert(parentInvertMatrix, parentInvertMatrix);
        vec3.transformMat4(transform.localPosition, position, parentInvertMatrix);
      }

      this.dirtifyLocal(element, transform);
    };
  })();

  /**
   * move to position in local space
   */
  setLocalPosition(element: INode, position: vec3 | vec2) {
    const transform = (element as Element).transformable;
    position = vec3.fromValues(position[0], position[1], position[2] || transform.localPosition[2]);
    if (vec3.equals(transform.localPosition, position)) {
      return;
    }
    vec3.copy(transform.localPosition, position);
    this.dirtifyLocal(element, transform);
  }

  /**
   * scale in local space
   */
  scaleLocal(element: INode, scaling: vec3 | vec2) {
    const transform = (element as Element).transformable;
    vec3.multiply(
      transform.localScale,
      transform.localScale,
      vec3.fromValues(scaling[0], scaling[1], scaling[2] || 1),
    );
    this.dirtifyLocal(element, transform);
  }

  setLocalScale(element: INode, scaling: vec3 | vec2) {
    const transform = (element as Element).transformable;
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

    return (element: INode, translation: vec3 | number, y: number = 0, z: number = 0) => {
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

  setRotation = () => {
    const parentInvertRotation = quat.create();
    return (element: INode, rotation: quat | number, y?: number, z?: number, w?: number) => {
      const transform = (element as Element).transformable;
      if (typeof rotation === 'number') {
        rotation = quat.fromValues(rotation, y, z, w);
      }

      if (element.parentNode === null || !(element.parentNode as Element).transformable) {
        this.setLocalRotation(element, rotation);
      } else {
        const parentRot = this.getRotation(element.parentNode);

        quat.copy(parentInvertRotation, parentRot);
        quat.invert(parentInvertRotation, parentInvertRotation);
        quat.multiply(transform.localRotation, parentInvertRotation, rotation);
        quat.normalize(transform.localRotation, transform.localRotation);

        this.dirtifyLocal(element, transform);
      }
    };
  };

  setLocalRotation(element: INode, rotation: quat | number, y?: number, z?: number, w?: number) {
    if (typeof rotation === 'number') {
      rotation = quat.fromValues(rotation, y, z, w);
    }
    const transform = (element as Element).transformable;
    quat.copy(transform.localRotation, rotation);
    this.dirtifyLocal(element, transform);
  }

  dirtifyLocal(element: INode, transform: Transform) {
    if (!transform.localDirtyFlag) {
      transform.localDirtyFlag = true;
      if (!transform.dirtyFlag) {
        this.dirtifyWorld(element, transform);
      }
    }
  }

  dirtifyWorld(element: INode, transform: Transform) {
    if (!transform.dirtyFlag) {
      this.unfreezeParentToRoot(element);
    }

    this.dirtifyWorldInternal(element, transform);
    dirtifyToRoot(element, true);
  }

  getPosition(element: INode) {
    const transform = (element as Element).transformable;
    return mat4.getTranslation(transform.position, this.getWorldTransform(element, transform));
  }

  getRotation(element: INode) {
    const transform = (element as Element).transformable;
    return mat4.getRotation(transform.rotation, this.getWorldTransform(element, transform));
  }

  getScale(element: INode) {
    const transform = (element as Element).transformable;
    return mat4.getScaling(transform.scaling, this.getWorldTransform(element, transform));
  }

  getWorldTransform(element: INode, transform: Transform = (element as Element).transformable) {
    if (!transform.localDirtyFlag && !transform.dirtyFlag) {
      return transform.worldTransform;
    }

    if (element.parentNode && (element.parentNode as Element).transformable) {
      this.getWorldTransform(element.parentNode);
    }

    this.sync(element, transform);

    return transform.worldTransform;
  }

  getLocalPosition(element: INode) {
    return (element as Element).transformable.localPosition;
  }

  getLocalRotation(element: INode) {
    return (element as Element).transformable.localRotation;
  }

  getLocalScale(element: INode) {
    return (element as Element).transformable.localScale;
  }

  getLocalTransform(element: INode) {
    const transform = (element as Element).transformable;
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

  resetLocalTransform(element: INode) {
    this.setLocalScale(element, [1, 1, 1]);
    this.setLocalPosition(element, [0, 0, 0]);
    this.setLocalEulerAngles(element, [0, 0, 0]);
  }

  private getTransformedGeometryBounds(element: INode, render = false): AABB | null {
    const bounds = this.getGeometryBounds(element, render);
    if (!AABB.isEmpty(bounds)) {
      const aabb = new AABB();
      aabb.setFromTransformedAABB(bounds, this.getWorldTransform(element));
      return aabb;
    } else {
      return null;
    }
  }

  /**
   * won't account for children
   */
  getGeometryBounds(element: INode, render = false): AABB {
    const geometry = (element as Element).geometry;
    const bounds = render ? geometry.renderBounds : geometry.contentBounds || null;
    return (bounds && new AABB(bounds.center, bounds.halfExtents)) || new AABB();
  }

  /**
   * account for children in world space
   */
  getBounds(element: INode, render = false): AABB {
    const renderable = (element as Element).renderable;

    if (!renderable.boundsDirty && !render && renderable.bounds) {
      return renderable.bounds;
    }

    if (!renderable.renderBoundsDirty && render && renderable.renderBounds) {
      return renderable.renderBounds;
    }

    // reset with geometry's aabb
    let aabb: AABB = this.getTransformedGeometryBounds(element, render);

    // merge children's aabbs
    const children = element.childNodes as IElement[];
    children.forEach((child) => {
      const childBounds = this.getBounds(child, render);
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
    const clipPath = (element as IElement).style.clipPath;
    if (clipPath) {
      const clipPathBounds = this.getTransformedGeometryBounds(clipPath, true);
      let transformParentBounds: AABB;

      if (clipPathBounds) {
        transformParentBounds = new AABB();
        // intersect with original geometry
        transformParentBounds.setFromTransformedAABB(
          clipPathBounds,
          this.getWorldTransform(element),
        );
      }
      if (!aabb) {
        aabb = transformParentBounds;
      } else if (transformParentBounds) {
        aabb = transformParentBounds.intersection(aabb);
      }
    }

    if (aabb) {
      if (render) {
        renderable.renderBounds = aabb;
      } else {
        renderable.bounds = aabb;
      }
    }

    if (render) {
      renderable.renderBoundsDirty = false;
    } else {
      renderable.boundsDirty = false;
    }

    return aabb || new AABB();
  }

  /**
   * account for children in local space
   */
  getLocalBounds(element: INode): AABB {
    if (element.parentNode) {
      let parentInvert = mat4.create();
      if ((element.parentNode as Element).transformable) {
        parentInvert = mat4.invert(mat4.create(), this.getWorldTransform(element.parentNode));
      }

      const bounds = this.getBounds(element);

      if (!AABB.isEmpty(bounds)) {
        const localBounds = new AABB();
        localBounds.setFromTransformedAABB(bounds, parentInvert);
        return localBounds;
      }
    }

    return this.getBounds(element);
  }

  getBoundingClientRect(element: INode): Rectangle {
    let aabb: AABB;
    const bounds = this.getGeometryBounds(element);
    if (!AABB.isEmpty(bounds)) {
      aabb = new AABB();
      // apply transformation to aabb
      aabb.setFromTransformedAABB(bounds, this.getWorldTransform(element));
    }

    // calc context's offset
    const bbox = element.ownerDocument?.defaultView?.getContextService().getBoundingClientRect();

    if (aabb) {
      const [left, top] = aabb.getMin();
      const [right, bottom] = aabb.getMax();

      return new Rectangle(
        left + (bbox?.left || 0),
        top + (bbox?.top || 0),
        right - left,
        bottom - top,
      );
    }

    return new Rectangle(bbox?.left || 0, bbox?.top || 0, 0, 0);
  }

  private dirtifyWorldInternal(element: INode, transform: Transform) {
    if (!transform.dirtyFlag) {
      transform.dirtyFlag = true;
      transform.frozen = false;
      element.childNodes.forEach((child) => {
        const childTransform = (child as Element).transformable;
        if (!childTransform.dirtyFlag) {
          this.dirtifyWorldInternal(child as IElement, childTransform);
        }
      });

      const renderable = (element as Element).renderable;
      if (renderable) {
        renderable.renderBoundsDirty = true;
        renderable.boundsDirty = true;
        renderable.dirty = true;
      }

      // model matrix changed
      // element.emit(ElementEvent.ATTR_MODIFIED, {
      //   attributeName: 'modelMatrix',
      //   oldValue: null,
      //   newValue: null,
      // });

      element.dispatchEvent(
        new MutationEvent(
          ElementEvent.ATTR_MODIFIED,
          element as IElement,
          null,
          null,
          'modelMatrix',
          MutationEvent.MODIFICATION,
          null,
          null,
        ),
      );
    }
  }

  syncHierarchy(element: INode) {
    const transform = (element as Element).transformable;
    if (transform.frozen) {
      return;
    }
    transform.frozen = true;

    if (transform.localDirtyFlag || transform.dirtyFlag) {
      this.sync(element, transform);
    }

    const children = element.childNodes;
    for (let i = 0; i < children.length; i++) {
      this.syncHierarchy(children[i]);
    }
  }

  private sync(element: INode, transform: Transform) {
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

    if (transform.dirtyFlag) {
      const parent = element.parentNode;
      const parentTransform = parent && (parent as Element).transformable;
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

  private unfreezeParentToRoot(child: INode) {
    let p = child.parentNode;
    while (p) {
      const transform = (p as Element).transformable;
      if (transform) {
        transform.frozen = false;
      }
      p = p.parentNode;
    }
  }
}
