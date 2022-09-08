import { isNumber, isString } from '@antv/util';
import { EventEmitter } from 'eventemitter3';
import type { vec2 } from 'gl-matrix';
import { mat3, mat4, quat, vec3, vec4 } from 'gl-matrix';
import { GlobalContainer, Syringe } from 'mana-syringe';
import type { Canvas } from '../Canvas';
import { Frustum } from '../shapes';
import type { TypeEasingFunction } from '../types';
import { ParseEasingFunction } from '../types';
import { createVec3, getAngle, makePerspective } from '../utils/math';
import type { Landmark } from './Landmark';
// import { DisplayObject } from '../display-objects';

export const DefaultCamera = Syringe.defineToken('');

export enum CameraType {
  /**
   * Performs all the rotational operations with the focal point instead of the camera position.
   * This type of camera is useful in applications(like CAD) where 3D objects are being designed or explored.
   * Camera cannot orbits over the north & south poles.
   * @see http://voxelent.com/tutorial-cameras/
   *
   * In Three.js it's used in OrbitControls.
   * @see https://threejs.org/docs/#examples/zh/controls/OrbitControls
   */
  ORBITING,
  /**
   * It's similar to the ORBITING camera, but it allows the camera to orbit over the north or south poles.
   *
   * In Three.js it's used in OrbitControls.
   * @see https://threejs.org/docs/#examples/en/controls/TrackballControls
   */
  EXPLORING,
  /**
   * Performs all the rotational operations with the camera position.
   * It's useful in first person shooting games.
   * Camera cannot orbits over the north & south poles.
   *
   * In Three.js it's used in FirstPersonControls.
   * @see https://threejs.org/docs/#examples/en/controls/FirstPersonControls
   */
  TRACKING,
}

/**
 * CameraType must be TRACKING
 */
export enum CameraTrackingMode {
  DEFAULT,
  ROTATIONAL,
  TRANSLATIONAL,
  CINEMATIC,
}

export enum CameraProjectionMode {
  ORTHOGRAPHIC,
  PERSPECTIVE,
}

export const CameraEvent = {
  UPDATED: 'updated',
};

const DEG_2_RAD = Math.PI / 180;
const RAD_2_DEG = 180 / Math.PI;
const MIN_DISTANCE = 0.0002;

/**
 * 参考「WebGL Insights - 23.Designing Cameras for WebGL Applications」，基于 Responsible Camera 思路设计
 * @see https://github.com/d13g0/nucleo.js/blob/master/source/camera/Camera.js
 *
 * 保存相机参数，定义相机动作：
 * 1. dolly 沿 n 轴移动
 * 2. pan 沿 u v 轴移动
 * 3. rotate 以方位角旋转
 * 4. 移动到 Landmark，具有平滑的动画效果，其间禁止其他用户交互
 */

export class Camera extends EventEmitter {
  canvas: Canvas;

  /**
   * 相机矩阵
   */
  matrix = mat4.create();

  /**
   * u 轴
   * @see http://learnwebgl.brown37.net/07_cameras/camera_introduction.html#a-camera-definition
   */
  private right = vec3.fromValues(1, 0, 0);

  /**
   * v 轴 +Y is down
   */
  private up = vec3.fromValues(0, 1, 0);

  /**
   * n 轴 +Z is inside
   */
  private forward = vec3.fromValues(0, 0, 1);

  /**
   * 相机位置
   */
  private position = vec3.fromValues(0, 0, 1);

  /**
   * 视点位置
   */
  private focalPoint = vec3.fromValues(0, 0, 0);

  /**
   * 视点到相机位置的向量
   * focalPoint - position
   */
  private distanceVector = vec3.fromValues(0, 0, -1);

  /**
   * 相机位置到视点距离
   * length(focalPoint - position)
   */
  private distance = 1;

  /**
   * @see https://en.wikipedia.org/wiki/Azimuth
   */
  private azimuth = 0;
  private elevation = 0;
  private roll = 0;
  private relAzimuth = 0;
  private relElevation = 0;
  private relRoll = 0;

  /**
   * 沿 n 轴移动时，保证移动速度从快到慢
   */
  private dollyingStep = 0;
  private maxDistance = Infinity;
  private minDistance = -Infinity;

  /**
   * zoom factor of the camera, default is 1
   * eg. https://threejs.org/docs/#api/en/cameras/OrthographicCamera.zoom
   */
  private zoom = 1;

