import { mat4, quat, vec3 } from 'gl-matrix';
import { Component } from '@antv/g-ecs';

/**
 * do RTS transformation for 2D/3D
 */
export class Transform extends Component {
  public static tag = 'c-transform';

  public dirtyFlag = true;
  public localDirtyFlag = true;

  public parent: Transform | null = null;

  /**
   * local space RTS
   */
  public localPosition = vec3.fromValues(0, 0, 0);
  public localRotation = quat.fromValues(0, 0, 0, 1);
  public localScale = vec3.fromValues(1, 1, 1);
  public localTransform = mat4.create();

  /**
   * world space RTS
   */
  public position = vec3.fromValues(0, 0, 0);
  public rotation = quat.fromValues(0, 0, 0, 1);
  public scaling = vec3.fromValues(1, 1, 1);
  public worldTransform = mat4.create();

  /**
   * apply matrix to local transform
   *
   * 对应 g 的 applyToMatrix
   * @see https://github.com/antvis/g/blob/master/packages/g-base/src/abstract/element.ts#L684-L689
   */
  public matrixTransform = (() => {
    const transformed = mat4.create();
    return (mat: mat4) => {
      mat4.multiply(transformed, this.getLocalTransform(), mat);
      mat4.getScaling(this.localScale, transformed);
      mat4.getTranslation(this.localPosition, transformed);
      mat4.getRotation(this.localRotation, transformed);
    };
  })();

  /**
   * rotate in world space
   */
  public rotate = (() => {
    const parentInvertRotation = quat.create();
    return (quaternion: quat) => {
      if (this.parent === null) {
        this.rotateLocal(quaternion);
      } else {
        const rot = this.getRotation();
        const parentRot = this.parent.getRotation();

        quat.copy(parentInvertRotation, parentRot);
        quat.invert(parentInvertRotation, parentInvertRotation);
        quat.multiply(parentInvertRotation, parentInvertRotation, quaternion);
        quat.multiply(this.localRotation, quaternion, rot);
        quat.normalize(this.localRotation, this.localRotation);
        this.setLocalDirty();
      }
      return this;
    };
  })();

  /**
   * rotate in local space
   */
  public rotateLocal = (() => {
    return (quaternion: quat) => {
      quat.multiply(this.localRotation, this.localRotation, quaternion);
      quat.normalize(this.localRotation, this.localRotation);
      this.setLocalDirty(true);
      return this;
    };
  })();

  /**
   * rotate in local space with pitch, yaw and roll (Euler angles)
   *
   * @see https://docs.microsoft.com/en-us/windows/win32/api/directxmath/nf-directxmath-xmquaternionrotationrollpitchyaw
   */
  public rotateRollPitchYaw = (() => {
    const quatX = quat.create();
    const quatY = quat.create();
    const quatZ = quat.create();
    // in degrees
    return (x: number, y: number, z: number) => {
      quat.fromEuler(quatX, x, 0, 0);
      quat.fromEuler(quatY, 0, y, 0);
      quat.fromEuler(quatZ, 0, 0, z);

      quat.multiply(this.localRotation, quatX, this.localRotation);
      quat.multiply(this.localRotation, this.localRotation, quatY);
      quat.multiply(this.localRotation, quatZ, this.localRotation);
      quat.normalize(this.localRotation, this.localRotation);

      this.setLocalDirty(true);
    };
  })();

  /**
   * set rotation in world space
   */
  public setRotation = (() => {
    const invParentRot = quat.create();

    return (rotation: quat) => {
      if (this.parent === null) {
        this.setLocalRotation(rotation);
      } else {
        quat.copy(invParentRot, this.parent.getRotation());
        quat.invert(invParentRot, invParentRot);
        quat.copy(this.localRotation, invParentRot);
        quat.mul(this.localRotation, this.localRotation, rotation);
        this.setLocalDirty(true);
      }
      return this;
    };
  })();

