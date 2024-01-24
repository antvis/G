import { isNil } from '@antv/util';
import { mat4, quat, vec2, vec3 } from 'gl-matrix';
import { SortReason, Transform } from '../components';
import type { CustomElement, DisplayObject } from '../display-objects';
import type { Element } from '../dom';
import { CustomEvent } from '../dom/CustomEvent';
import { MutationEvent } from '../dom/MutationEvent';
import type {
  IChildNode,
  IElement,
  INode,
  IParentNode,
} from '../dom/interfaces';
import { ElementEvent } from '../dom/interfaces';
import { GlobalRuntime, runtime } from '../global-runtime';
import { AABB, Rectangle } from '../shapes';
import { findClosestClipPathTarget } from '../utils';
import type { SceneGraphService } from './interfaces';

function markRenderableDirty(e: Element) {
  const renderable = e.renderable;
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

/**
 * update transform in scene graph
 *
 * @see https://community.khronos.org/t/scene-graphs/50542/7
 */
export class DefaultSceneGraphService implements SceneGraphService {
  private pendingEvents = [];
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

    child.parentNode = parent;
    if (!isNil(index)) {
      child.parentNode.childNodes.splice(
        index,
        0,
        child as unknown as INode & IChildNode,
      );
    } else {
      child.parentNode.childNodes.push(child as unknown as INode & IChildNode);
    }

    // parent needs re-sort
    const sortable = (parent as unknown as Element).sortable;
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

    // this.updateGraphDepth(child);

    const transform = (child as unknown as Element).transformable;
    if (transform) {
      this.dirtifyWorld(child, transform);
    }

    if (transform.frozen) {
      this.unfreezeParentToRoot(child);
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
      const sortable = (child.parentNode as Element).sortable;
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
  rotate = (() => {
    const parentInvertRotation = quat.create();
    return (
      element: INode,
      degrees: vec3 | number,
      y = 0,
      z = 0,
      dirtify = true,
    ) => {
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
        const rotation = quat.create();
        quat.fromEuler(rotation, degrees[0], degrees[1], degrees[2]);
        const rot = this.getRotation(element);
        const parentRot = this.getRotation(element.parentNode);

        quat.copy(parentInvertRotation, parentRot);
        quat.invert(parentInvertRotation, parentInvertRotation);
        quat.multiply(rotation, parentInvertRotation, rotation);
        quat.multiply(transform.localRotation, rotation, rot);
        quat.normalize(transform.localRotation, transform.localRotation);

        if (dirtify) {
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
    return (
      element: INode,
      degrees: vec3 | number,
      y = 0,
      z = 0,
      dirtify = true,
    ) => {
      if (typeof degrees === 'number') {
        degrees = vec3.fromValues(degrees, y, z);
      }
      const transform = (element as Element).transformable;
      quat.fromEuler(rotation, degrees[0], degrees[1], degrees[2]);
      quat.mul(transform.localRotation, transform.localRotation, rotation);

      if (dirtify) {
        this.dirtifyLocal(element, transform);
      }
    };
  })();

  /**
   * set euler angles(degrees) in world space
   */
  setEulerAngles = (() => {
    const invParentRot = quat.create();

    return (
      element: INode,
      degrees: vec3 | number,
      y = 0,
      z = 0,
      dirtify = true,
    ) => {
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
        quat.copy(invParentRot, quat.invert(quat.create(), parentRotation));
        quat.mul(
          transform.localRotation,
          transform.localRotation,
          invParentRot,
        );

        if (dirtify) {
          this.dirtifyLocal(element, transform);
        }
      }
    };
  })();

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
  translateLocal = (() => {
    return (
      element: INode,
      translation: vec3 | number,
      y = 0,
      z = 0,
      dirtify = true,
    ) => {
      if (typeof translation === 'number') {
        translation = vec3.fromValues(translation, y, z);
      }
      const transform = (element as Element).transformable;
      if (vec3.equals(translation, vec3.create())) {
        return;
      }
      vec3.transformQuat(translation, translation, transform.localRotation);
      vec3.add(transform.localPosition, transform.localPosition, translation);

      if (dirtify) {
        this.dirtifyLocal(element, transform);
      }
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
    const tmpPosition = vec3.create();

    return (element: INode, position: vec3 | vec2, dirtify = true) => {
      const transform = (element as Element).transformable;

      tmpPosition[0] = position[0];
      tmpPosition[1] = position[1];
      tmpPosition[2] = position[2] || 0;

      if (vec3.equals(this.getPosition(element), tmpPosition)) {
        return;
      }

      vec3.copy(transform.position, tmpPosition);

      if (
        element.parentNode === null ||
        !(element.parentNode as Element).transformable
      ) {
        vec3.copy(transform.localPosition, tmpPosition);
      } else {
        const parentTransform = (element.parentNode as Element).transformable;
        mat4.copy(parentInvertMatrix, parentTransform.worldTransform);
        mat4.invert(parentInvertMatrix, parentInvertMatrix);
        vec3.transformMat4(
          transform.localPosition,
          tmpPosition,
          parentInvertMatrix,
        );
      }

      if (dirtify) {
        this.dirtifyLocal(element, transform);
      }
    };
  })();

  /**
   * move to position in local space
   */
  setLocalPosition = (() => {
    const tmpPosition = vec3.create();

    return (element: INode, position: vec3 | vec2, dirtify = true) => {
      const transform = (element as Element).transformable;

      tmpPosition[0] = position[0];
      tmpPosition[1] = position[1];
      tmpPosition[2] = position[2] || 0;

      if (vec3.equals(transform.localPosition, tmpPosition)) {
        return;
      }

      vec3.copy(transform.localPosition, tmpPosition);
      if (dirtify) {
        this.dirtifyLocal(element, transform);
      }
    };
  })();

  /**
   * scale in local space
   */
  scaleLocal(element: INode, scaling: vec3 | vec2, dirtify = true) {
    const transform = (element as Element).transformable;
    vec3.multiply(
      transform.localScale,
      transform.localScale,
      vec3.fromValues(scaling[0], scaling[1], scaling[2] || 1),
    );
    if (dirtify) {
      this.dirtifyLocal(element, transform);
    }
  }

  setLocalScale(element: INode, scaling: vec3 | vec2, dirtify = true) {
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
  translate = (() => {
    const zeroVec3 = vec3.create();
    const tmpVec3 = vec3.create();
    const tr = vec3.create();

    return (
      element: INode,
      translation: vec3 | number,
      y = 0,
      z = 0,
      dirtify = true,
    ) => {
      if (typeof translation === 'number') {
        translation = vec3.set(tmpVec3, translation, y, z);
      }
      if (vec3.equals(translation, zeroVec3)) {
        return;
      }

      vec3.add(tr, this.getPosition(element), translation);

      this.setPosition(element, tr, dirtify);
    };
  })();

  setRotation = () => {
    const parentInvertRotation = quat.create();
    return (
      element: INode,
      rotation: quat | number,
      y?: number,
      z?: number,
      w?: number,
      dirtify = true,
    ) => {
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

        quat.copy(parentInvertRotation, parentRot);
        quat.invert(parentInvertRotation, parentInvertRotation);
        quat.multiply(transform.localRotation, parentInvertRotation, rotation);
        quat.normalize(transform.localRotation, transform.localRotation);

        if (dirtify) {
          this.dirtifyLocal(element, transform);
        }
      }
    };
  };

  setLocalRotation(
    element: INode,
    rotation: quat | number,
    y?: number,
    z?: number,
    w?: number,
    dirtify = true,
  ) {
    if (typeof rotation === 'number') {
      rotation = quat.fromValues(rotation, y, z, w);
    }
    const transform = (element as Element).transformable;
    quat.copy(transform.localRotation, rotation);
    if (dirtify) {
      this.dirtifyLocal(element, transform);
    }
  }

  setLocalSkew(element: INode, skew: vec2 | number, y?: number) {
    if (typeof skew === 'number') {
      skew = vec2.fromValues(skew, y);
    }
    const transform = (element as Element).transformable;
    vec2.copy(transform.localSkew, skew);
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
    this.dirtifyToRoot(element, true);
  }

  triggerPendingEvents() {
    const set = new Set<number>();

    const trigger = (element, detail) => {
      if (element.isConnected && !set.has(element.entity)) {
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
        set.add(element.entity);
      }
    };

    this.pendingEvents.forEach(([element, detail]) => {
      if (detail.affectChildren) {
        element.forEach((e) => {
          trigger(e, detail);
        });
      } else {
        trigger(element, detail);
      }
    });

    this.clearPendingEvents();
    set.clear();
  }

  clearPendingEvents() {
    this.pendingEvents = [];
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

    // inform dependencies
    this.informDependentDisplayObjects(element as DisplayObject);

    // reuse the same custom event
    this.pendingEvents.push([element, { affectChildren }]);
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
    if (dependencyMap) {
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

  private calcLocalTransform = (() => {
    const tmpMat = mat4.create();
    const tmpPosition = vec3.create();
    const tmpQuat = quat.fromValues(0, 0, 0, 1);

    return (transform: Transform) => {
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
          const tmpMat4 = mat4.identity(tmpMat);
          tmpMat4[4] = Math.tan(transform.localSkew[0]);
          tmpMat4[1] = Math.tan(transform.localSkew[1]);
          mat4.multiply(
            transform.localTransform,
            transform.localTransform,
            tmpMat4,
          );
        }

        const scaling = mat4.fromRotationTranslationScaleOrigin(
          tmpMat,
          tmpQuat,
          tmpPosition,
          transform.localScale,
          transform.origin,
        );
        mat4.multiply(
          transform.localTransform,
          transform.localTransform,
          scaling,
        );
      } else {
        // @see https://github.com/mattdesl/css-mat4/blob/master/index.js
        mat4.fromRotationTranslationScaleOrigin(
          transform.localTransform,
          transform.localRotation,
          transform.localPosition,
          transform.localScale,
          transform.origin,
        );
      }
    };
  })();

  getLocalTransform(element: INode) {
    const transform = (element as Element).transformable;
    if (transform.localDirtyFlag) {
      this.calcLocalTransform(transform);
      transform.localDirtyFlag = false;
    }
    return transform.localTransform;
  }

  setLocalTransform(element: INode, transform: mat4) {
    const t = mat4.getTranslation(vec3.create(), transform);
    const r = mat4.getRotation(quat.create(), transform);
    const s = mat4.getScaling(vec3.create(), transform);
    this.setLocalScale(element, s, false);
    this.setLocalPosition(element, t, false);
    this.setLocalRotation(element, r, undefined, undefined, undefined, false);
    this.dirtifyLocal(element, (element as Element).transformable);
  }

  resetLocalTransform(element: INode) {
    this.setLocalScale(element, [1, 1, 1]);
    this.setLocalPosition(element, [0, 0, 0]);
    this.setLocalEulerAngles(element, [0, 0, 0]);
    this.setLocalSkew(element, [0, 0]);
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
    } else {
      return null;
    }
  }

  /**
   * won't account for children
   */
  getGeometryBounds(element: INode, render = false): AABB {
    const geometry = (element as Element).geometry;

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
    const renderable = (element as Element).renderable;

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

    if (render) {
      // FIXME: account for clip path
      const clipped = findClosestClipPathTarget(element as DisplayObject);
      if (clipped) {
        // use bounds under world space
        const clipPathBounds = clipped.parsedStyle.clipPath.getBounds(render);
        if (!aabb) {
          aabb = clipPathBounds;
        } else if (clipPathBounds) {
          aabb = clipPathBounds.intersection(aabb);
        }
      }
    }

    if (!aabb) {
      aabb = new AABB();
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

    return aabb;
  }

  /**
   * account for children in local space
   */
  getLocalBounds(element: INode): AABB {
    if (element.parentNode) {
      let parentInvert = mat4.create();
      if ((element.parentNode as Element).transformable) {
        parentInvert = mat4.invert(
          mat4.create(),
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

      const renderable = (element as Element).renderable;
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