  /**
   * invert the horizontal coordinate system HCS
   */
  private rotateWorld = false;

  /**
   * 投影矩阵参数
   */

  /**
   * field of view [0-360]
   * @see http://en.wikipedia.org/wiki/Angle_of_view
   */
  private fov = 30;
  private near = 0.1;
  private far = 1000;
  private aspect = 1;
  private left: number;
  private rright: number;
  private top: number;
  private bottom: number;
  private projectionMatrix = mat4.create();
  private projectionMatrixInverse = mat4.create();
  private jitteredProjectionMatrix: mat4 | undefined = undefined;

  private view:
    | {
        enabled: boolean;
        fullWidth: number;
        fullHeight: number;
        offsetX: number;
        offsetY: number;
        width: number;
        height: number;
      }
    | undefined;
  private enableUpdate = true;

  // private following = undefined;

  private type = CameraType.EXPLORING;
  private trackingMode = CameraTrackingMode.DEFAULT;
  private projectionMode = CameraProjectionMode.PERSPECTIVE;

  /**
   * for culling use
   */
  private frustum: Frustum = new Frustum();

  /**
   * switch between multiple landmarks
   */
  private landmarks: Landmark[] = [];
  private landmarkAnimationID: number | undefined;

  /**
   * ortho matrix for Canvas2D & SVG
   */
  private orthoMatrix: mat4 = mat4.create();

  constructor(type = CameraType.EXPLORING, trackingMode = CameraTrackingMode.DEFAULT) {
    super();
    this.setType(type, trackingMode);
  }

  isOrtho() {
    return this.projectionMode === CameraProjectionMode.ORTHOGRAPHIC;
  }

  getProjectionMode() {
    return this.projectionMode;
  }

  getPerspective() {
    // account for TAA
    return this.jitteredProjectionMatrix || this.projectionMatrix;
  }

  getPerspectiveInverse() {
    return this.projectionMatrixInverse;
  }

  getFrustum() {
    return this.frustum;
  }

  getPosition() {
    return this.position;
  }

  getFocalPoint() {
    return this.focalPoint;
  }

  getDollyingStep() {
    return this.dollyingStep;
  }

  getNear() {
    return this.near;
  }

  getFar() {
    return this.far;
  }

  getZoom() {
    return this.zoom;
  }

  getOrthoMatrix() {
    return this.orthoMatrix;
  }

  getView() {
    return this.view;
  }

  setEnableUpdate(enabled: boolean) {
    this.enableUpdate = enabled;
  }

  setType(type: CameraType, trackingMode?: CameraTrackingMode) {
    this.type = type;
    if (this.type === CameraType.EXPLORING) {
      this.setWorldRotation(true);
    } else {
      this.setWorldRotation(false);
    }
    this._getAngles();

    if (this.type === CameraType.TRACKING && trackingMode !== undefined) {
      this.setTrackingMode(trackingMode);
    }
    return this;
  }

  setProjectionMode(projectionMode: CameraProjectionMode) {
    this.projectionMode = projectionMode;
    return this;
  }

  setTrackingMode(trackingMode: CameraTrackingMode) {
    if (this.type !== CameraType.TRACKING) {
      throw new Error('Impossible to set a tracking mode if the camera is not of tracking type');
    }
    this.trackingMode = trackingMode;
    return this;
  }

  /**
   * If flag is true, it reverses the azimuth and elevation angles.
   * Subsequent calls to rotate, setAzimuth, setElevation,
   * changeAzimuth or changeElevation will cause the inverted effect.
   * setRoll or changeRoll is not affected by this method.
   *
   * This inversion is useful when one wants to simulate that the world
   * is moving, instead of the camera.
   *
   * By default the camera angles are not reversed.
   * @param {Boolean} flag the boolean flag to reverse the angles.
   */
  setWorldRotation(flag: boolean) {
    this.rotateWorld = flag;
    this._getAngles();
    return this;
  }

  /**
   * 计算 MV 矩阵，为相机矩阵的逆矩阵
   */
  getViewTransform(): mat4 {
    return mat4.invert(mat4.create(), this.matrix);
  }

  getWorldTransform(): mat4 {
    return this.matrix;
  }

  jitterProjectionMatrix(x: number, y: number) {
    const translation = mat4.fromTranslation(mat4.create(), [x, y, 0]);

    this.jitteredProjectionMatrix = mat4.multiply(
      mat4.create(),
      translation,
      this.projectionMatrix,
    );
  }

