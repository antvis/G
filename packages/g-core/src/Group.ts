import { Entity, System } from '@antv/g-ecs';
import { vec3 } from 'gl-matrix';
import { inject, injectable, named } from 'inversify';
import { Hierarchy, Transform } from './components';
import { Shape } from './Shape';
import { SceneGraph } from './systems';
import { createVec3 } from './utils/math';

export interface IGroup {
  getEntity(): Entity;
  add(shape: Shape | Group): void;
  remove(shape: Shape | Group): void;
}

/**
 * Provide abilities in scene graph, such as:
 * * transform `translate/rotate/scale`
 * * add/remove child
 *
 * Those abilities are implemented with 2 components: `Transform` and `Hierarchy`.
 */
@injectable()
export class Group implements IGroup {
  protected entity: Entity;

  @inject(System)
  @named(SceneGraph.tag)
  private sceneGraph: SceneGraph;

  init(entity: Entity) {
    this.entity = entity;
    entity.addComponent(Transform);
    entity.addComponent(Hierarchy);
  }

  getEntity() {
    return this.entity;
  }

  add(shape: Shape | Group) {
    this.sceneGraph.attach(shape.getEntity(), this.entity);
  }

  remove(shape: Shape | Group) {
    this.sceneGraph.detach(shape.getEntity());
  }

  removeChildren() {
    this.sceneGraph.detachChildren(this.entity);
  }

  // compatible with G 3.0
  moveTo(position: vec3 | number, y: number = 0, z: number = 0) {
    this.setPosition(createVec3(position, y, z));
  }
  move(position: vec3 | number, y: number = 0, z: number = 0) {
    this.setPosition(createVec3(position, y, z));
  }
  /**
   * set position in world space
   */
  setPosition(position: vec3 | number, y: number = 0, z: number = 0) {
    const transform = this.entity.getComponent(Transform);
    if (transform) {
      transform.setPosition(createVec3(position, y, z));
    }
  }

  /**
   * translate in world space
   */
  translate(position: vec3 | number, y: number = 0, z: number = 0) {
    const transform = this.entity.getComponent(Transform);
    if (transform) {
      transform.translate(createVec3(position, y, z));
    }
  }

  /**
   * translate in local space
   */
  translateLocal(position: vec3 | number, y: number = 0, z: number = 0) {
    const transform = this.entity.getComponent(Transform);
    if (transform) {
      transform.translateLocal(createVec3(position, y, z));
    }
  }

  scale() {}
}
