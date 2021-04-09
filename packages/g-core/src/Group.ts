import { Entity } from '@antv/g-ecs';
import { isObject, isNil } from '@antv/util';
import { vec3 } from 'gl-matrix';
import EventEmitter from 'eventemitter3';
import { SceneGraphNode, Transform, Visible } from './components';
import { Shape } from './Shape';
import { createVec3, rad2deg, getEuler } from './utils/math';
import { Sortable } from './components/Sortable';
import { GroupFilter, SHAPE, ShapeCfg } from './types';
import { GroupPool } from './GroupPool';
import { world, lazyInject } from './inversify.config';
import { SceneGraphService } from './services';

export function isGroup(shape: any): shape is Group {
  return !!(shape && shape.isGroup && shape.isGroup());
}

export interface IGroup {
  getEntity(): Entity;
  add(shape: Shape | Group): void;
  remove(shape: Shape | Group): void;
}

export enum GROUP_EVENT {
  Created = 'created',
  Mounted = 'mounted',
  AttributeChanged = 'attribute-changed',
  ChildAppended = 'child-appended',
  ChildRemoved = 'child-removed',
}

/**
 * Provide abilities in scene graph, such as:
 * * transform `translate/rotate/scale`
 * * add/remove child
 * * visibility and z-index
 *
 * Those abilities are implemented with those components: `Transform/SceneGraphNode/Sortable/Visible`.
 */
export class Group extends EventEmitter implements IGroup {
  protected entity: Entity;
  protected config: ShapeCfg = { attrs: {} };

  @lazyInject(SceneGraphService)
  protected sceneGraph: SceneGraphService;

  @lazyInject(GroupPool)
  protected groupPool: GroupPool;

  constructor(config?: ShapeCfg) {
    super();

    // assign name, id to config
    // eg. group.get('name')
    this.config = config || { attrs: {} };

    // create entity with shape's name
    const entity = world.createEntity(this.config.id || '');
    this.entity = entity;

    entity.addComponent(Transform);

    // init scene graph node
    const sceneGraphNode = entity.addComponent(SceneGraphNode);
    sceneGraphNode.id = this.config.id || '';
    sceneGraphNode.class = this.config.className || '';
    sceneGraphNode.tagName = SHAPE.Group;
    sceneGraphNode.attributes = this.config.attrs || {};
    if (this.config.name) {
      sceneGraphNode.attributes.name = this.config.name;
    }

    entity.addComponent(Sortable);
    entity.addComponent(Visible);

    const { attrs: { x = 0, y = 0 } = {} } = this.config;

    // set position in world space
    this.sceneGraph.setPosition(entity, x, y);

    if (this.config.visible) {
      this.show();
    } else {
      this.hide();
    }

    if (this.config.zIndex) {
      this.setZIndex(this.config.zIndex);
    }

    // TODO: capture

    // insert this group into pool
    this.groupPool.add(entity.getName(), this);

    this.emit(GROUP_EVENT.Created);
  }

  getConfig() {
    return this.config;
  }

  getEntity() {
    return this.entity;
  }

  // /**
  //  * compatible with G 3.0
  //  *
  //  * is `Group` or `Shape`
  //  */
  // isGroup() {
  //   return true;
  // }

  // /**
  //  * compatible with G 3.0
  //  */
  // get(key: string) {
  //   return this.config[key];
  // }
  // set(key: string, value: any) {
  //   this.config[key] = value;
  // }
  attr(): any;
  attr(name: string): any;
  attr(name: string, value: any): void;
  attr(name: Record<string, any>): any;
  attr(...args: any) {
    const [name, value] = args;

    const sceneGraphNode = this.entity.getComponent(SceneGraphNode);
    if (!name) {
      return sceneGraphNode.attributes;
    }
    if (isObject(name)) {
      for (const k in name) {
        this.setAttribute(k, (name as Record<string, any>)[k]);
      }
      return this;
    }
    if (args.length === 2) {
      this.setAttribute(name, value);
      return this;
    }
    return sceneGraphNode.attributes[name];
  }

  destroy() {
    this.entity.destroy();
  }

