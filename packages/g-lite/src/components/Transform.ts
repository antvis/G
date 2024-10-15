import type { mat4, quat, vec2, vec3 } from 'gl-matrix';

/**
 * do RTS transformation for 2D/3D
 */
export interface Transform {
  dirtyFlag: boolean;
  localDirtyFlag: boolean;

  frozen: boolean;
  /**
   * 在首屏渲染前进行过预计算（通常是在首屏渲染前调用了 getBounds API）
   */
  computed: boolean;

  /**
   * local space RTS
   */
  localPosition: vec3;
  localRotation: quat;
  localScale: vec3;
  localTransform: mat4;

  /**
   * @see https://www.w3.org/TR/css-transforms-1/#SkewDefined
   */
  localSkew: vec2;

  /**
   * world space RTS
   */
  position: vec3;
  rotation: quat;
  scaling: vec3;
  worldTransform: mat4;

  /**
   * the origin of scaling and rotation
   */
  origin: vec3;
}
