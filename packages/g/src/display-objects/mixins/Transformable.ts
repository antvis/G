import { mat4, quat, vec2, vec3 } from 'gl-matrix';
import { isNil } from '@antv/util';
import { Element } from '../../dom';
import { createVec3, getEuler, rad2deg } from '../../utils';
import { container } from '../..';
import { SceneGraphService } from '../../services';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../../types';

export class Transformable<
  StyleProps extends BaseStyleProps = any,
  ParsedStyleProps extends ParsedBaseStyleProps = any,
> extends Element<StyleProps, ParsedStyleProps> {
  sceneGraphService = container.get<SceneGraphService>(SceneGraphService);

  setOrigin(position: vec3 | vec2 | number, y: number = 0, z: number = 0) {
    this.sceneGraphService.setOrigin(this, createVec3(position, y, z));
    this.attributes.origin = this.getOrigin();
    return this;
  }
  getOrigin(): vec3 {
    return this.sceneGraphService.getOrigin(this);
  }

  /**
   * set position in world space
   */
  setPosition(position: vec3 | vec2 | number, y: number = 0, z: number = 0) {
    this.sceneGraphService.setPosition(this, createVec3(position, y, z));
    this.syncLocalPosition();
    return this;
  }

  /**
   * set position in local space
   */
  setLocalPosition(position: vec3 | vec2 | number, y: number = 0, z: number = 0) {
    this.sceneGraphService.setLocalPosition(this, createVec3(position, y, z));
    this.syncLocalPosition();
    return this;
  }

  /**
   * translate in world space
   */
  translate(position: vec3 | vec2 | number, y: number = 0, z: number = 0) {
    this.sceneGraphService.translate(this, createVec3(position, y, z));
    this.syncLocalPosition();
    return this;
  }

  /**
   * translate in local space
   */
  translateLocal(position: vec3 | vec2 | number, y: number = 0, z: number = 0) {
    this.sceneGraphService.translateLocal(this, createVec3(position, y, z));
    this.syncLocalPosition();
    return this;
  }

  getPosition(): vec3 {
    return this.sceneGraphService.getPosition(this);
  }

  getLocalPosition(): vec3 {
    return this.sceneGraphService.getLocalPosition(this);
  }

  /**
   * compatible with G 3.0
   *
   * scaling in local space
   * scale(10) = scale(10, 10, 10)
   *
   * we can't set scale in world space
   */
  scale(scaling: vec3 | vec2 | number, y?: number, z?: number) {
    return this.scaleLocal(scaling, y, z);
  }
  scaleLocal(scaling: vec3 | vec2 | number, y?: number, z?: number) {
    if (typeof scaling === 'number') {
      y = y || scaling;
      z = z || scaling;
      scaling = createVec3(scaling, y, z);
    }
    this.sceneGraphService.scaleLocal(this, scaling);
    return this;
  }

  /**
   * set scaling in local space
   */
  setLocalScale(scaling: vec3 | vec2 | number, y?: number, z?: number) {
    if (typeof scaling === 'number') {
      y = y || scaling;
      z = z || scaling;
      scaling = createVec3(scaling, y, z);
    }

    this.sceneGraphService.setLocalScale(this, scaling);
    return this;
  }

  /**
   * get scaling in local space
   */
  getLocalScale(): vec3 {
    return this.sceneGraphService.getLocalScale(this);
  }

  /**
   * get scaling in world space
   */
  getScale(): vec3 {
    return this.sceneGraphService.getScale(this);
  }

  /**
   * only return degrees of Z axis in world space
   */
  getEulerAngles() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [ex, ey, ez] = getEuler(vec3.create(), this.sceneGraphService.getWorldTransform(this));
    return rad2deg(ez);
  }

  /**
   * only return degrees of Z axis in local space
   */
  getLocalEulerAngles() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [ex, ey, ez] = getEuler(vec3.create(), this.sceneGraphService.getLocalRotation(this));
    return rad2deg(ez);
  }

  /**
   * set euler angles(degrees) in world space
   */
  setEulerAngles(z: number) {
    this.sceneGraphService.setEulerAngles(this, 0, 0, z);
    return this;
  }

  /**
   * set euler angles(degrees) in local space
   */
  setLocalEulerAngles(z: number) {
    this.sceneGraphService.setLocalEulerAngles(this, 0, 0, z);
    return this;
  }

  rotateLocal(x: number, y?: number, z?: number) {
    if (isNil(y) && isNil(z)) {
      this.sceneGraphService.rotateLocal(this, 0, 0, x);
    } else {
      this.sceneGraphService.rotateLocal(this, x, y, z);
    }

    return this;
  }

  rotate(x: number, y?: number, z?: number) {
    if (isNil(y) && isNil(z)) {
      this.sceneGraphService.rotate(this, 0, 0, x);
    } else {
      this.sceneGraphService.rotate(this, x, y, z);
    }

    return this;
  }

  getRotation(): quat {
    return this.sceneGraphService.getRotation(this);
  }

  getLocalRotation(): quat {
    return this.sceneGraphService.getLocalRotation(this);
  }

  getLocalTransform(): mat4 {
    return this.sceneGraphService.getLocalTransform(this);
  }

  getWorldTransform(): mat4 {
    return this.sceneGraphService.getWorldTransform(this);
  }

  resetLocalTransform(): void {
    this.sceneGraphService.resetLocalTransform(this);
  }

  /**
   * sync style.x/y when local position changed
   *
   * Mixins may not declare private/protected properties
   * however, you can use ES2020 private fields
   */
  private syncLocalPosition() {
    const localPosition = this.getLocalPosition();
    this.attributes.x = localPosition[0];
    this.attributes.y = localPosition[1];
  }
}