  /** scene graph operations */

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Node
   */
  get nodeType(): string {
    return this.entity.getComponent(SceneGraphNode).tagName;
  }
  get nodeName(): string {
    return this.entity.getComponent(SceneGraphNode).tagName;
  }
  get parentNode(): Group | null {
    return this.getParent();
  }
  get parentElement(): Group | null {
    // TODO: The Node.parentElement read-only property returns the DOM node's parent Element, or null if the node either has no parent, or its parent isn't a DOM Element.
    return this.getParent();
  }
  get nextSibling(): Group | null {
    const parentGroup = this.getParent();
    if (parentGroup) {
      const children = parentGroup.getChildren();
      const index = children.indexOf(this);
      return children[index + 1] || null;
    }

    return null;
  }
  get previousSibling(): Group | null {
    const parentGroup = this.getParent();
    if (parentGroup) {
      const children = parentGroup.getChildren();
      const index = children.indexOf(this);
      return children[index - 1] || null;
    }

    return null;
  }
  get firstChild(): Group | null {
    return this.getFirst();
  }
  get lastChild(): Group | null {
    return this.getLast();
  }
  cloneNode() {
    return new Group(this.config);
  }
  appendChild(group: Group) {
    this.add(group);
    return group;
  }
  insertBefore(group: Group, reference?: Group): Group {
    if (!reference) {
      this.add(group);
    } else {
      const children = this.getChildren();
      const index = children.indexOf(reference);
      this.add(group, index - 1);
    }
    return group;
  }
  contains(group: Group) {
    // the node itself, one of its direct children
    let tmp: Group | null = group;
    // @see https://developer.mozilla.org/en-US/docs/Web/API/Node/contains
    while (tmp && this !== tmp) {
      tmp = tmp.parentNode;
    }
    return !!tmp;
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/ParentNode
   */
  get children(): Group[] {
    return this.getChildren();
  }
  get childElementCount(): number {
    return this.getCount();
  }
  get firstElementChild(): Group | null {
    // TODO: To avoid the issue with node.firstChild returning #text or #comment nodes, ParentNode.firstElementChild can be used to return only the first element node.
    return this.firstChild;
  }
  get lastElementChild(): Group | null {
    return this.lastChild;
  }

  getElementById(id: string) {
    return this.sceneGraph.querySelector(`#${id}`, this);
  }
  getElementsByName(name: string) {
    return this.sceneGraph.querySelectorAll(`[name="${name}"]`, this);
  }
  getElementsByClassName(className: string) {
    return this.sceneGraph.querySelectorAll(`.${className}`, this);
  }
  getElementsByTagName(tagName: string) {
    return this.sceneGraph.querySelectorAll(tagName, this);
  }
  querySelector(selector: string) {
    return this.sceneGraph.querySelector(selector, this);
  }
  querySelectorAll(selector: string) {
    return this.sceneGraph.querySelectorAll(selector, this);
  }

  addEventListener(event: string, handler: (...args: any[]) => void) {
    this.on(event, handler);
  }
  removeEventListener(event: string, handler: (...args: any[]) => void) {
    this.off(event, handler);
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttribute
   */
  getAttribute(attributeName: string) {
    const value = this.entity.getComponent(SceneGraphNode).attributes[attributeName];
    // if the given attribute does not exist, the value returned will either be null or ""
    return isNil(value) ? null : value;
  }
  /**
   * should use removeAttribute() instead of setting the attribute value to null either directly or using setAttribute(). Many attributes will not behave as expected if you set them to null.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/removeAttribute
   */
  removeAttribute(attributeName: string) {
    delete this.entity.getComponent(SceneGraphNode).attributes[attributeName];
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute
   */
  setAttribute(attributeName: string, value: any) {
    const attributes = this.entity.getComponent(SceneGraphNode).attributes;
    if (value !== attributes[attributeName]) {
      attributes[attributeName] = value;

      this.emit('attribute-changed', this.entity, attributeName, value);
    }
  }

  /**
   * compatible with G 3.0
   *
   * return children num
   */
  getCount() {
    return this.getChildren().length;
  }

  /**
   * compatible with G 3.0
   *
   * return parent group
   */
  getParent(): Group | null {
    const sceneGraphNode = this.entity.getComponent(SceneGraphNode);
    if (sceneGraphNode.parent) {
      return this.groupPool.getByName(sceneGraphNode.parent.getName());
    }

    return null;
  }

  /**
   * compatible with G 3.0
   *
   * return children groups
   */
  getChildren() {
    const sceneGraphNode = this.entity.getComponent(SceneGraphNode);
    return sceneGraphNode.children.map((entity) => this.groupPool.getByName(entity.getName()));
  }

  /**
   * compatible with G 3.0
   *
   * get first child group/shape
   */
  getFirst(): Group | null {
    const children = this.getChildren();
    return children.length > 0 ? children[0] : null;
  }

  /**
   * compatible with G 3.0
   *
   * get last child group/shape
   */
  getLast(): Group | null {
    const children = this.getChildren();
    return children.length > 0 ? children[children.length - 1] : null;
  }

  /**
   * compatible with G 3.0
   *
   * get child group/shape by index
   */
  getChildByIndex(index: number): Group | null {
    const children = this.getChildren();
    return children[index] || null;
  }

  /**
   * search in scene group, but
   */
  find(filter: GroupFilter): Group | null {
    let target: Group | null = null;
    this.sceneGraph.visit(this.entity, (entity) => {
      // shouldn't include itself
      if (entity !== this.getEntity()) {
        const group = this.groupPool.getByName(entity.getName());
        if (filter(group)) {
          target = group;
          return true;
        }
      }
    });
    return target;
  }
  findAll(filter: GroupFilter): Group[] {
    const groups: Group[] = [];
    this.sceneGraph.visit(this.entity, (entity) => {
      // shouldn't include itself
      if (entity !== this.getEntity()) {
        const group = this.groupPool.getByName(entity.getName());
        if (filter(group)) {
          groups.push(group);
        }
      }
    });
    return groups;
  }

  // /**
  //  * compatible with G 3.0
  //  */
  // findById(id: string): Group | null {
  //   return this.find((element) => {
  //     return element.get('id') === id;
  //   });
  // }
  // findByClassName(className: string): Group | null {
  //   return this.find((element) => {
  //     return element.get('className') === className;
  //   });
  // }
  // findAllByName(name: string): Group[] {
  //   return this.findAll((element) => {
  //     return element.get('name') === name;
  //   });
  // }

  /**
   * compatible with G 3.0
   *
   * add child group or shape
   */
  add(shape: Shape | Group, index?: number) {
    this.sceneGraph.attach(shape.getEntity(), this.entity, index);

    this.emit(GROUP_EVENT.ChildAppended, shape);
  }

  /**
   * compatible with G 3.0
   *
   * remove child and destroy it by default
   */
  remove(shape: Shape | Group, destroy = true) {
    const entity = shape.getEntity();
    this.sceneGraph.detach(entity);

    this.emit(GROUP_EVENT.ChildRemoved, shape);

    if (destroy) {
      this.sceneGraph.visit(this.entity, (e) => {
        e.destroy();
      });
    }

    return shape;
  }
  removeChild(shape: Shape | Group, destroy = true) {
    return this.remove(shape, destroy);
  }

  removeChildren(destroy = true) {
    const sceneGraphNode = this.entity.getComponent(SceneGraphNode);
    this.sceneGraph.detachChildren(this.entity);
    if (destroy) {
      sceneGraphNode.children.forEach((entity) => {
        this.sceneGraph.visit(entity, (e) => {
          e.destroy();
        });
      });
    }
  }

  /** transform operations */

  /**
   * alias setPosition
   */
  moveTo(position: vec3 | number, y: number = 0, z: number = 0) {
    this.setPosition(createVec3(position, y, z));
    return this;
  }
  /**
   * alias setPosition
   */
  move(position: vec3 | number, y: number = 0, z: number = 0) {
    this.setPosition(createVec3(position, y, z));
    return this;
  }
  /**
   * compatible with G 3.0
   *
   * set position in world space
   */
  setPosition(position: vec3 | number, y: number = 0, z: number = 0) {
    this.sceneGraph.setPosition(this.entity, createVec3(position, y, z));
    return this;
  }

  /**
   * set position in local space
   */
  setLocalPosition(position: vec3 | number, y: number = 0, z: number = 0) {
    this.sceneGraph.setLocalPosition(this.entity, createVec3(position, y, z));
    return this;
  }

  /**
   * translate in world space
   */
  translate(position: vec3 | number, y: number = 0, z: number = 0) {
    this.sceneGraph.translate(this.entity, createVec3(position, y, z));
    return this;
  }

  /**
   * translate in local space
   */
  translateLocal(position: vec3 | number, y: number = 0, z: number = 0) {
    this.sceneGraph.translateLocal(this.entity, createVec3(position, y, z));
    return this;
  }

  getPosition() {
    return this.sceneGraph.getPosition(this.entity);
  }

  getLocalPosition() {
    return this.sceneGraph.getLocalPosition(this.entity);
  }

  /**
   * compatible with G 3.0
   *
   * scaling in local space
   * scale(10) = scale(10, 10, 10)
   *
   * we can't set scale in world space
   */
  scale(scaling: vec3 | number, y?: number, z?: number) {
    return this.scaleLocal(scaling, y, z);
  }
  scaleLocal(scaling: vec3 | number, y?: number, z?: number) {
    if (typeof scaling === 'number') {
      y = y || scaling;
      z = z || scaling;
      scaling = createVec3(scaling, y, z);
    }
    this.sceneGraph.scaleLocal(this.entity, scaling);
    return this;
  }

  /**
   * set scaling in local space
   */
  setLocalScale(scaling: vec3 | number, y?: number, z?: number) {
    if (typeof scaling === 'number') {
      y = y || scaling;
      z = z || scaling;
      scaling = createVec3(scaling, y, z);
    }

    this.sceneGraph.setLocalScale(this.entity, scaling);
    return this;
  }

  /**
   * get scaling in local space
   */
  getLocalScale() {
    return this.sceneGraph.getLocalScale(this.entity);
  }

  /**
   * get scaling in world space
   */
  getScale() {
    return this.sceneGraph.getScale(this.entity);
  }

  /**
   * only return degrees of Z axis in world space
   */
  getEulerAngles() {
    const transform = this.entity.getComponent(Transform);
    const [ex, ey, ez] = getEuler(vec3.create(), this.sceneGraph.getWorldTransform(this.entity, transform));
    return rad2deg(ez);
  }

  /**
   * only return degrees of Z axis in local space
   */
  getLocalEulerAngles() {
    const [ex, ey, ez] = getEuler(vec3.create(), this.sceneGraph.getLocalRotation(this.entity));
    return rad2deg(ez);
  }

  /**
   * set euler angles(degrees) in world space
   */
  setEulerAngles(z: number) {
    this.sceneGraph.setEulerAngles(this.entity, 0, 0, z);
    return this;
  }

  /**
   * set euler angles(degrees) in local space
   */
  setLocalEulerAngles(z: number) {
    this.sceneGraph.setLocalEulerAngles(this.entity, 0, 0, z);
    return this;
  }

  rotateLocal(z: number) {
    return this.sceneGraph.rotateLocal(this.entity, 0, 0, z);
  }

  rotate(z: number) {
    return this.sceneGraph.rotate(this.entity, 0, 0, z);
  }

  // /**
  //  * compatible with G 3.0
  //  *
  //  * rotate with z axis,
  //  * same as rotating around origin (0, 0, 1) in canvas coords
  //  */
  // rotate(radian: number) {
  //   this.rotateAtPoint(0, 0, radian);
  //   return this;
  // }

  // /**
  //  * compatible with G 3.0
  //  *
  //  * rotate around Z axis in local space in radians
  //  */
  // rotateAtStart(radian: number) {
  //   const [x, y] = this.sceneGraph.getLocalPosition(this.entity);
  //   this.rotateAtPoint(x, y, radian);

  //   return this;
  // }

  // /**
  //  * compatible with G 3.0
  //  *
  //  * 以任意点 (x, y) 为中心旋转元素
  //  */
  // rotateAtPoint(x: number, y: number, radians: number) {
  //   const matrix = this.getMatrix();
  //   const newMatrix = transform(matrix, [
  //     ['t', -x, -y],
  //     ['r', radians],
  //     ['t', x, y],
  //   ]);
  //   this.setMatrix(newMatrix);

  //   // const transform = this.entity.getComponent(Transform);
  //   // transform.rotateLocal(quat.fromEuler(quat.create(), 0, 0, rad2deg(radians)));

  //   return this;
  // }

  // /**
  //  * set rotation in local space
  //  */
  // setLocalRotation(quat: quat) {
  //   this.sceneGraph.setLocalRotation(this.entity, quat);
  //   return this;
  // }

  // /**
  //  * compatible with G 3.0
  //  *
  //  * return mat3x3
  //  */
  // getMatrix(): number[] {
  //   const [ex, ey, ez] = getEuler(vec3.create(), this.sceneGraph.getLocalRotation(this.entity));
  //   const [x, y] = this.sceneGraph.getLocalPosition(this.entity);
  //   const [scaleX, scaleY] = this.sceneGraph.getLocalScale(this.entity);

  //   return [...fromRotationTranslationScale(ex || ez, x, y, scaleX, scaleY)];
  // }

  // /**
  //  * compatible with G 3.0
  //  *
  //  * set mat3x3
  //  */
  // setMatrix(mat: number[]) {
  //   const mat3x3 = mat3.fromValues(
  //     ...(mat as [number, number, number, number, number, number, number, number, number])
  //   );
  //   const translation = getTranslation(vec2.create(), mat3x3);
  //   const scaling = getScaling(vec2.create(), mat3x3);
  //   const radians = getRotationInRadians(mat3x3);

  //   this
  //     .setLocalPosition(translation[0], translation[1], 0)
  //     .setLocalRotation(quat.fromEuler(quat.create(), 0, 0, rad2deg(radians)))
  //     .setLocalScale(scaling[0], scaling[1], 1);
  // }

  /* z-index & visibility */

  setZIndex(zIndex: number) {
    const sortable = this.entity.getComponent(Sortable);
    sortable.zIndex = zIndex;

    // need re-sort
    this.sceneGraph.setTopologicalSortDirty(true);
  }

  /**
   * bring to front in current group
   */
  toFront() {
    const sceneGraphNode = this.entity.getComponent(SceneGraphNode);
    const sortable = this.entity.getComponent(Sortable);
    const parentEntity = sceneGraphNode.parent;
    if (parentEntity) {
      const parent = parentEntity.getComponent(SceneGraphNode);
      sortable.zIndex = Math.max(...parent.children.map((e) => e.getComponent(Sortable).zIndex)) + 1;
      // need re-sort
      this.sceneGraph.setTopologicalSortDirty(true);
    }
  }

  /**
   * send to back in current group
   */
  toBack() {
    const sceneGraphNode = this.entity.getComponent(SceneGraphNode);
    const sortable = this.entity.getComponent(Sortable);
    const parentEntity = sceneGraphNode.parent;
    if (parentEntity) {
      const parent = parentEntity.getComponent(SceneGraphNode);
      sortable.zIndex = Math.min(...parent.children.map((e) => e.getComponent(Sortable).zIndex)) - 1;
      // need re-sort
      this.sceneGraph.setTopologicalSortDirty(true);
    }
  }

  /**
   * show group, which will also change visibility of its children in sceneGraphNode
   */
  show() {
    this.sceneGraph.visit(
      this.entity,
      (entity, visible) => {
        const visibleComponent = entity.getComponent(Visible);
        if (visibleComponent) {
          visibleComponent.visible = visible;
        }
      },
      true
    );
  }

  /**
   * hide group, which will also change visibility of its children in sceneGraphNode
   */
  hide() {
    this.sceneGraph.visit(
      this.entity,
      (entity, visible) => {
        const visibleComponent = entity.getComponent(Visible);
        if (visibleComponent) {
          visibleComponent.visible = visible;
        }
      },
      false
    );
  }
}
