import { isNumber } from '@antv/util';
import { mat4, quat, vec2, vec3 } from 'gl-matrix';
import { SortReason, Transform } from '../components';
import type { CustomElement, DisplayObject } from '../display-objects';
import type { Element, IChildNode, IElement, INode, IParentNode } from '../dom';
import { CustomEvent } from '../dom/CustomEvent';
import { ElementEvent } from '../dom/interfaces';
import { MutationEvent } from '../dom/MutationEvent';
import { GlobalRuntime, runtime } from '../global-runtime';
import { AABB, Rectangle } from '../shapes';
import { Shape } from '../types';
import { findClosestClipPathTarget, isInFragment } from '../utils';
import type { SceneGraphService } from './interfaces';

function markRenderableDirty(e: Element) {
  const { renderable } = e;
  if (renderable) {
    renderable.renderBoundsDirty = true;
    renderable.boundsDirty = true;
  }
}

const reparentEvent = new MutationEvent(
  ElementEvent.REPARENT,
  null,
  '',
  '',
  '',
  0,
  '',
  '',
);

// Object pooling
/** do not modify this objects */
const $vec2Zero = vec2.create();
/** do not modify this objects */
const $vec3Zero = vec3.create();
/** do not modify this objects */
const $vec3One = vec3.fromValues(1, 1, 1);
/** do not modify this objects */
const $mat4Identity = mat4.create();

/** shared objects */
const $vec2 = vec2.create();
/** shared objects */
const $vec3 = vec3.create();
/** shared objects */
const $mat4 = mat4.create();
/** shared objects */
const $quat = quat.create();

const $setLocalTransform_1 = vec3.create();
const $setLocalTransform_2 = quat.create();
const $setLocalTransform_3 = vec3.create();
const $setLocalPosition = vec3.create();
const $setPosition_1 = vec3.create();
const $setPosition_ParentInvertMatrix = mat4.create();
const $setEulerAngles_InvParentRot = quat.create();
const $rotateLocal = quat.create();
const $rotate_ParentInvertRotation = quat.create();

const $triggerPendingEvents_detail = { affectChildren: true };

/**
 * update transform in scene graph
 *
 * @see https://community.khronos.org/t/scene-graphs/50542/7
 */
export class DefaultSceneGraphService implements SceneGraphService {
  // target -> affectChildren
  private pendingEvents = new Map<DisplayObject, boolean>();
  private boundsChangedEvent = new CustomEvent(ElementEvent.BOUNDS_CHANGED);

  constructor(private runtime: GlobalRuntime) {}

  matches<T extends IElement>(query: string, root: T) {
    return this.runtime.sceneGraphSelector.is(query, root);
  }

  querySelector<R extends IElement, T extends IElement>(
    query: string,
    root: R,
  ): T | null {
    return this.runtime.sceneGraphSelector.selectOne<R, T>(query, root);
  }

  querySelectorAll<R extends IElement, T extends IElement>(
    query: string,
    root: R,
  ): T[] {
    return this.runtime.sceneGraphSelector.selectAll<R, T>(query, root);
    // .filter((node) => !node.shadow);
  }