  clearJitterProjectionMatrix() {
    this.jitteredProjectionMatrix = undefined;
  }

  /**
   * 设置相机矩阵
   */
  setMatrix(matrix: mat4) {
    this.matrix = matrix;
    this._update();
    return this;
  }

  setFov(fov: number) {
    this.setPerspective(this.near, this.far, fov, this.aspect);
    return this;
  }

  setAspect(aspect: number) {
    this.setPerspective(this.near, this.far, this.fov, aspect);
    return this;
  }

  setNear(near: number) {
    if (this.projectionMode === CameraProjectionMode.PERSPECTIVE) {
      this.setPerspective(near, this.far, this.fov, this.aspect);
    } else {
      this.setOrthographic(this.left, this.rright, this.top, this.bottom, near, this.far);
    }
    return this;
  }

  setFar(far: number) {
    if (this.projectionMode === CameraProjectionMode.PERSPECTIVE) {
      this.setPerspective(this.near, far, this.fov, this.aspect);
    } else {
      this.setOrthographic(this.left, this.rright, this.top, this.bottom, this.near, far);
    }
    return this;
  }

  /**
   * Sets an offset in a larger frustum, used in PixelPicking
   */
  setViewOffset(
    fullWidth: number,
    fullHeight: number,
    x: number,
    y: number,
    width: number,
    height: number,
  ) {
    this.aspect = fullWidth / fullHeight;
    if (this.view === undefined) {
      this.view = {
        enabled: true,
        fullWidth: 1,
        fullHeight: 1,
        offsetX: 0,
        offsetY: 0,
        width: 1,
        height: 1,
      };
    }

    this.view.enabled = true;
    this.view.fullWidth = fullWidth;
    this.view.fullHeight = fullHeight;
    this.view.offsetX = x;
    this.view.offsetY = y;
    this.view.width = width;
    this.view.height = height;

    if (this.projectionMode === CameraProjectionMode.PERSPECTIVE) {
      this.setPerspective(this.near, this.far, this.fov, this.aspect);
    } else {
      this.setOrthographic(this.left, this.rright, this.top, this.bottom, this.near, this.far);
    }
    return this;
  }

  clearViewOffset() {
    if (this.view !== undefined) {
      this.view.enabled = false;
    }

    if (this.projectionMode === CameraProjectionMode.PERSPECTIVE) {
      this.setPerspective(this.near, this.far, this.fov, this.aspect);
    } else {
      this.setOrthographic(this.left, this.rright, this.top, this.bottom, this.near, this.far);
    }
    return this;
  }

  setZoom(zoom: number) {
    this.zoom = zoom;
    if (this.projectionMode === CameraProjectionMode.ORTHOGRAPHIC) {
      this.setOrthographic(this.left, this.rright, this.top, this.bottom, this.near, this.far);
    } else if (this.projectionMode === CameraProjectionMode.PERSPECTIVE) {
      this.setPerspective(this.near, this.far, this.fov, this.aspect);
    }
    return this;
  }

  setPerspective(near: number, far: number, fov: number, aspect: number) {
    this.projectionMode = CameraProjectionMode.PERSPECTIVE;
    this.fov = fov;
    this.near = near;
    this.far = far;
    this.aspect = aspect;

    let top = (this.near * Math.tan(DEG_2_RAD * 0.5 * this.fov)) / this.zoom;
    let height = 2 * top;
    let width = this.aspect * height;
    let left = -0.5 * width;

    if (this.view?.enabled) {
      const fullWidth = this.view.fullWidth;
      const fullHeight = this.view.fullHeight;

      left += (this.view.offsetX * width) / fullWidth;
      top -= (this.view.offsetY * height) / fullHeight;
      width *= this.view.width / fullWidth;
      height *= this.view.height / fullHeight;
    }

    makePerspective(this.projectionMatrix, left, left + width, top, top - height, near, this.far);
    // flipY since the origin of OpenGL/WebGL is bottom-left compared with top-left in Canvas2D
    mat4.scale(this.projectionMatrix, this.projectionMatrix, vec3.fromValues(1, -1, 1));

    mat4.invert(this.projectionMatrixInverse, this.projectionMatrix);

    this.triggerUpdate();
    return this;
  }

