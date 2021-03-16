import { Entity, System, World } from '@antv/g-ecs';
import { mat3, mat4, quat, vec2, vec3 } from 'gl-matrix';
import { Container, inject, injectable, named } from 'inversify';
import { ext } from '@antv/matrix-util';
import { Hierarchy, Transform, Visible } from './components';
import { Shape } from './Shape';
import { SceneGraph } from './systems';
import {
  createVec3,
  rad2deg,
  fromRotationTranslationScale,
  getEuler,
  getTranslation,
  getScaling,
  getRotationInRadians,
} from './utils/math';
import { Sortable } from './components/Sortable';
import { GroupCfg, GroupFilter } from './types';

const { transform } = ext;

export interface IGroup {
  getEntity(): Entity;
  add(shape: Shape | Group): void;
  remove(shape: Shape | Group): void;
}

// bind registry for all groups, we can use it to query group by entity id
export const GroupRegistry = Symbol('GroupRegistry');
export const GroupOrShape = Symbol('GroupOrShape');

/**
 * Provide abilities in scene graph, such as:
 * * transform `translate/rotate/scale`
 * * add/remove child
 * * visibility and z-index
 *
 * Those abilities are implemented with those components: `Transform/Hierarchy/Sortable/Visible`.
 */
@injectable()
export class Group implements IGroup {
  protected entity: Entity;
  protected container: Container;
  protected world: World;
  protected config: Record<string, any> = {};

  @inject(System)
  @named(SceneGraph.tag)
  private sceneGraph: SceneGraph;

  @inject(GroupRegistry)
  private groupRegistry: (entityName: string) => Group;

  init(container: Container, world: World, entity: Entity, type: string, config: GroupCfg) {
    this.entity = entity;
    this.container = container;
    this.world = world;
    entity.addComponent(Transform);
    entity.addComponent(Hierarchy);
    entity.addComponent(Sortable);
    entity.addComponent(Visible);

    if (config.visible) {
      this.show();
    } else {
      this.hide();
    }

    if (config.zIndex) {
      this.setZIndex(config.zIndex);
    }

    // assign name, id to config
    // eg. group.get('name')
    this.config = config;

    // TODO: capture
  }

  getEntity() {
    return this.entity;
  }

  /**
   * compatible with G 3.0
   *
   * is `Group` or `Shape`
   */
  isGroup() {
    return true;
  }

  /**
   * compatible with G 3.0
   */
  get(key: string) {
    return this.config[key];
  }
  set(key: string, value: any) {
    this.config[key] = value;
  }

  /** scene graph operations */

  /**
   * compatible with G 3.0
   *
   * whether current group contains a shape
   */
  contains(shape: Shape | Group) {
    return this.contain(shape);
  }
  contain(shape: Shape | Group) {
    const child = shape.getEntity();
    const hierarchy = child.getComponent(Hierarchy);

    return !!(hierarchy && hierarchy.parent === this.entity);
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
    const hierarchy = this.entity.getComponent(Hierarchy);
    if (hierarchy.parent) {
      return this.groupRegistry(hierarchy.parent.getName());
    }

    return null;
  }

