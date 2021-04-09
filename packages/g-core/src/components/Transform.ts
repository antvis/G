import { mat4, quat, vec3 } from 'gl-matrix';
import { Component } from '@antv/g-ecs';

/**
 * do RTS transformation for 2D/3D
 */
export class Transform extends Component {
  static tag = 'c-transform';

  dirtyFlag = false;
  localDirtyFlag = false;

  /**
   * local space RTS
   */
  localPosition = vec3.fromValues(0, 0, 0);
  localRotation = quat.fromValues(0, 0, 0, 1);
  localScale = vec3.fromValues(1, 1, 1);
  localTransform = mat4.create();

  /**
   * world space RTS
   */
  position = vec3.fromValues(0, 0, 0);
  rotation = quat.fromValues(0, 0, 0, 1);
  scaling = vec3.fromValues(1, 1, 1);
  worldTransform = mat4.create();

  // /**
  //  * apply lerp to RTS, which can be used in camera animation
  //  *
  //  * @see https://xiaoiver.github.io/coding/2018/12/28/Camera-%E8%AE%BE%E8%AE%A1-%E4%B8%80.html
  //  */
  // lerp = (() => {
  //   const aS = vec3.create();
  //   const aR = quat.create();
  //   const aT = vec3.create();
  //   const bS = vec3.create();
  //   const bR = quat.create();
  //   const bT = vec3.create();
  //   return (a: Transform, b: Transform, t: number) => {
  //     this.setDirty();

  //     mat4.getScaling(aS, a.worldTransform);
  //     mat4.getTranslation(aT, a.worldTransform);
  //     mat4.getRotation(aR, a.worldTransform);
  //     mat4.getScaling(bS, b.worldTransform);
  //     mat4.getTranslation(bT, b.worldTransform);
  //     mat4.getRotation(bR, b.worldTransform);

  //     vec3.lerp(this.localScale, aS, bS, t);
  //     quat.slerp(this.localRotation, aR, bR, t);
  //     vec3.lerp(this.localPosition, aT, bT, t);
  //   };
  // })();
}