  setOrthographic(l: number, r: number, t: number, b: number, near: number, far: number) {
    this.projectionMode = CameraProjectionMode.ORTHOGRAPHIC;
    this.rright = r;
    this.left = l;
    this.top = t;
    this.bottom = b;
    this.near = near;
    this.far = far;

    const dx = (this.rright - this.left) / (2 * this.zoom);
    const dy = (this.top - this.bottom) / (2 * this.zoom);
    const cx = (this.rright + this.left) / 2;
    const cy = (this.top + this.bottom) / 2;

    let left = cx - dx;
    let right = cx + dx;
    let top = cy + dy;
    let bottom = cy - dy;

    if (this.view?.enabled) {
      const scaleW = (this.rright - this.left) / this.view.fullWidth / this.zoom;
      const scaleH = (this.top - this.bottom) / this.view.fullHeight / this.zoom;

      left += scaleW * this.view.offsetX;
      right = left + scaleW * this.view.width;
      top -= scaleH * this.view.offsetY;
      bottom = top - scaleH * this.view.height;
    }

    mat4.ortho(this.projectionMatrix, left, right, bottom, top, near, far);

    // flipY since the origin of OpenGL/WebGL is bottom-left compared with top-left in Canvas2D
    mat4.scale(this.projectionMatrix, this.projectionMatrix, vec3.fromValues(1, -1, 1));

    mat4.invert(this.projectionMatrixInverse, this.projectionMatrix);

    this._getOrthoMatrix();
    this.triggerUpdate();
    return this;
  }

  /**
   * Move the camera in world coordinates.
   * It will keep looking at the current focal point.
   *
   * support scalars or vectors.
   * @example
   * setPosition(1, 2, 3);
   * setPosition([1, 2, 3]);
   */
  setPosition(x: number | vec2 | vec3, y: number = this.position[1], z: number = this.position[2]) {
    const position = createVec3(x, y, z);
    this._setPosition(position);
    this.setFocalPoint(this.focalPoint);

    this.triggerUpdate();
    return this;
  }

  /**
   * Sets the focal point of this camera in world coordinates.
   *
   * support scalars or vectors.
   * @example
   * setFocalPoint(1, 2, 3);
   * setFocalPoint([1, 2, 3]);
   */
  setFocalPoint(
    x: number | vec2 | vec3,
    y: number = this.focalPoint[1],
    z: number = this.focalPoint[2],
  ) {
    let up = vec3.fromValues(0, 1, 0);
    this.focalPoint = createVec3(x, y, z);

    if (this.trackingMode === CameraTrackingMode.CINEMATIC) {
      const d = vec3.subtract(vec3.create(), this.focalPoint, this.position);
      x = d[0];
      y = d[1] as number;
      z = d[2] as number;
      const r = vec3.length(d);
      const el = Math.asin(y / r) * RAD_2_DEG;
      const az = 90 + Math.atan2(z, x) * RAD_2_DEG;
      const m = mat4.create();
      mat4.rotateY(m, m, az * DEG_2_RAD);
      mat4.rotateX(m, m, el * DEG_2_RAD);
      up = vec3.transformMat4(vec3.create(), [0, 1, 0], m);
    }

    mat4.invert(this.matrix, mat4.lookAt(mat4.create(), this.position, this.focalPoint, up));

    this._getAxes();
    this._getDistance();
    this._getAngles();
    this.triggerUpdate();
    return this;
  }

  getDistance() {
    return this.distance;
  }

  /**
   * Moves the camera towards/from the focal point.
   */
  setDistance(d: number) {
    if (this.distance === d || d < 0) {
      return this;
    }

    this.distance = d;

    if (this.distance < MIN_DISTANCE) {
      this.distance = MIN_DISTANCE;
    }
    this.dollyingStep = this.distance / 100;

    const pos = vec3.create();
    d = this.distance;
    const n = this.forward;
    const f = this.focalPoint;

    pos[0] = d * n[0] + f[0];
    pos[1] = d * n[1] + f[1];
    pos[2] = d * n[2] + f[2];

    this._setPosition(pos);
    this.triggerUpdate();
    return this;
  }

  setMaxDistance(d: number) {
    this.maxDistance = d;
    return this;
  }

  setMinDistance(d: number) {
    this.minDistance = d;
    return this;
  }

  // /**
  //  * Changes the initial azimuth of the camera
  //  */
  // changeAzimuth(az: number) {
  //   this.setAzimuth(this.azimuth + az);
  //   this.triggerUpdate();
  //   return this;
  // }

  // /**
  //  * Changes the initial elevation of the camera
  //  */
  // changeElevation(el: number) {
  //   this.setElevation(this.elevation + el);
  //   this.triggerUpdate();
  //   return this;
  // }