  /**
   * compatible with G 3.0
   *
   * return children groups
   */
  getChildren() {
    const hierarchy = this.entity.getComponent(Hierarchy);
    return hierarchy.children.map((entity) => this.groupRegistry(entity.getName()));
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
        const group = this.groupRegistry(entity.getName());
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
        const group = this.groupRegistry(entity.getName());
        if (filter(group)) {
          groups.push(group);
        }
      }
    });
    return groups;
  }

  /**
   * compatible with G 3.0
   */
  findById(id: string): Group | null {
    return this.find((element) => {
      return element.get('id') === id;
    });
  }
  findByClassName(className: string): Group | null {
    return this.find((element) => {
      return element.get('className') === className;
    });
  }
  findAllByName(name: string): Group[] {
    return this.findAll((element) => {
      return element.get('name') === name;
    });
  }

  /**
   * compatible with G 3.0
   *
   * add child group or shape
   */
  add(shape: Shape | Group) {
    this.sceneGraph.attach(shape.getEntity(), this.entity);
  }

  /**
   * compatible with G 3.0
   *
   * remove child and destroy it by default
   */
  remove(shape: Shape | Group, destroy = true) {
    const entity = shape.getEntity();
    this.sceneGraph.detach(entity);
    if (destroy) {
      this.sceneGraph.visit(this.entity, (e) => {
        e.destroy();
      });
    }
  }
  removeChild(shape: Shape | Group, destroy = true) {
    this.remove(shape, destroy);
  }

  removeChildren(destroy = true) {
    const hierarchy = this.entity.getComponent(Hierarchy);
    this.sceneGraph.detachChildren(this.entity);
    if (destroy) {
      hierarchy.children.forEach((entity) => {
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
    const transform = this.entity.getComponent(Transform);
    transform.setPosition(createVec3(position, y, z));
    return this;
  }

  /**
   * set position in local space
   */
  setLocalPosition(position: vec3 | number, y: number = 0, z: number = 0) {
    const transform = this.entity.getComponent(Transform);
    transform.setLocalPosition(createVec3(position, y, z));
    return this;
  }

  /**
   * translate in world space
   */
  translate(position: vec3 | number, y: number = 0, z: number = 0) {
    const transform = this.entity.getComponent(Transform);
    transform.translate(createVec3(position, y, z));
    return this;
  }

  /**
   * translate in local space
   */
  translateLocal(position: vec3 | number, y: number = 0, z: number = 0) {
    const transform = this.entity.getComponent(Transform);
    transform.translateLocal(createVec3(position, y, z));
    return this;
  }

  getPosition() {
    const transform = this.entity.getComponent(Transform);
    return transform.getPosition();
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
    if (typeof scaling === 'number') {
      y = y || scaling;
      z = z || scaling;
      scaling = createVec3(scaling, y, z);
    }

    const transform = this.entity.getComponent(Transform);
    transform.scaleLocal(scaling);
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

    const transform = this.entity.getComponent(Transform);
    transform.setLocalScale(scaling);
    return this;
  }

  /**
   * get scaling in local space
   */
  getLocalScale() {
    const transform = this.entity.getComponent(Transform);
    return transform.getLocalScale();
  }

  /**
   * get scaling in world space
   */
  getScale() {
    const transform = this.entity.getComponent(Transform);
    return transform.getScale();
  }

  /**
   * compatible with G 3.0
   *
   * rotate with z axis,
   * same as rotating around origin (0, 0, 1) in canvas coords
   */
  rotate(radian: number) {
    this.rotateAtPoint(0, 0, radian);
    return this;
  }

  /**
   * compatible with G 3.0
   *
   * rotate around Z axis in local space in radians
   */
  rotateAtStart(radian: number) {
    const tc = this.entity.getComponent(Transform);
    const [x, y] = tc.getLocalPosition();
    this.rotateAtPoint(x, y, radian);

    return this;
  }

  /**
   * compatible with G 3.0
   *
   * 以任意点 (x, y) 为中心旋转元素
   */
  rotateAtPoint(x: number, y: number, radians: number) {
    const matrix = this.getMatrix();
    const newMatrix = transform(matrix, [
      ['t', -x, -y],
      ['r', radians],
      ['t', x, y],
    ]);
    this.setMatrix(newMatrix);

    // const transform = this.entity.getComponent(Transform);
    // transform.rotateLocal(quat.fromEuler(quat.create(), 0, 0, rad2deg(radians)));

    return this;
  }

  /**
   * compatible with G 3.0
   *
   * return mat3x3
   */
  getMatrix(): number[] {
    const transform = this.entity.getComponent(Transform);
    const [ex, ey, ez] = getEuler(vec3.create(), transform.getLocalRotation());
    const [x, y] = transform.getLocalPosition();
    const [scaleX, scaleY] = transform.getLocalScale();

    return [...fromRotationTranslationScale(ex || ez, x, y, scaleX, scaleY)];
  }

  /**
   * compatible with G 3.0
   *
   * set mat3x3
   */
  setMatrix(mat: number[]) {
    const mat3x3 = mat3.fromValues(
      ...(mat as [number, number, number, number, number, number, number, number, number])
    );
    const translation = getTranslation(vec2.create(), mat3x3);
    const scaling = getScaling(vec2.create(), mat3x3);
    const radians = getRotationInRadians(mat3x3);
    const transform = this.entity.getComponent(Transform);

    transform
      .setLocalPosition(translation[0], translation[1], 0)
      .setLocalRotation(quat.fromEuler(quat.create(), 0, 0, rad2deg(radians)))
      .setLocalScale(scaling[0], scaling[1], 1);
  }

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
    const hierarchy = this.entity.getComponent(Hierarchy);
    const sortable = this.entity.getComponent(Sortable);
    const parentEntity = hierarchy.parent;
    if (parentEntity) {
      const parent = parentEntity.getComponent(Hierarchy);
      sortable.zIndex = Math.max(...parent.children.map((e) => e.getComponent(Sortable).zIndex)) + 1;
      // need re-sort
      this.sceneGraph.setTopologicalSortDirty(true);
    }
  }

  /**
   * send to back in current group
   */
  toBack() {
    const hierarchy = this.entity.getComponent(Hierarchy);
    const sortable = this.entity.getComponent(Sortable);
    const parentEntity = hierarchy.parent;
    if (parentEntity) {
      const parent = parentEntity.getComponent(Hierarchy);
      sortable.zIndex = Math.min(...parent.children.map((e) => e.getComponent(Sortable).zIndex)) - 1;
      // need re-sort
      this.sceneGraph.setTopologicalSortDirty(true);
    }
  }

  /**
   * show group, which will also change visibility of its children in hierarchy
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
   * hide group, which will also change visibility of its children in hierarchy
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