  /**
   * set rotation in local space
   */
  public setLocalRotation(rotation: quat) {
    quat.copy(this.localRotation, rotation);
    this.setLocalDirty(true);
    return this;
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
  public translate = (() => {
    const tr = vec3.create();

    return (translation: vec3 | number, y: number = 0, z: number = 0) => {
      if (typeof translation === 'number') {
        translation = vec3.fromValues(translation, y, z);
      }
      vec3.add(tr, this.getPosition(), translation);

      this.setPosition(tr);
      this.setDirty(true);
      return this;
    };
  })();

  /**
   * translate in local space
   *
   * @example
   * ```
   * translateLocal(x, y, z)
   * translateLocal(vec3(x, y, z))
   * ```
   */
  public translateLocal = (() => {
    return (translation: vec3 | number, y: number = 0, z: number = 0) => {
      if (typeof translation === 'number') {
        translation = vec3.fromValues(translation, y, z);
      }
      vec3.transformQuat(translation, translation, this.localRotation);
      vec3.add(this.localPosition, this.localPosition, translation);

      this.setLocalDirty(true);

      return this;
    };
  })();

  /**
   * move to position in world space
   *
   * 对应 g 原版的 move/moveTo
   * @see https://github.com/antvis/g/blob/master/packages/g-base/src/abstract/element.ts#L684-L689
   */
  public setPosition = (() => {
    const parentInvertMatrix = mat4.create();

    return (position: vec3 | number, y: number = 0, z: number = 0) => {
      if (typeof position === 'number') {
        position = vec3.fromValues(position, y, z);
      }
      this.position = position;

      if (this.parent === null) {
        this.setLocalPosition(position);
      } else {
        mat4.copy(parentInvertMatrix, this.parent.worldTransform);
        mat4.invert(parentInvertMatrix, parentInvertMatrix);
        vec3.transformMat4(this.localPosition, position, parentInvertMatrix);
        this.setLocalDirty(true);
      }
      return this;
    };
  })();

  /**
   * move to position in local space
   */
  public setLocalPosition(position: vec3 | number, y: number = 0, z: number = 0) {
    if (typeof position === 'number') {
      position = vec3.fromValues(position, y, z);
    }
    vec3.copy(this.localPosition, position);
    this.setLocalDirty();
    return this;
  }

  /**
   * scale in local space
   */
  public scaleLocal(scaling: vec3 | number, y: number = 1, z: number = 1) {
    if (typeof scaling === 'number') {
      scaling = vec3.fromValues(scaling, y, z);
    }
    vec3.multiply(this.localScale, this.localScale, scaling);
    this.setLocalDirty();
    return this;
  }

  public setLocalScale(scaling: vec3 | number, y: number = 1, z: number = 1) {
    if (typeof scaling === 'number') {
      scaling = vec3.fromValues(scaling, y, z);
    }
    vec3.copy(this.localScale, scaling);
    this.setLocalDirty();
    return this;
  }

  public setDirty(value = true) {
    if (value) {
      this.dirtyFlag = true;
    } else {
      this.dirtyFlag = false;
    }
  }

  public setLocalDirty(value = true) {
    if (value) {
      this.localDirtyFlag = true;
      this.setDirty(true);
    } else {
      this.localDirtyFlag = false;
    }
  }

  public updateTransform() {
    if (this.localDirtyFlag) {
      this.getLocalTransform();
    }
    if (this.dirtyFlag) {
      if (this.parent === null) {
        mat4.copy(this.worldTransform, this.getLocalTransform());
        this.setDirty(false);
      }
    }
  }

  public updateTransformWithParent(parent: Transform) {
    // TODO: should we support scale compensation?
    // @see https://github.com/playcanvas/engine/issues/1077#issuecomment-359765557
    mat4.multiply(this.worldTransform, parent.worldTransform, this.getLocalTransform());
  }

  public applyTransform() {
    this.setDirty();

    mat4.getScaling(this.localScale, this.worldTransform);
    mat4.getTranslation(this.localPosition, this.worldTransform);
    mat4.getRotation(this.localRotation, this.worldTransform);
  }

  public clearTransform() {
    this.setDirty();
    this.setLocalDirty();
    this.localPosition = vec3.fromValues(0, 0, 0);
    this.localRotation = quat.fromValues(0, 0, 0, 1);
    this.localScale = vec3.fromValues(1, 1, 1);
  }

  public getLocalPosition() {
    return this.localPosition;
  }

  public getLocalRotation() {
    return this.localRotation;
  }

  public getLocalScale() {
    return this.localScale;
  }

  public getLocalTransform() {
    if (this.localDirtyFlag) {
      mat4.fromRotationTranslationScale(this.localTransform, this.localRotation, this.localPosition, this.localScale);
      this.setLocalDirty(false);
    }
    return this.localTransform;
  }

  public getWorldTransform() {
    if (!this.localDirtyFlag && !this.dirtyFlag) {
      return this.worldTransform;
    }

    if (this.parent) {
      this.parent.getWorldTransform();
    }

    this.updateTransform();

    return this.worldTransform;
  }

  public getPosition() {
    mat4.getTranslation(this.position, this.getWorldTransform());
    return this.position;
  }

  public getRotation() {
    mat4.getRotation(this.rotation, this.getWorldTransform());
    return this.rotation;
  }

  public getScale() {
    mat4.getScaling(this.scaling, this.getWorldTransform());
    return this.scaling;
  }

  /**
   * apply lerp to RTS, which can be used in camera animation
   *
   * @see https://xiaoiver.github.io/coding/2018/12/28/Camera-%E8%AE%BE%E8%AE%A1-%E4%B8%80.html
   */
  public lerp = (() => {
    const aS = vec3.create();
    const aR = quat.create();
    const aT = vec3.create();
    const bS = vec3.create();
    const bR = quat.create();
    const bT = vec3.create();
    return (a: Transform, b: Transform, t: number) => {
      this.setDirty();

      mat4.getScaling(aS, a.worldTransform);
      mat4.getTranslation(aT, a.worldTransform);
      mat4.getRotation(aR, a.worldTransform);
      mat4.getScaling(bS, b.worldTransform);
      mat4.getTranslation(bT, b.worldTransform);
      mat4.getRotation(bR, b.worldTransform);

      vec3.lerp(this.localScale, aS, bS, t);
      quat.slerp(this.localRotation, aR, bR, t);
      vec3.lerp(this.localPosition, aT, bT, t);
    };
  })();
}
