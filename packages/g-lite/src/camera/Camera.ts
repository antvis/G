import EventEmitter from 'eventemitter3';
import type { vec2 } from 'gl-matrix';
import { mat3, mat4, quat, vec3, vec4 } from 'gl-matrix';
import type { Canvas } from '../Canvas';
import { Frustum } from '../shapes';
import { ClipSpaceNearZ, TypeEasingFunction } from '../types';
import { ERROR_MSG_METHOD_NOT_IMPLEMENTED } from '../utils/error';
import {
  createVec3,
  deg2rad,
  getAngle,
  makePerspective,
  rad2deg,
} from '../utils/math';
import type { Landmark } from './Landmark';
import type { ICamera } from './interfaces';
import {
  CameraEvent,
  CameraProjectionMode,
  CameraTrackingMode,
  CameraType,
} from './interfaces';

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

export class Camera implements ICamera {
  canvas: Canvas;

  /**
   * Clip space near Z, default to range `[-1, 1]`
   */
  clipSpaceNearZ = ClipSpaceNearZ.NEGATIVE_ONE;

  eventEmitter = new EventEmitter();

  /**
   * Matrix of camera
   */
  protected matrix = mat4.create();

  /**
   * u axis +X is right
   * @see http://learnwebgl.brown37.net/07_cameras/camera_introduction.html#a-camera-definition
   */
  protected right = vec3.fromValues(1, 0, 0);

  /**
   * v axis +Y is up
   */
  protected up = vec3.fromValues(0, 1, 0);

  /**
   * n axis +Z is inside
   */
  protected forward = vec3.fromValues(0, 0, 1);

  /**
   * Position of camera.
   */
  protected position = vec3.fromValues(0, 0, 1);

  /**
   * Position of focal point.
   */
  protected focalPoint = vec3.fromValues(0, 0, 0);

  /**
   * vector from focalPoint to position
   */
  protected distanceVector = vec3.fromValues(0, 0, -1);

  /**
   * length(focalPoint - position)
   */
  protected distance = 1;

  /**
   * @see https://en.wikipedia.org/wiki/Azimuth
   */
  protected azimuth = 0;
  protected elevation = 0;
  protected roll = 0;
  protected relAzimuth = 0;
  protected relElevation = 0;
  protected relRoll = 0;

  /**
   * 沿 n 轴移动时，保证移动速度从快到慢
   */
  protected dollyingStep = 0;
  protected maxDistance = Infinity;
  protected minDistance = -Infinity;

  /**
   * zoom factor of the camera, default is 1
   * eg. https://threejs.org/docs/#api/en/cameras/OrthographicCamera.zoom
   */
  protected zoom = 1;

  /**
   * invert the horizontal coordinate system HCS
   */
  protected rotateWorld = false;

  /**
   * 投影矩阵参数
   */

  /**
   * field of view [0-360]
   * @see http://en.wikipedia.org/wiki/Angle_of_view
   */
  protected fov = 30;
  protected near = 0.1;
  protected far = 1000;
  protected aspect = 1;
  protected left: number;
  protected rright: number;
  protected top: number;
  protected bottom: number;
  protected projectionMatrix = mat4.create();
  protected projectionMatrixInverse = mat4.create();
  protected jitteredProjectionMatrix: mat4 | undefined = undefined;

  protected view:
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
  protected enableUpdate = true;

  // protected following = undefined;

  protected type = CameraType.EXPLORING;
  protected trackingMode = CameraTrackingMode.DEFAULT;
  protected projectionMode = CameraProjectionMode.PERSPECTIVE;

  /**
   * for culling use
   */
  protected frustum: Frustum = new Frustum();

  /**
   * ortho matrix for Canvas2D & SVG
   */
  protected orthoMatrix: mat4 = mat4.create();

  // constructor(type = CameraType.EXPLORING, trackingMode = CameraTrackingMode.DEFAULT) {
  //   this.setType(type, trackingMode);
  // }

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
      throw new Error(
        'Impossible to set a tracking mode if the camera is not of tracking type',
      );
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
    // mat4.scale(this.matrix, this.matrix, vec3.fromValues(1, -1, 1));

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