  // /**
  //  * Changes the initial roll of the camera
  //  */
  // changeRoll(rl: number) {
  //   this.setRoll(this.roll + rl);
  //   this.triggerUpdate();
  //   return this;
  // }

  /**
   * 设置相机方位角，不同相机模式下需要重新计算相机位置或者是视点位置
   * the azimuth in degrees
   */
  setAzimuth(az: number) {
    this.azimuth = getAngle(az);
    this.computeMatrix();

    this._getAxes();
    if (this.type === CameraType.ORBITING || this.type === CameraType.EXPLORING) {
      this._getPosition();
    } else if (this.type === CameraType.TRACKING) {
      this._getFocalPoint();
    }

    this.triggerUpdate();
    return this;
  }

  getAzimuth() {
    return this.azimuth;
  }

  /**
   * 设置相机方位角，不同相机模式下需要重新计算相机位置或者是视点位置
   */
  setElevation(el: number) {
    this.elevation = getAngle(el);
    this.computeMatrix();

    this._getAxes();
    if (this.type === CameraType.ORBITING || this.type === CameraType.EXPLORING) {
      this._getPosition();
    } else if (this.type === CameraType.TRACKING) {
      this._getFocalPoint();
    }

    this.triggerUpdate();
    return this;
  }

  getElevation() {
    return this.elevation;
  }

  /**
   * 设置相机方位角，不同相机模式下需要重新计算相机位置或者是视点位置
   */
  setRoll(angle: number) {
    this.roll = getAngle(angle);
    this.computeMatrix();

    this._getAxes();
    if (this.type === CameraType.ORBITING || this.type === CameraType.EXPLORING) {
      this._getPosition();
    } else if (this.type === CameraType.TRACKING) {
      this._getFocalPoint();
    }

    this.triggerUpdate();
    return this;
  }

  getRoll() {
    return this.roll;
  }

  /**
   * Changes the azimuth and elevation with respect to the current camera axes
   * @param {Number} azimuth the relative azimuth
   * @param {Number} elevation the relative elevation
   * @param {Number} roll the relative roll
   */
  rotate(azimuth: number, elevation: number, roll: number) {
    this.relElevation = getAngle(elevation);
    this.relAzimuth = getAngle(azimuth);
    this.relRoll = getAngle(roll);
    this.elevation += this.relElevation;
    this.azimuth += this.relAzimuth;
    this.roll += this.relRoll;

    if (this.type === CameraType.EXPLORING) {
      const rotX = quat.setAxisAngle(
        quat.create(),
        [1, 0, 0],
        (this.rotateWorld ? 1 : -1) * this.relElevation * DEG_2_RAD,
      );
      const rotY = quat.setAxisAngle(
        quat.create(),
        [0, 1, 0],
        (this.rotateWorld ? 1 : -1) * this.relAzimuth * DEG_2_RAD,
      );

      const rotZ = quat.setAxisAngle(quat.create(), [0, 0, 1], this.relRoll * DEG_2_RAD);
      let rotQ = quat.multiply(quat.create(), rotY, rotX);
      rotQ = quat.multiply(quat.create(), rotQ, rotZ);
      const rotMatrix = mat4.fromQuat(mat4.create(), rotQ);
      mat4.translate(this.matrix, this.matrix, [0, 0, -this.distance]);
      mat4.multiply(this.matrix, this.matrix, rotMatrix);
      mat4.translate(this.matrix, this.matrix, [0, 0, this.distance]);
    } else {
      if (Math.abs(this.elevation) > 90) {
        return this;
      }
      this.computeMatrix();
    }

    this._getAxes();
    if (this.type === CameraType.ORBITING || this.type === CameraType.EXPLORING) {
      this._getPosition();
    } else if (this.type === CameraType.TRACKING) {
      this._getFocalPoint();
    }

    this._update();
    return this;
  }

  /**
   * 沿水平(right) & 垂直(up)平移相机
   */
  pan(tx: number, ty: number) {
    const coords = createVec3(tx, ty, 0);
    const pos = vec3.clone(this.position);

    vec3.add(pos, pos, vec3.scale(vec3.create(), this.right, coords[0]));
    vec3.add(pos, pos, vec3.scale(vec3.create(), this.up, coords[1]));

    this._setPosition(pos);

    this.triggerUpdate();

    return this;
  }

