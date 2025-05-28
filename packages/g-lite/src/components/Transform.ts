import { mat4, quat, vec2, vec3 } from 'gl-matrix';

/**
 * do RTS transformation for 2D/3D
 */
export interface Transform {
  /**
   * Update flag for the world transformation matrix
   *
   * ! This flag should usually not be updated manually, it should be derived from the parent node's `dirtyFlag` and its own `localDirtyFlag`
   */
  dirtyFlag: boolean;
  localDirtyFlag: boolean;

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

/** shared objects */
const $vec3 = vec3.create();
/** shared objects */
const $mat4 = mat4.create();
/** shared objects */
const $quat = quat.create();

export function updateLocalTransform(transform: Transform) {
  if (!transform.localDirtyFlag) {
    return;
  }

  const hasSkew = transform.localSkew[0] !== 0 || transform.localSkew[1] !== 0;

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
      mat4.multiply(transform.localTransform, transform.localTransform, $mat4);
    }

    const scaling = mat4.fromRotationTranslationScaleOrigin(
      $mat4,
      quat.set($quat, 0, 0, 0, 1),
      vec3.set($vec3, 1, 1, 1),
      transform.localScale,
      transform.origin,
    );
    mat4.multiply(transform.localTransform, transform.localTransform, scaling);
  } else {
    const { localTransform, localPosition, localRotation, localScale, origin } =
      transform;

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

  transform.localDirtyFlag = false;
}

export function updateWorldTransform(
  transform: Transform,
  parentTransform: Transform,
) {
  if (!transform.dirtyFlag) {
    return;
  }

  if (!parentTransform) {
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
