import { isNumber } from '@antv/util';
import { mat4, quat, vec2, vec3 } from 'gl-matrix';
import {
  SortReason,
  type Transform,
  updateLocalTransform,
  updateWorldTransform,
} from '../components';
import { CustomElement, DisplayObject } from '../display-objects';
import type {
  Element,
  IChildNode,
  IElement,
  INode,
  IParentNode,
  Node,
  MutationRecord,
} from '../dom';
import { CustomEvent } from '../dom/CustomEvent';
import { ElementEvent } from '../dom/interfaces';
import { MutationEvent } from '../dom/MutationEvent';
import { GlobalRuntime, runtime } from '../global-runtime';
import { AABB, Rectangle } from '../shapes';
import { Shape } from '../types';
import { findClosestClipPathTarget, isInFragment } from '../utils';
import type { SceneGraphService } from './interfaces';
import type { Canvas } from '../Canvas';

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

/**
 * update transform in scene graph
 *
 * @see https://community.khronos.org/t/scene-graphs/50542/7
 */
export class DefaultSceneGraphService implements SceneGraphService {
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
      sortable.dirty ||
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

    if (isChildFragment) {
      this.dirtyFragment(child);
    } else {
      const transform = (child as unknown as Element).transformable;
      if (transform) {
        this.dirtyWorldTransform(child, transform);
      }
    }