  /**
   * 沿 n 轴移动，当距离视点远时移动速度较快，离视点越近速度越慢
   */
  dolly(value: number) {
    const n = this.forward;
    const pos = vec3.clone(this.position);
    let step = value * this.dollyingStep;
    const updatedDistance = this.distance + value * this.dollyingStep;

    // 限制视点距离范围
    step = Math.max(Math.min(updatedDistance, this.maxDistance), this.minDistance) - this.distance;
    pos[0] += step * n[0];
    pos[1] += step * n[1];
    pos[2] += step * n[2];

    this._setPosition(pos);
    if (this.type === CameraType.ORBITING || this.type === CameraType.EXPLORING) {
      // 重新计算视点距离
      this._getDistance();
    } else if (this.type === CameraType.TRACKING) {
      // 保持视距，移动视点位置
      vec3.add(this.focalPoint, pos, this.distanceVector);
    }

    this.triggerUpdate();
    return this;
  }

  createLandmark(
    name: string,
    params: Partial<{
      position: vec3 | vec2;
      focalPoint: vec3 | vec2;
      zoom: number;
      roll: number;
    }> = {},
  ): Landmark {
    const { position = this.position, focalPoint = this.focalPoint, roll, zoom } = params;

    const camera = new Camera();
    camera.setType(this.type, undefined);
    camera.setPosition(
      position[0],
      position[1] || this.position[1],
      position[2] || this.position[2],
    );
    camera.setFocalPoint(
      focalPoint[0],
      focalPoint[1] || this.focalPoint[1],
      focalPoint[2] || this.focalPoint[2],
    );
    camera.setRoll(roll || this.roll);
    camera.setZoom(zoom || this.zoom);

    const landmark: Landmark = {
      name,
      matrix: mat4.clone(camera.matrix),
      right: vec3.clone(camera.right),
      up: vec3.clone(camera.up),
      forward: vec3.clone(camera.forward),
      position: vec3.clone(camera.position),
      focalPoint: vec3.clone(camera.focalPoint),
      distanceVector: vec3.clone(camera.distanceVector),
      distance: camera.distance,
      dollyingStep: camera.dollyingStep,
      azimuth: camera.azimuth,
      elevation: camera.elevation,
      roll: camera.roll,
      relAzimuth: camera.relAzimuth,
      relElevation: camera.relElevation,
      relRoll: camera.relRoll,
      zoom: camera.zoom,
    };

    this.landmarks.push(landmark);
    return landmark;
  }

  gotoLandmark(
    name: string | Landmark,
    options:
      | number
      | Partial<{
          easing: string;
          easingFunction: TypeEasingFunction;
          duration: number;
          onfinish: () => void;
        }> = {},
  ) {
    const landmark = isString(name) ? this.landmarks.find((l) => l.name === name) : name;
    if (landmark) {
      const {
        easing = 'linear',
        duration = 100,
        easingFunction = undefined,
        onfinish = undefined,
      } = isNumber(options) ? { duration: options } : options;
      const epsilon = 0.01;

      if (duration === 0) {
        this.syncFromLandmark(landmark);
        if (onfinish) {
          onfinish();
        }
        return;
      }

      // cancel ongoing animation
      if (this.landmarkAnimationID !== undefined) {
        this.canvas.cancelAnimationFrame(this.landmarkAnimationID);
      }

      const destPosition = landmark.position;
      const destFocalPoint = landmark.focalPoint;
      const destZoom = landmark.zoom;
      const destRoll = landmark.roll;

      const easingFunc = easingFunction || GlobalContainer.get(ParseEasingFunction)(easing);

      let timeStart: number | undefined;
      const endAnimation = () => {
        this.setFocalPoint(destFocalPoint);
        this.setPosition(destPosition);
        this.setRoll(destRoll);
        this.setZoom(destZoom);
        this.computeMatrix();
        this.triggerUpdate();
        if (onfinish) {
          onfinish();
        }
      };

      const animate = (timestamp: number) => {
        if (timeStart === undefined) {
          timeStart = timestamp;
        }
        const elapsed = timestamp - timeStart;

        if (elapsed > duration) {
          endAnimation();
          return;
        }
        // use the same ease function in animation system
        const t = easingFunc(elapsed / duration);

        const interFocalPoint = vec3.create();
        const interPosition = vec3.create();
        let interZoom = 1;
        let interRoll = 0;

        vec3.lerp(interFocalPoint, this.focalPoint, destFocalPoint, t);
        vec3.lerp(interPosition, this.position, destPosition, t);
        interRoll = this.roll * (1 - t) + destRoll * t;
        interZoom = this.zoom * (1 - t) + destZoom * t;

        this.setFocalPoint(interFocalPoint);
        this.setPosition(interPosition);
        this.setRoll(interRoll);
        this.setZoom(interZoom);

        const dist =
          vec3.dist(interFocalPoint, destFocalPoint) + vec3.dist(interPosition, destPosition);
        if (dist <= epsilon) {
          endAnimation();
          return;
        }

        this.computeMatrix();
        this.triggerUpdate();

        if (elapsed < duration) {
          this.landmarkAnimationID = this.canvas.requestAnimationFrame(animate);
        }
      };

      this.canvas.requestAnimationFrame(animate);
    }
  }