  attach<C extends INode, P extends INode & IParentNode>(
    child: C,
    parent: P,
    index?: number,
  ) {
    let detached = false;
    if (child.parentNode) {
      detached = child.parentNode !== parent;
      this.detach(child);
    }

    const isChildFragment = child.nodeName === Shape.FRAGMENT;
    const isAttachToFragment = isInFragment(parent);

    child.parentNode = parent;

    const nodes = isChildFragment
      ? (child.childNodes as DisplayObject[])
      : [child];

    if (isNumber(index)) {
      nodes.forEach((node) => {
        parent.childNodes.splice(index, 0, node);
        node.parentNode = parent;
      });
    } else {
      nodes.forEach((node) => {
        parent.childNodes.push(node);
        node.parentNode = parent;
      });
    }

    // parent needs re-sort
    const { sortable } = parent as unknown as Element;
    if (
      sortable?.sorted?.length ||
      (child as unknown as Element).parsedStyle.zIndex
    ) {
      if (sortable.dirtyChildren.indexOf(child) === -1) {
        sortable.dirtyChildren.push(child);
      }
      // if (sortable) {
      // only child has z-Index
      sortable.dirty = true;
      sortable.dirtyReason = SortReason.ADDED;
    }

    if (isAttachToFragment) return;

    if (isChildFragment) this.dirtifyFragment(child);
    else {
      const transform = (child as unknown as Element).transformable;
      if (transform) {
        this.dirtifyWorld(child, transform);
      }
    }

    if (detached) {
      child.dispatchEvent(reparentEvent);
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
      const { sortable } = child.parentNode as Element;
      // if (sortable) {
      if (
        sortable?.sorted?.length ||
        (child as unknown as Element).style?.zIndex
      ) {
        if (sortable.dirtyChildren.indexOf(child) === -1) {
          sortable.dirtyChildren.push(child);
        }
        sortable.dirty = true;
        sortable.dirtyReason = SortReason.REMOVED;
      }

      const index = child.parentNode.childNodes.indexOf(
        child as unknown as IChildNode & INode,
      );
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
    (element as Element).getGeometryBounds();
    return (element as Element).transformable.origin;
  }

  /**
   * same as pivot in Pixi.js
   *
   * @see https://stackoverflow.com/questions/40748452/how-to-change-css-transform-origin-but-preserve-transformation
   */
  setOrigin(element: INode, origin: vec3 | number, y = 0, z = 0) {
    if (typeof origin === 'number') {
      origin = [origin, y, z];
    }
    const transform = (element as Element).transformable;
    if (
      origin[0] === transform.origin[0] &&
      origin[1] === transform.origin[1] &&
      origin[2] === transform.origin[2]
    ) {
      return;
    }

    const originVec = transform.origin;

    // const delta = vec3.subtract(vec3.create(), origin, originVec);
    // vec3.add(transform.localPosition, transform.localPosition, delta);

    // update origin
    originVec[0] = origin[0];
    originVec[1] = origin[1];
    originVec[2] = origin[2] || 0;
    this.dirtifyLocal(element, transform);
  }

  /**
   * rotate in world space
   */
  rotate(element: INode, degrees: vec3 | number, y = 0, z = 0) {
    if (typeof degrees === 'number') {
      degrees = vec3.fromValues(degrees, y, z);
    }

    const transform = (element as Element).transformable;

    if (
      element.parentNode === null ||
      !(element.parentNode as Element).transformable
    ) {
      this.rotateLocal(element, degrees);
    } else {
      const rotation = $quat;
      quat.fromEuler(rotation, degrees[0], degrees[1], degrees[2]);
      const rot = this.getRotation(element);
      const parentRot = this.getRotation(element.parentNode);

      quat.copy($rotate_ParentInvertRotation, parentRot);
      quat.invert($rotate_ParentInvertRotation, $rotate_ParentInvertRotation);
      quat.multiply(rotation, $rotate_ParentInvertRotation, rotation);
      quat.multiply(transform.localRotation, rotation, rot);
      quat.normalize(transform.localRotation, transform.localRotation);

      this.dirtifyLocal(element, transform);
    }
  }

  /**
   * rotate in local space
   * @see @see https://docs.microsoft.com/en-us/windows/win32/api/directxmath/nf-directxmath-xmquaternionrotationrollpitchyaw
   */
  rotateLocal(element: INode, degrees: vec3 | number, y = 0, z = 0) {
    if (typeof degrees === 'number') {
      degrees = vec3.fromValues(degrees, y, z);
    }
    const transform = (element as Element).transformable;
    quat.fromEuler($rotateLocal, degrees[0], degrees[1], degrees[2]);
    quat.mul(transform.localRotation, transform.localRotation, $rotateLocal);

    this.dirtifyLocal(element, transform);
  }

  /**
   * set euler angles(degrees) in world space
   */
  setEulerAngles(element: INode, degrees: vec3 | number, y = 0, z = 0) {
    if (typeof degrees === 'number') {
      degrees = vec3.fromValues(degrees, y, z);
    }

    const transform = (element as Element).transformable;

    if (
      element.parentNode === null ||
      !(element.parentNode as Element).transformable
    ) {
      this.setLocalEulerAngles(element, degrees);
    } else {
      quat.fromEuler(
        transform.localRotation,
        degrees[0],
        degrees[1],
        degrees[2],
      );
      const parentRotation = this.getRotation(element.parentNode);
      quat.copy(
        $setEulerAngles_InvParentRot,
        quat.invert($quat, parentRotation),
      );
      quat.mul(
        transform.localRotation,
        transform.localRotation,
        $setEulerAngles_InvParentRot,
      );

      this.dirtifyLocal(element, transform);
    }
  }

  /**
   * set euler angles(degrees) in local space
   */
  setLocalEulerAngles(
    element: INode,
    degrees: vec3 | number,
    y = 0,
    z = 0,
    dirtify = true,
  ) {
    if (typeof degrees === 'number') {
      degrees = vec3.fromValues(degrees, y, z);
    }
    const transform = (element as Element).transformable;
    quat.fromEuler(transform.localRotation, degrees[0], degrees[1], degrees[2]);
    if (dirtify) {
      this.dirtifyLocal(element, transform);
    }
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
  translateLocal(element: INode, translation: vec3 | number, y = 0, z = 0) {
    if (typeof translation === 'number') {
      translation = vec3.fromValues(translation, y, z);
    }
    const transform = (element as Element).transformable;
    if (vec3.equals(translation, $vec3Zero)) return;

    vec3.transformQuat(translation, translation, transform.localRotation);
    vec3.add(transform.localPosition, transform.localPosition, translation);

    this.dirtifyLocal(element, transform);
  }

  /**
   * move to position in world space
   *
   * 对应 g 原版的 move/moveTo
   * @see https://github.com/antvis/g/blob/master/packages/g-base/src/abstract/element.ts#L684-L689
   */
  setPosition(element: INode, position: vec3 | vec2) {
    const transform = (element as Element).transformable;

    $setPosition_1[0] = position[0];
    $setPosition_1[1] = position[1];
    $setPosition_1[2] = position[2] ?? 0;

    if (vec3.equals(this.getPosition(element), $setPosition_1)) {
      return;
    }

    vec3.copy(transform.position, $setPosition_1);

    if (
      element.parentNode === null ||
      !(element.parentNode as Element).transformable
    ) {
      vec3.copy(transform.localPosition, $setPosition_1);
    } else {
      const parentTransform = (element.parentNode as Element).transformable;
      mat4.copy(
        $setPosition_ParentInvertMatrix,
        parentTransform.worldTransform,
      );
      mat4.invert(
        $setPosition_ParentInvertMatrix,
        $setPosition_ParentInvertMatrix,
      );
      vec3.transformMat4(
        transform.localPosition,
        $setPosition_1,
        $setPosition_ParentInvertMatrix,
      );
    }

    this.dirtifyLocal(element, transform);
  }

  /**
   * move to position in local space
   */
  setLocalPosition(element: INode, position: vec3 | vec2, dirtify = true) {
    const transform = (element as Element).transformable;

    $setLocalPosition[0] = position[0];
    $setLocalPosition[1] = position[1];
    $setLocalPosition[2] = position[2] ?? 0;

    if (vec3.equals(transform.localPosition, $setLocalPosition)) {
      return;
    }

    vec3.copy(transform.localPosition, $setLocalPosition);
    if (dirtify) {
      this.dirtifyLocal(element, transform);
    }
  }

  /**
   * scale in local space
   */
  scaleLocal(element: INode, scaling: vec3 | vec2) {
    const transform = (element as Element).transformable;
    vec3.multiply(
      transform.localScale,
      transform.localScale,
      vec3.set($vec3, scaling[0], scaling[1], scaling[2] ?? 1),
    );
    this.dirtifyLocal(element, transform);
  }

  setLocalScale(element: INode, scaling: vec3 | vec2, dirtify = true) {
    const transform = (element as Element).transformable;

    vec3.set(
      $vec3,
      scaling[0],
      scaling[1],
      scaling[2] ?? transform.localScale[2],
    );

    if (vec3.equals($vec3, transform.localScale)) {
      return;
    }

    vec3.copy(transform.localScale, $vec3);
    if (dirtify) {
      this.dirtifyLocal(element, transform);
    }
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
  translate(element: INode, translation: vec3 | number, y = 0, z = 0) {
    if (typeof translation === 'number') {
      translation = vec3.set($vec3, translation, y, z);
    }
    if (vec3.equals(translation, $vec3Zero)) return;

    vec3.add($vec3, this.getPosition(element), translation);

    this.setPosition(element, $vec3);
  }

  setRotation(
    element: INode,
    rotation: quat | number,
    y?: number,
    z?: number,
    w?: number,
  ) {
    const transform = (element as Element).transformable;
    if (typeof rotation === 'number') {
      rotation = quat.fromValues(rotation, y, z, w);
    }

    if (
      element.parentNode === null ||
      !(element.parentNode as Element).transformable
    ) {
      this.setLocalRotation(element, rotation);
    } else {
      const parentRot = this.getRotation(element.parentNode);

      quat.copy($quat, parentRot);
      quat.invert($quat, $quat);
      quat.multiply(transform.localRotation, $quat, rotation);
      quat.normalize(transform.localRotation, transform.localRotation);

      this.dirtifyLocal(element, transform);
    }
  }

  setLocalRotation(
    element: INode,
    rotation: quat | number,
    y?: number,
    z?: number,
    w?: number,
    dirtify = true,
  ) {
    if (typeof rotation === 'number') {
      rotation = quat.set($quat, rotation, y, z, w);
    }
    const transform = (element as Element).transformable;
    quat.copy(transform.localRotation, rotation);
    if (dirtify) {
      this.dirtifyLocal(element, transform);
    }
  }

  setLocalSkew(
    element: INode,
    skew: vec2 | number,
    y?: number,
    dirtify = true,
  ) {
    if (typeof skew === 'number') {
      skew = vec2.set($vec2, skew, y);
    }
    const transform = (element as Element).transformable;
    vec2.copy(transform.localSkew, skew);
    if (dirtify) {
      this.dirtifyLocal(element, transform);
    }
  }

  dirtifyLocal(element: INode, transform: Transform) {
    if (isInFragment(element)) return;

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
    this.dirtifyToRoot(element, true);
  }

  dirtifyFragment(element: INode) {
    const transform = (element as Element).transformable;
    if (transform) {
      transform.frozen = false;
      transform.dirtyFlag = true;
      transform.localDirtyFlag = true;
    }
    const renderable = (element as Element).renderable;
    if (renderable) {
      renderable.renderBoundsDirty = true;
      renderable.boundsDirty = true;
      renderable.dirty = true;
    }

    const length = element.childNodes.length;
    for (let i = 0; i < length; i++) {
      this.dirtifyFragment(element.childNodes[i]);
    }

    if (element.nodeName === Shape.FRAGMENT) {
      this.pendingEvents.set(element as DisplayObject, false);
    }
  }

  triggerPendingEvents() {
    const triggered = new Set<DisplayObject>();

    const trigger = (element: DisplayObject, detail) => {
      if (
        !element.isConnected ||
        triggered.has(element) ||
        (element.nodeName as Shape) === Shape.FRAGMENT
      ) {
        return;
      }

      this.boundsChangedEvent.detail = detail;
      this.boundsChangedEvent.target = element;
      if (element.isMutationObserved) {
        element.dispatchEvent(this.boundsChangedEvent);
      } else {
        element.ownerDocument.defaultView.dispatchEvent(
          this.boundsChangedEvent,
          true,
        );
      }

      triggered.add(element);
    };

    this.pendingEvents.forEach((affectChildren, element) => {
      if ((element.nodeName as Shape) === Shape.FRAGMENT) {
        return;
      }

      $triggerPendingEvents_detail.affectChildren = affectChildren;
      if (affectChildren) {
        element.forEach((e: DisplayObject) => {
          trigger(e, $triggerPendingEvents_detail);
        });
      } else trigger(element, $triggerPendingEvents_detail);
    });

    triggered.clear();
    this.clearPendingEvents();
  }

  clearPendingEvents() {
    this.pendingEvents.clear();
  }

  dirtifyToRoot(element: INode, affectChildren = false) {
    let p = element;

    // only need to re-render itself
    if ((p as Element).renderable) {
      (p as Element).renderable.dirty = true;
    }

    while (p) {
      markRenderableDirty(p as Element);
      p = p.parentNode;
    }

    if (affectChildren) {
      element.forEach((e: Element) => {
        markRenderableDirty(e);
      });
    }

    this.informDependentDisplayObjects(element as DisplayObject);

    this.pendingEvents.set(element as DisplayObject, affectChildren);
  }

  private displayObjectDependencyMap: WeakMap<
    DisplayObject,
    Record<string, DisplayObject[]>
  > = new WeakMap();
  updateDisplayObjectDependency(
    name: string,
    oldPath: DisplayObject,
    newPath: DisplayObject,
    object: DisplayObject,
  ) {
    // clear ref to old clip path
    if (oldPath && oldPath !== newPath) {
      const oldDependencyMap = this.displayObjectDependencyMap.get(oldPath);
      if (oldDependencyMap && oldDependencyMap[name]) {
        const index = oldDependencyMap[name].indexOf(object);
        oldDependencyMap[name].splice(index, 1);
      }
    }

    if (newPath) {
      let newDependencyMap = this.displayObjectDependencyMap.get(newPath);
      if (!newDependencyMap) {
        this.displayObjectDependencyMap.set(newPath, {});
        newDependencyMap = this.displayObjectDependencyMap.get(newPath);
      }
      if (!newDependencyMap[name]) {
        newDependencyMap[name] = [];
      }
      newDependencyMap[name].push(object);
    }
  }

  informDependentDisplayObjects(object: DisplayObject) {
    const dependencyMap = this.displayObjectDependencyMap.get(object);
    if (!dependencyMap) {
      return;
    }

    Object.keys(dependencyMap).forEach((name) => {
      dependencyMap[name].forEach((target) => {
        this.dirtifyToRoot(target, true);

        target.dispatchEvent(
          new MutationEvent(
            ElementEvent.ATTR_MODIFIED,
            target as IElement,
            this,
            this,
            name,
            MutationEvent.MODIFICATION,
            this,
            this,
          ),
        );

        if (target.isCustomElement && target.isConnected) {
          if ((target as CustomElement<any>).attributeChangedCallback) {
            (target as CustomElement<any>).attributeChangedCallback(
              name,
              this,
              this,
            );
          }
        }
      });
    });
  }

  getPosition(element: INode) {
    const transform = (element as Element).transformable;
    return mat4.getTranslation(
      transform.position,
      this.getWorldTransform(element, transform),
    );
  }

  getRotation(element: INode) {
    const transform = (element as Element).transformable;
    return mat4.getRotation(
      transform.rotation,
      this.getWorldTransform(element, transform),
    );
  }

  getScale(element: INode) {
    const transform = (element as Element).transformable;
    return mat4.getScaling(
      transform.scaling,
      this.getWorldTransform(element, transform),
    );
  }

  getWorldTransform(
    element: INode,
    transform: Transform = (element as Element).transformable,
  ) {
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

  getLocalSkew(element: INode) {
    return (element as Element).transformable.localSkew;
  }

  private calcLocalTransform(transform: Transform) {
    const hasSkew =
      transform.localSkew[0] !== 0 || transform.localSkew[1] !== 0;

    if (hasSkew) {
      mat4.fromRotationTranslationScaleOrigin(
        transform.localTransform,
        transform.localRotation,
        transform.localPosition,
        vec3.fromValues(1, 1, 1),
        transform.origin,
      );

      // apply skew2D
      if (transform.localSkew[0] !== 0 || transform.localSkew[1] !== 0) {
        mat4.identity($mat4);
        $mat4[4] = Math.tan(transform.localSkew[0]);
        $mat4[1] = Math.tan(transform.localSkew[1]);
        mat4.multiply(
          transform.localTransform,
          transform.localTransform,
          $mat4,
        );
      }

      const scaling = mat4.fromRotationTranslationScaleOrigin(
        $mat4,
        quat.set($quat, 0, 0, 0, 1),
        vec3.set($vec3, 1, 1, 1),
        transform.localScale,
        transform.origin,
      );
      mat4.multiply(
        transform.localTransform,
        transform.localTransform,
        scaling,
      );
    } else {
      const {
        localTransform,
        localPosition,
        localRotation,
        localScale,
        origin,
      } = transform;

      const hasPosition =
        localPosition[0] !== 0 ||
        localPosition[1] !== 0 ||
        localPosition[2] !== 0;

      const hasRotation =
        localRotation[3] !== 1 ||
        localRotation[0] !== 0 ||
        localRotation[1] !== 0 ||
        localRotation[2] !== 0;

      const hasScale =
        localScale[0] !== 1 || localScale[1] !== 1 || localScale[2] !== 1;

      const hasOrigin = origin[0] !== 0 || origin[1] !== 0 || origin[2] !== 0;

      if (!hasRotation && !hasScale && !hasOrigin) {
        if (hasPosition) {
          mat4.fromTranslation(localTransform, localPosition);
        } else {
          mat4.identity(localTransform);
        }
      } else {
        // @see https://github.com/mattdesl/css-mat4/blob/master/index.js
        mat4.fromRotationTranslationScaleOrigin(
          localTransform,
          localRotation,
          localPosition,
          localScale,
          origin,
        );
      }
    }
  }

  getLocalTransform(element: INode) {
    const transform = (element as Element).transformable;
    if (transform.localDirtyFlag) {
      this.calcLocalTransform(transform);
      transform.localDirtyFlag = false;
    }
    return transform.localTransform;
  }

  setLocalTransform(element: INode, transform: mat4) {
    const t = mat4.getTranslation($setLocalTransform_1, transform);
    const r = mat4.getRotation($setLocalTransform_2, transform);
    const s = mat4.getScaling($setLocalTransform_3, transform);
    this.setLocalScale(element, s, false);
    this.setLocalPosition(element, t, false);
    this.setLocalRotation(element, r, undefined, undefined, undefined, false);
    this.dirtifyLocal(element, (element as Element).transformable);
  }

  resetLocalTransform(element: INode) {
    this.setLocalScale(element, $vec3One, false);
    this.setLocalPosition(element, $vec3Zero, false);
    this.setLocalEulerAngles(element, $vec3Zero, undefined, undefined, false);
    this.setLocalSkew(element, $vec2Zero, undefined, false);
    this.dirtifyLocal(element, (element as Element).transformable);
  }

  private getTransformedGeometryBounds(
    element: INode,
    render = false,
    existedAABB?: AABB,
  ): AABB | null {
    const bounds = this.getGeometryBounds(element, render);
    if (!AABB.isEmpty(bounds)) {
      const aabb = existedAABB || new AABB();
      aabb.setFromTransformedAABB(bounds, this.getWorldTransform(element));
      return aabb;
    }
    return null;
  }

  /**
   * won't account for children
   */
  getGeometryBounds(element: INode, render = false): AABB {
    const { geometry } = element as Element;

    if (geometry.dirty) {
      runtime.styleValueRegistry.updateGeometry(element as DisplayObject);
    }

    const bounds = render
      ? geometry.renderBounds
      : geometry.contentBounds || null;
    // return (bounds && new AABB(bounds.center, bounds.halfExtents)) || new AABB();
    return bounds || new AABB();
  }

  /**
   * account for children in world space
   */
  getBounds(element: INode, render = false): AABB {
    const { renderable } = element as Element;

    if (!renderable.boundsDirty && !render && renderable.bounds) {
      return renderable.bounds;
    }

    if (!renderable.renderBoundsDirty && render && renderable.renderBounds) {
      return renderable.renderBounds;
    }

    // reuse existed if possible
    const existedAABB = render ? renderable.renderBounds : renderable.bounds;

    // reset with geometry's aabb
    let aabb: AABB = this.getTransformedGeometryBounds(
      element,
      render,
      existedAABB,
    );

    // merge children's aabbs
    const children = element.childNodes as IElement[];
    children.forEach((child) => {
      const childBounds = this.getBounds(child, render);
      if (childBounds) {
        if (!aabb) {
          aabb = existedAABB || new AABB();
          aabb.update(childBounds.center, childBounds.halfExtents);
        } else {
          aabb.add(childBounds);
        }
      }
    });

    if (!aabb) {
      aabb = new AABB();
    }

    if (render) {
      // FIXME: account for clip path
      const clipped = findClosestClipPathTarget(element as DisplayObject);
      if (clipped) {
        // use bounds under world space
        const clipPathBounds = clipped.parsedStyle.clipPath.getBounds(render);
        if (!aabb) {
          aabb.update(clipPathBounds.center, clipPathBounds.halfExtents);
        } else if (clipPathBounds) {
          aabb = clipPathBounds.intersection(aabb);
        }
      }
    }

    if (render) {
      renderable.renderBounds = aabb;
      renderable.renderBoundsDirty = false;
    } else {
      renderable.bounds = aabb;
      renderable.boundsDirty = false;
    }

    return aabb;
  }

  /**
   * account for children in local space
   */
  getLocalBounds(element: INode): AABB {
    if (element.parentNode) {
      let parentInvert = $mat4Identity;

      if ((element.parentNode as Element).transformable) {
        parentInvert = mat4.invert(
          $mat4,
          this.getWorldTransform(element.parentNode),
        );
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
    const bbox = element.ownerDocument?.defaultView
      ?.getContextService()
      .getBoundingClientRect();

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

      const { renderable } = element as Element;
      if (renderable) {
        renderable.renderBoundsDirty = true;
        renderable.boundsDirty = true;
        renderable.dirty = true;
      }
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
      this.calcLocalTransform(transform);
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