    if (detached) {
      const enableCancelEventPropagation =
        parent.ownerDocument?.defaultView?.getConfig()?.future
          ?.experimentalCancelEventPropagation === true;

      child.dispatchEvent(
        reparentEvent,
        enableCancelEventPropagation,
        enableCancelEventPropagation,
      );
    }
  }

  detach<C extends INode>(child: C) {
    if (!child.parentNode) {
      return;
    }

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
      this.dirtyWorldTransform(child, transform);
    }
    child.parentNode = null;
  }

  // #region local-transform ----------------------------------------------------------------

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

  getLocalTransform(element: INode) {
    const transform = (element as Element).transformable;
    updateLocalTransform(transform);

    return transform.localTransform;
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
      this.dirtyLocalTransform(element, transform);
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

    this.dirtyLocalTransform(element, transform);
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
      this.dirtyLocalTransform(element, transform);
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

    this.dirtyLocalTransform(element, transform);
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
      this.dirtyLocalTransform(element, transform);
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
    this.dirtyLocalTransform(element, transform);
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
      this.dirtyLocalTransform(element, transform);
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
      this.dirtyLocalTransform(element, transform);
    }
  }

  setLocalTransform(element: INode, transform: mat4) {
    const t = mat4.getTranslation($setLocalTransform_1, transform);
    const r = mat4.getRotation($setLocalTransform_2, transform);
    const s = mat4.getScaling($setLocalTransform_3, transform);
    this.setLocalScale(element, s, false);
    this.setLocalPosition(element, t, false);
    this.setLocalRotation(element, r, undefined, undefined, undefined, false);

    this.dirtyLocalTransform(element, (element as Element).transformable);
  }

  resetLocalTransform(element: INode) {
    this.setLocalScale(element, $vec3One, false);
    this.setLocalPosition(element, $vec3Zero, false);
    this.setLocalEulerAngles(element, $vec3Zero, undefined, undefined, false);
    this.setLocalSkew(element, $vec2Zero, undefined, false);

    this.dirtyLocalTransform(element, (element as Element).transformable);
  }

  // #endregion local-transform
  // #region transform ----------------------------------------------------------------

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

  getOrigin(element: INode) {
    (element as Element).getGeometryBounds();
    return (element as Element).transformable.origin;
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

    this.internalUpdateTransform(element as Element);

    return transform.worldTransform;
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

    this.dirtyLocalTransform(element, transform);
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

      this.dirtyLocalTransform(element, transform);
    }
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

      this.dirtyLocalTransform(element, transform);
    }
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
    this.dirtyLocalTransform(element, transform);
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

      this.dirtyLocalTransform(element, transform);
    }
  }

  // #endregion transform
  // #region bbox ----------------------------------------------------------------

  /**
   * Get the geometry bounds of the element itself, excluding children.
   *
   * @param element - The element to get geometry bounds for
   * @param render - If true, returns render bounds (including strokes, etc.); otherwise returns content bounds
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
   * Get the geometry bounds of the element itself in world space, excluding children.
   *
   * @param element - The element to get transformed geometry bounds for
   * @param render - If true, returns render bounds (including strokes, etc.); otherwise returns content bounds
   * @param existedAABB - Optional existing AABB to reuse
   */
  getTransformedGeometryBounds(
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

  // #endregion bbox
  // #region other ----------------------------------------------------------------

  private internalUpdateTransform(element: Element) {
    const parentTransform = (element.parentNode as Element)?.transformable;

    updateLocalTransform(element.transformable);
    updateWorldTransform(element.transformable, parentTransform);
  }

  private internalUpdateElement(
    element: Element,
    ancestors: {
      node: INode;
      transformDirty: boolean;
      shapeUpdated: boolean;
    }[],
  ): boolean {
    const enableAttributeUpdateOptimization =
      element.ownerDocument?.defaultView?.getConfig()?.future
        ?.experimentalAttributeUpdateOptimization === true;
    const parent = ancestors[ancestors.length - 1];
    // parent nodes affect child nodes
    const transformDirty =
      parent?.transformDirty || element.transformable?.localDirtyFlag;
    if (element.transformable) {
      element.transformable.dirtyFlag ||= transformDirty;
    }

    this.internalUpdateTransform(element);

    if (transformDirty) {
      element.dirty?.(true, true);
    }
    const shapeUpdated =
      element.renderable?.boundsDirty || element.renderable?.renderBoundsDirty;

    // The transformation matrix of the child node changes,
    // which will cause the bounding box data of the ancestor node to become outdated.
    if (
      (transformDirty || shapeUpdated) &&
      parent?.shapeUpdated === false &&
      enableAttributeUpdateOptimization
    ) {
      let tempElIndex = ancestors.length - 1;
      while (tempElIndex >= 0) {
        const tempEl = ancestors[tempElIndex];
        if (tempEl.shapeUpdated) {
          break;
        }

        (tempEl.node as Element).dirty?.(true, true);
        tempEl.shapeUpdated = true;

        tempElIndex -= 1;
      }
    }

    return transformDirty;
  }

  syncHierarchy(rootNode: INode) {
    const stack: INode[] = [rootNode];
    const ancestors: {
      node: INode;
      transformDirty: boolean;
      shapeUpdated: boolean;
    }[] = rootNode.parentNode
      ? [
          {
            node: rootNode.parentNode,
            transformDirty:
              (rootNode.parentNode as Element).transformable?.localDirtyFlag ||
              (rootNode.parentNode as Element).transformable?.dirtyFlag,
            shapeUpdated: false,
          },
        ]
      : [];

    while (stack.length > 0) {
      const node = stack.pop();
      let parent = ancestors[ancestors.length - 1];
      while (ancestors.length > 0 && node.parentNode !== parent.node) {
        parent = ancestors.pop();
      }

      const transformDirty = this.internalUpdateElement(
        node as Element,
        ancestors,
      );

      if (node.childNodes.length > 0) {
        for (let i = node.childNodes.length - 1; i >= 0; i--) {
          stack.push(node.childNodes[i]);
        }

        ancestors.push({
          node,
          transformDirty,
          shapeUpdated: false,
        });
      }
    }
  }

  dirtyLocalTransform(element: INode, transform: Transform) {
    if (isInFragment(element)) return;

    if (!transform.localDirtyFlag) {
      transform.localDirtyFlag = true;
      if (!transform.dirtyFlag) {
        this.dirtyWorldTransform(element, transform);
      }
    }
  }

  dirtyWorldTransform(element: INode, transform: Transform) {
    this.dirtyWorldInternal(element, transform);
    this.dirtyToRoot(element, true);
  }

  private dirtyWorldInternal(element: INode, transform: Transform) {
    const enableAttributeUpdateOptimization =
      element.ownerDocument?.defaultView?.getConfig()?.future
        ?.experimentalAttributeUpdateOptimization === true;

    if (!transform.dirtyFlag) {
      transform.dirtyFlag = true;
      (element as Element).dirty(true, true);

      if (!enableAttributeUpdateOptimization) {
        element.childNodes.forEach((child) => {
          const childTransform = (child as Element).transformable;

          this.dirtyWorldInternal(child as IElement, childTransform);
        });
      }
    }
  }

  dirtyToRoot(element: INode, affectChildren = false) {
    let p = element;
    const enableAttributeUpdateOptimization =
      element.ownerDocument?.defaultView?.getConfig()?.future
        ?.experimentalAttributeUpdateOptimization === true;

    while (p) {
      (p as Element).dirty?.(true, true);

      if (enableAttributeUpdateOptimization) {
        break;
      } else {
        p = p.parentNode;
      }
    }

    if (affectChildren) {
      element.forEach((e: Element) => {
        e.dirty?.(true, true);
      });
    }

    this.informDependentDisplayObjects(element as DisplayObject);

    const mutations = (element as Node).mutations || [];
    let boundChangeMutation = mutations.find(
      (item) => item.type === 'attributes' && item._boundsChangeData,
    );

    if (!boundChangeMutation) {
      boundChangeMutation = {
        type: 'attributes' as const,
        target: element as DisplayObject,
        _boundsChangeData: {
          affectChildren,
        },
      };

      mutations.push(boundChangeMutation);
    } else {
      boundChangeMutation._boundsChangeData = {
        affectChildren:
          boundChangeMutation._boundsChangeData.affectChildren ||
          affectChildren,
      };
    }

    (element as Node).mutations = mutations;
  }

  dirtyFragment(element: INode) {
    const transform = (element as Element).transformable;
    if (transform) {
      transform.dirtyFlag = true;
      transform.localDirtyFlag = true;
    }
    (element as Element).dirty?.(true, true);

    const length = element.childNodes.length;
    for (let i = 0; i < length; i++) {
      this.dirtyFragment(element.childNodes[i]);
    }
  }

  notifyMutationObservers(canvas: Canvas) {
    const mutations: Set<MutationRecord> = new Set();

    canvas.getRoot().forEach((item: Node) => {
      (item.mutations || []).forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation._boundsChangeData) {
          if (mutation._boundsChangeData.affectChildren) {
            item.forEach((node: Node) => {
              const newMutation = { ...mutation };
              newMutation.target = node;
              mutations.add(newMutation);
            });
          } else {
            mutations.add(mutation);
          }
        }
      });

      item.mutations = undefined;
    });

    if (mutations.size > 0) {
      const event = new CustomEvent(ElementEvent.BOUNDS_CHANGED, {
        detail: Array.from(mutations),
      });

      canvas.dispatchEvent(event, true, true);
    }
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

    const enableCancelEventPropagation =
      object.ownerDocument?.defaultView?.getConfig()?.future
        ?.experimentalCancelEventPropagation;

    Object.keys(dependencyMap).forEach((name) => {
      dependencyMap[name].forEach((target) => {
        this.dirtyToRoot(target, true);

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
          enableCancelEventPropagation,
          enableCancelEventPropagation,
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
}