  /**
   * 根据相机矩阵重新计算各种相机参数
   */
  private _update() {
    this._getAxes();
    this._getPosition();
    this._getDistance();
    this._getAngles();
    this._getOrthoMatrix();

    this.triggerUpdate();
  }

  /**
   * 计算相机矩阵
   */
  private computeMatrix() {
    // 使用四元数描述 3D 旋转
    // @see https://xiaoiver.github.io/coding/2018/12/28/Camera-%E8%AE%BE%E8%AE%A1-%E4%B8%80.html
    const rotZ = quat.setAxisAngle(quat.create(), [0, 0, 1], this.roll * DEG_2_RAD);

    mat4.identity(this.matrix);

    // only consider HCS for EXPLORING and ORBITING cameras
    const rotX = quat.setAxisAngle(
      quat.create(),
      [1, 0, 0],
      ((this.rotateWorld && this.type !== CameraType.TRACKING) || this.type === CameraType.TRACKING
        ? 1
        : -1) *
        this.elevation *
        DEG_2_RAD,
    );
    const rotY = quat.setAxisAngle(
      quat.create(),
      [0, 1, 0],
      ((this.rotateWorld && this.type !== CameraType.TRACKING) || this.type === CameraType.TRACKING
        ? 1
        : -1) *
        this.azimuth *
        DEG_2_RAD,
    );

    let rotQ = quat.multiply(quat.create(), rotY, rotX);
    rotQ = quat.multiply(quat.create(), rotQ, rotZ);
    const rotMatrix = mat4.fromQuat(mat4.create(), rotQ);

    if (this.type === CameraType.ORBITING || this.type === CameraType.EXPLORING) {
      mat4.translate(this.matrix, this.matrix, this.focalPoint);
      mat4.multiply(this.matrix, this.matrix, rotMatrix);
      mat4.translate(this.matrix, this.matrix, [0, 0, this.distance]);
    } else if (this.type === CameraType.TRACKING) {
      mat4.translate(this.matrix, this.matrix, this.position);
      mat4.multiply(this.matrix, this.matrix, rotMatrix);
    }
  }

  /**
   * Sets the camera position in the camera matrix
   */
  private _setPosition(x: number | vec3, y?: number, z?: number) {
    this.position = createVec3(x, y, z);
    const m = this.matrix;
    m[12] = this.position[0];
    m[13] = this.position[1];
    m[14] = this.position[2];
    m[15] = 1;

    this._getOrthoMatrix();
  }

  /**
   * Recalculates axes based on the current matrix
   */
  private _getAxes() {
    vec3.copy(this.right, createVec3(vec4.transformMat4(vec4.create(), [1, 0, 0, 0], this.matrix)));
    vec3.copy(this.up, createVec3(vec4.transformMat4(vec4.create(), [0, 1, 0, 0], this.matrix)));
    vec3.copy(
      this.forward,
      createVec3(vec4.transformMat4(vec4.create(), [0, 0, 1, 0], this.matrix)),
    );
    vec3.normalize(this.right, this.right);
    vec3.normalize(this.up, this.up);
    vec3.normalize(this.forward, this.forward);
  }

  /**
   * Recalculates euler angles based on the current state
   */
  private _getAngles() {
    // Recalculates angles
    const x = this.distanceVector[0];
    const y = this.distanceVector[1];
    const z = this.distanceVector[2];
    const r = vec3.length(this.distanceVector);

    // FAST FAIL: If there is no distance we cannot compute angles
    if (r === 0) {
      this.elevation = 0;
      this.azimuth = 0;
      return;
    }

    if (this.type === CameraType.TRACKING) {
      this.elevation = Math.asin(y / r) * RAD_2_DEG;
      this.azimuth = Math.atan2(-x, -z) * RAD_2_DEG;
    } else {
      if (this.rotateWorld) {
        this.elevation = Math.asin(y / r) * RAD_2_DEG;
        this.azimuth = Math.atan2(-x, -z) * RAD_2_DEG;
      } else {
        this.elevation = -Math.asin(y / r) * RAD_2_DEG;
        this.azimuth = -Math.atan2(-x, -z) * RAD_2_DEG;
      }
    }
  }