  /**
   * Set projection matrix manually.
   */
  setProjectionMatrix(matrix: mat4) {
    this.projectionMatrix = matrix;
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
      this.setOrthographic(
        this.left,
        this.rright,
        this.top,
        this.bottom,
        near,
        this.far,
      );
    }
    return this;
  }

  setFar(far: number) {
    if (this.projectionMode === CameraProjectionMode.PERSPECTIVE) {
      this.setPerspective(this.near, far, this.fov, this.aspect);
    } else {
      this.setOrthographic(
        this.left,
        this.rright,
        this.top,
        this.bottom,
        this.near,
        far,
      );
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
      this.setOrthographic(
        this.left,
        this.rright,
        this.top,
        this.bottom,
        this.near,
        this.far,
      );
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
      this.setOrthographic(
        this.left,
        this.rright,
        this.top,
        this.bottom,
        this.near,
        this.far,
      );
    }
    return this;
  }

  setZoom(zoom: number) {
    this.zoom = zoom;
    if (this.projectionMode === CameraProjectionMode.ORTHOGRAPHIC) {
      this.setOrthographic(
        this.left,
        this.rright,
        this.top,
        this.bottom,
        this.near,
        this.far,
      );
    } else if (this.projectionMode === CameraProjectionMode.PERSPECTIVE) {
      this.setPerspective(this.near, this.far, this.fov, this.aspect);
    }
    return this;
  }

  /**
   * Zoom by specified point in viewport coordinates.
   */
  setZoomByViewportPoint(zoom: number, viewportPoint: vec2) {
    const { x: ox, y: oy } = this.canvas.viewport2Canvas({
      x: viewportPoint[0],
      y: viewportPoint[1],
    });

    const { roll } = this;

    this.rotate(0, 0, -roll);
    this.setPosition(ox, oy);
    this.setFocalPoint(ox, oy);
    this.setZoom(zoom);
    this.rotate(0, 0, roll);

    const { x: cx, y: cy } = this.canvas.viewport2Canvas({
      x: viewportPoint[0],
      y: viewportPoint[1],
    });

    // project to rotated axis
    const dvec = vec3.fromValues(cx - ox, cy - oy, 0);
    const dx = vec3.dot(dvec, this.right) / vec3.length(this.right);
    const dy = vec3.dot(dvec, this.up) / vec3.length(this.up);

    const [px, py] = this.getPosition();
    const [fx, fy] = this.getFocalPoint();

    this.setPosition(px - dx, py - dy);
    this.setFocalPoint(fx - dx, fy - dy);

    return this;
  }

  setPerspective(near: number, far: number, fov: number, aspect: number) {
    this.projectionMode = CameraProjectionMode.PERSPECTIVE;
    this.fov = fov;
    this.near = near;
    this.far = far;
    this.aspect = aspect;

    let top = (this.near * Math.tan(deg2rad(0.5 * this.fov))) / this.zoom;
    let height = 2 * top;
    let width = this.aspect * height;
    let left = -0.5 * width;

    if (this.view?.enabled) {
      const { fullWidth } = this.view;
      const { fullHeight } = this.view;

      left += (this.view.offsetX * width) / fullWidth;
      top -= (this.view.offsetY * height) / fullHeight;
      width *= this.view.width / fullWidth;
      height *= this.view.height / fullHeight;
    }

    makePerspective(
      this.projectionMatrix,
      left,
      left + width,
      top - height,
      top,
      near,
      this.far,
      this.clipSpaceNearZ === ClipSpaceNearZ.ZERO,
    );

    mat4.invert(this.projectionMatrixInverse, this.projectionMatrix);

    this.triggerUpdate();
    return this;
  }

  setOrthographic(
    l: number,
    r: number,
    t: number,
    b: number,
    near: number,
    far: number,
  ) {
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
      const scaleW =
        (this.rright - this.left) / this.view.fullWidth / this.zoom;
      const scaleH =
        (this.top - this.bottom) / this.view.fullHeight / this.zoom;

      left += scaleW * this.view.offsetX;
      right = left + scaleW * this.view.width;
      top -= scaleH * this.view.offsetY;
      bottom = top - scaleH * this.view.height;
    }

    if (this.clipSpaceNearZ === ClipSpaceNearZ.NEGATIVE_ONE) {
      // FlipY with switching bottom & top.
      // @see https://stackoverflow.com/a/4886656
      mat4.ortho(this.projectionMatrix, left, right, top, bottom, near, far);
    } else {
      mat4.orthoZO(this.projectionMatrix, left, right, top, bottom, near, far);
    }

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
  setPosition(
    x: number | vec2 | vec3,
    y: number = this.position[1],
    z: number = this.position[2],
  ) {
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
      y = d[1];
      z = d[2];
      const r = vec3.length(d);
      const el = rad2deg(Math.asin(y / r));
      const az = 90 + rad2deg(Math.atan2(z, x));
      const m = mat4.create();
      mat4.rotateY(m, m, deg2rad(az));
      mat4.rotateX(m, m, deg2rad(el));
      up = vec3.transformMat4(vec3.create(), [0, 1, 0], m);
    }

    mat4.invert(
      this.matrix,
      mat4.lookAt(mat4.create(), this.position, this.focalPoint, up),
    );

    this._getAxes();
    this._getDistance();
    this._getAngles();
    this.triggerUpdate();
    return this;
  }

  getDistance() {
    return this.distance;
  }

  getDistanceVector() {
    return this.distanceVector;
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

  /**
   * 设置相机方位角，不同相机模式下需要重新计算相机位置或者是视点位置
   * the azimuth in degrees
   */
  setAzimuth(az: number) {
    this.azimuth = getAngle(az);
    this.computeMatrix();

    this._getAxes();
    if (
      this.type === CameraType.ORBITING ||
      this.type === CameraType.EXPLORING
    ) {
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
    if (
      this.type === CameraType.ORBITING ||
      this.type === CameraType.EXPLORING
    ) {
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
    if (
      this.type === CameraType.ORBITING ||
      this.type === CameraType.EXPLORING
    ) {
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
   * 根据相机矩阵重新计算各种相机参数
   */
  protected _update() {
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
  protected computeMatrix() {
    // 使用四元数描述 3D 旋转
    // @see https://xiaoiver.github.io/coding/2018/12/28/Camera-%E8%AE%BE%E8%AE%A1-%E4%B8%80.html
    const rotZ = quat.setAxisAngle(
      quat.create(),
      [0, 0, 1],
      deg2rad(this.roll),
    );

    mat4.identity(this.matrix);

    // only consider HCS for EXPLORING and ORBITING cameras
    const rotX = quat.setAxisAngle(
      quat.create(),
      [1, 0, 0],
      deg2rad(
        ((this.rotateWorld && this.type !== CameraType.TRACKING) ||
        this.type === CameraType.TRACKING
          ? 1
          : -1) * this.elevation,
      ),
    );
    const rotY = quat.setAxisAngle(
      quat.create(),
      [0, 1, 0],
      deg2rad(
        ((this.rotateWorld && this.type !== CameraType.TRACKING) ||
        this.type === CameraType.TRACKING
          ? 1
          : -1) * this.azimuth,
      ),
    );

    let rotQ = quat.multiply(quat.create(), rotY, rotX);
    rotQ = quat.multiply(quat.create(), rotQ, rotZ);
    const rotMatrix = mat4.fromQuat(mat4.create(), rotQ);

    if (
      this.type === CameraType.ORBITING ||
      this.type === CameraType.EXPLORING
    ) {
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
  protected _setPosition(x: number | vec3, y?: number, z?: number) {
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
  protected _getAxes() {
    vec3.copy(
      this.right,
      createVec3(vec4.transformMat4(vec4.create(), [1, 0, 0, 0], this.matrix)),
    );
    vec3.copy(
      this.up,
      createVec3(vec4.transformMat4(vec4.create(), [0, 1, 0, 0], this.matrix)),
    );
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
  protected _getAngles() {
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
      this.elevation = rad2deg(Math.asin(y / r));
      this.azimuth = rad2deg(Math.atan2(-x, -z));
    } else if (this.rotateWorld) {
      this.elevation = rad2deg(Math.asin(y / r));
      this.azimuth = rad2deg(Math.atan2(-x, -z));
    } else {
      this.elevation = -rad2deg(Math.asin(y / r));
      this.azimuth = -rad2deg(Math.atan2(-x, -z));
    }
  }

  /**
   * 重新计算相机位置，只有 ORBITING 模式相机位置才会发生变化
   */
  protected _getPosition() {
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
  protected _getFocalPoint() {
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
  protected _getDistance() {
    this.distanceVector = vec3.subtract(
      vec3.create(),
      this.focalPoint,
      this.position,
    );
    this.distance = vec3.length(this.distanceVector);
    this.dollyingStep = this.distance / 100;
  }

  protected _getOrthoMatrix() {
    if (this.projectionMode !== CameraProjectionMode.ORTHOGRAPHIC) {
      return;
    }

    const { position } = this;
    const rotZ = quat.setAxisAngle(
      quat.create(),
      [0, 0, 1],
      (-this.roll * Math.PI) / 180,
    );
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

  protected triggerUpdate() {
    if (this.enableUpdate) {
      // update frustum
      const viewMatrix = this.getViewTransform();
      const vpMatrix = mat4.multiply(
        mat4.create(),
        this.getPerspective(),
        viewMatrix,
      );
      this.getFrustum().extractFromVPMatrix(vpMatrix);

      this.eventEmitter.emit(CameraEvent.UPDATED);
    }
  }

  rotate(azimuth: number, elevation: number, roll: number): this {
    throw new Error(ERROR_MSG_METHOD_NOT_IMPLEMENTED);
  }
  pan(tx: number, ty: number): this {
    throw new Error(ERROR_MSG_METHOD_NOT_IMPLEMENTED);
  }
  dolly(value: number): this {
    throw new Error(ERROR_MSG_METHOD_NOT_IMPLEMENTED);
  }
  createLandmark(
    name: string,
    params?: Partial<{
      position: [number, number, number] | Float32Array | [number, number];
      focalPoint: [number, number, number] | Float32Array | [number, number];
      zoom: number;
      roll: number;
    }>,
  ): Landmark {
    throw new Error(ERROR_MSG_METHOD_NOT_IMPLEMENTED);
  }
  gotoLandmark(
    name: string | Landmark,
    options?:
      | number
      | Partial<{
          easing: string;
          easingFunction: TypeEasingFunction;
          duration: number;
          onfinish: () => void;
        }>,
  ): void {
    throw new Error(ERROR_MSG_METHOD_NOT_IMPLEMENTED);
  }
  cancelLandmarkAnimation(): void {
    throw new Error(ERROR_MSG_METHOD_NOT_IMPLEMENTED);
  }
}