  /**
   * 重新计算相机位置，只有 ORBITING 模式相机位置才会发生变化
   */
  private _getPosition() {
    vec3.copy(
      this.position,
      createVec3(vec4.transformMat4(vec4.create(), [0, 0, 0, 1], this.matrix)),
    );

    // 相机位置变化，需要重新计算视距
    this._getDistance();
  }

  /**
   * 重新计算视点，只有 TRACKING 模式视点才会发生变化
   */
  private _getFocalPoint() {
    vec3.transformMat3(
      this.distanceVector,
      [0, 0, -this.distance],
      mat3.fromMat4(mat3.create(), this.matrix),
    );
    vec3.add(this.focalPoint, this.position, this.distanceVector);

    // 视点变化，需要重新计算视距
    this._getDistance();
  }

  /**
   * 重新计算视距
   */
  private _getDistance() {
    this.distanceVector = vec3.subtract(vec3.create(), this.focalPoint, this.position);
    this.distance = vec3.length(this.distanceVector);
    this.dollyingStep = this.distance / 100;
  }

  private _getOrthoMatrix() {
    if (this.projectionMode !== CameraProjectionMode.ORTHOGRAPHIC) {
      return;
    }

    const position = this.position;
    const rotZ = quat.setAxisAngle(quat.create(), [0, 0, 1], (-this.roll * Math.PI) / 180);
    mat4.fromRotationTranslationScaleOrigin(
      this.orthoMatrix,
      rotZ,
      vec3.fromValues(
        (this.rright - this.left) / 2 - position[0],
        (this.top - this.bottom) / 2 - position[1],
        0,
      ),
      vec3.fromValues(this.zoom, this.zoom, 1),
      position,
    );
  }

  private triggerUpdate() {
    if (this.enableUpdate) {
      // update frustum
      const viewMatrix = this.getViewTransform();
      const vpMatrix = mat4.multiply(mat4.create(), this.getPerspective(), viewMatrix);
      this.getFrustum().extractFromVPMatrix(vpMatrix);

      this.emit(CameraEvent.UPDATED);
    }
  }

  private syncFromLandmark(landmark: Landmark) {
    this.matrix = mat4.copy(this.matrix, landmark.matrix);
    this.right = vec3.copy(this.right, landmark.right);
    this.up = vec3.copy(this.up, landmark.up);
    this.forward = vec3.copy(this.forward, landmark.forward);
    this.position = vec3.copy(this.position, landmark.position);
    this.focalPoint = vec3.copy(this.focalPoint, landmark.focalPoint);
    this.distanceVector = vec3.copy(this.distanceVector, landmark.distanceVector);

    this.azimuth = landmark.azimuth;
    this.elevation = landmark.elevation;
    this.roll = landmark.roll;
    this.relAzimuth = landmark.relAzimuth;
    this.relElevation = landmark.relElevation;
    this.relRoll = landmark.relRoll;
    this.dollyingStep = landmark.dollyingStep;
    this.distance = landmark.distance;
    this.zoom = landmark.zoom;
  }

  /**
   * Sets the camera to a distance such that the area covered by the bounding box is viewed.
   */
  // shot(displayObject: DisplayObject) {
  //   const aabb = displayObject.getBounds();

  //   if (!AABB.isEmpty(aabb)) {
  //     this.setElevation(0);
  //     this.setAzimuth(0);
  //     this.setRoll(0);

  //     const { halfExtents, center } = aabb;
  //     const maxDim = Math.max(halfExtents[0] * 2, halfExtents[1] * 2);

  //     const cc = center.map((c: number) => Math.round(c * 1000) / 1000) as [number, number, number];

  //     if (maxDim !== 0) {
  //       const d = (1.5 * maxDim) / Math.tan(this.fov * DEG_2_RAD);
  //       this.setPosition([cc[0], cc[1], cc[2] + d]);
  //     }

  //     this.setFocalPoint(cc);
  //   }
  // }
}
