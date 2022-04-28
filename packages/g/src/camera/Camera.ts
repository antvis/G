import { EventEmitter } from 'eventemitter3';
import { mat3, mat4, quat, vec2, vec3, vec4 } from 'gl-matrix';
import { Landmark } from './Landmark';
import { Frustum } from '../shapes';
import { createVec3, getAngle, makePerspective } from '../utils/math';
import type { Canvas } from '../Canvas';
import { parseEasingFunction } from '../utils/animation';
import { isNumber, isString, isUndefined } from '@antv/util';

export const DefaultCamera = 'DefaultCamera';

export enum CAMERA_TYPE {
  ORBITING = 'ORBITING',
  EXPLORING = 'EXPLORING',
  TRACKING = 'TRACKING',
}

export enum CAMERA_TRACKING_MODE {
  DEFAULT = 'DEFAULT',
  ROTATIONAL = 'ROTATIONAL',
  TRANSLATIONAL = 'TRANSLATIONAL',
  CINEMATIC = 'CINEMATIC',
}

export enum CAMERA_PROJECTION_MODE {
  ORTHOGRAPHIC = 'ORTHOGRAPHIC',
  PERSPECTIVE = 'PERSPECTIVE',
}

export const CameraEvent = {
  UPDATED: 'updated',
};

const DEG_2_RAD = Math.PI / 180;
const RAD_2_DEG = 180 / Math.PI;

/**
 * 参考「WebGL Insights - 23.Designing Cameras for WebGL Applications」，基于 Responsible Camera 思路设计
 * 保存相机参数，定义相机动作：
 * 1. dolly 沿 n 轴移动
 * 2. pan 沿 u v 轴移动
 * 3. rotate 以方位角旋转
 * 4. 移动到 Landmark，具有平滑的动画效果，其间禁止其他用户交互
 */

export class Camera extends EventEmitter {
  static ProjectionMode = {
    ORTHOGRAPHIC: 'ORTHOGRAPHIC',
    PERSPECTIVE: 'PERSPECTIVE',
  };

  canvas: Canvas;

  /**
   * 相机矩阵
   */
  matrix = mat4.create();

  /**
   * u 轴
   * @see http://learnwebgl.brown37.net/07_cameras/camera_introduction.html#a-camera-definition
   */
  right = vec3.fromValues(1, 0, 0);

  /**
   * v 轴 +Y is down
   */
  up = vec3.fromValues(0, 1, 0);

  /**
   * n 轴 +Z is inside
   */
  forward = vec3.fromValues(0, 0, 1);

  /**
   * 相机位置
   */
  position = vec3.fromValues(0, 0, 1);

  /**
   * 视点位置
   */
  focalPoint = vec3.fromValues(0, 0, 0);

  /**
   * 相机位置到视点向量
   * focalPoint - position
   */
  distanceVector = vec3.fromValues(0, 0, 0);

  /**
   * 相机位置到视点距离
   * length(focalPoint - position)
   */
  distance = 1;

  /**
   * @see https://en.wikipedia.org/wiki/Azimuth
   */
  azimuth = 0;
  elevation = 0;
  roll = 0;
  relAzimuth = 0;
  relElevation = 0;
  relRoll = 0;

  /**
   * 沿 n 轴移动时，保证移动速度从快到慢
   */
  dollyingStep = 0;
  maxDistance = Infinity;
  minDistance = -Infinity;

  /**
   * zoom factor of the camera, default is 1
   * eg. https://threejs.org/docs/#api/en/cameras/OrthographicCamera.zoom
   */
  zoom = 1;

  /**
   * invert the horizontal coordinate system HCS
   */
  rotateWorld = false;

  // @inject(IDENTIFIER.InteractorService)
  // interactor: IInteractorService;

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

  // private following = undefined;

  private type = CAMERA_TYPE.EXPLORING;
  private trackingMode = CAMERA_TRACKING_MODE.DEFAULT;
  private projectionMode = CAMERA_PROJECTION_MODE.PERSPECTIVE;

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

  isOrtho() {
    return this.projectionMode === CAMERA_PROJECTION_MODE.ORTHOGRAPHIC;
  }

  clone(): Camera {
    const camera = new Camera();
    camera.setType(this.type, undefined);
    // camera.interactor = this.interactor;
    return camera;
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

  setType(type: CAMERA_TYPE, trackingMode: CAMERA_TRACKING_MODE | undefined) {
    this.type = type;
    if (this.type === CAMERA_TYPE.EXPLORING) {
      this.setWorldRotation(true);
    } else {
      this.setWorldRotation(false);
    }
    this._getAngles();

    if (this.type === CAMERA_TYPE.TRACKING && trackingMode !== undefined) {
      this.setTrackingMode(trackingMode);
    }
    return this;
  }

  setProjectionMode(projectionMode: CAMERA_PROJECTION_MODE) {
    this.projectionMode = projectionMode;
    return this;
  }

  setTrackingMode(trackingMode: CAMERA_TRACKING_MODE) {
    if (this.type !== CAMERA_TYPE.TRACKING) {
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
    if (this.projectionMode === CAMERA_PROJECTION_MODE.PERSPECTIVE) {
      this.setPerspective(near, this.far, this.fov, this.aspect);
    } else {
      this.setOrthographic(this.left, this.rright, this.top, this.bottom, near, this.far);
    }
    return this;
  }

  setFar(far: number) {
    if (this.projectionMode === CAMERA_PROJECTION_MODE.PERSPECTIVE) {
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

    if (this.projectionMode === CAMERA_PROJECTION_MODE.PERSPECTIVE) {
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

    if (this.projectionMode === CAMERA_PROJECTION_MODE.PERSPECTIVE) {
      this.setPerspective(this.near, this.far, this.fov, this.aspect);
    } else {
      this.setOrthographic(this.left, this.rright, this.top, this.bottom, this.near, this.far);
    }
    return this;
  }

  setZoom(zoom: number) {
    this.zoom = zoom;
    if (this.projectionMode === CAMERA_PROJECTION_MODE.ORTHOGRAPHIC) {
      this.setOrthographic(this.left, this.rright, this.top, this.bottom, this.near, this.far);
    } else if (this.projectionMode === CAMERA_PROJECTION_MODE.PERSPECTIVE) {
      this.setPerspective(this.near, this.far, this.fov, this.aspect);
    }
    return this;
  }

  setPerspective(near: number, far: number, fov: number, aspect: number) {
    this.projectionMode = CAMERA_PROJECTION_MODE.PERSPECTIVE;
    this.fov = fov;
    this.near = near;
    this.far = far;
    this.aspect = aspect;

    let top = (this.near * Math.tan(DEG_2_RAD * 0.5 * this.fov)) / this.zoom;
    let height = 2 * top;
    let width = this.aspect * height;
    let left = -0.5 * width;

    if (this.view !== undefined && this.view.enabled) {
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
    this.projectionMode = CAMERA_PROJECTION_MODE.ORTHOGRAPHIC;
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

    if (this.view !== undefined && this.view.enabled) {
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
   * 设置相机位置
   */
  setPosition(x: number | vec3, y: number = 0, z: number = 0) {
    this._setPosition(x, y, z);
    this.setFocalPoint(this.focalPoint);
    return this;
  }

  /**
   * 设置视点位置
   */
  setFocalPoint(x: number | vec3, y?: number, z?: number) {
    let up = vec3.fromValues(0, 1, 0);
    this.focalPoint = createVec3(x, y, z);

    if (this.trackingMode === CAMERA_TRACKING_MODE.CINEMATIC) {
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
    return this;
  }

  /**
   * 固定当前视点，按指定距离放置相机
   */
  setDistance(d: number) {
    if (this.distance === d || d < 0) {
      return;
    }

    this.distance = d;

    if (this.distance < 0.0002) {
      this.distance = 0.0002;
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
   * Changes the initial azimuth of the camera
   */
  changeAzimuth(az: number) {
    this.setAzimuth(this.azimuth + az);
    return this;
  }

  /**
   * Changes the initial elevation of the camera
   */
  changeElevation(el: number) {
    this.setElevation(this.elevation + el);
    return this;
  }

  /**
   * Changes the initial roll of the camera
   */
  changeRoll(rl: number) {
    this.setRoll(this.roll + rl);
    return this;
  }

  /**
   * 设置相机方位角，不同相机模式下需要重新计算相机位置或者是视点位置
   * @param {Number} el the azimuth in degrees
   */
  setAzimuth(az: number) {
    this.azimuth = getAngle(az);
    this.computeMatrix();

    this._getAxes();
    if (this.type === CAMERA_TYPE.ORBITING || this.type === CAMERA_TYPE.EXPLORING) {
      this._getPosition();
    } else if (this.type === CAMERA_TYPE.TRACKING) {
      this._getFocalPoint();
    }
    return this;
  }

  getAzimuth() {
    return this.azimuth;
  }

  /**
   * 设置相机方位角，不同相机模式下需要重新计算相机位置或者是视点位置
   * @param {Number} el the elevation in degrees
   */
  setElevation(el: number) {
    this.elevation = getAngle(el);
    this.computeMatrix();

    this._getAxes();
    if (this.type === CAMERA_TYPE.ORBITING || this.type === CAMERA_TYPE.EXPLORING) {
      this._getPosition();
    } else if (this.type === CAMERA_TYPE.TRACKING) {
      this._getFocalPoint();
    }
    return this;
  }

  /**
   * 设置相机方位角，不同相机模式下需要重新计算相机位置或者是视点位置
   * @param {Number} angle the roll angle
   */
  setRoll(angle: number) {
    this.roll = getAngle(angle);
    this.computeMatrix();

    this._getAxes();
    if (this.type === CAMERA_TYPE.ORBITING || this.type === CAMERA_TYPE.EXPLORING) {
      this._getPosition();
    } else if (this.type === CAMERA_TYPE.TRACKING) {
      this._getFocalPoint();
    }
    return this;
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

    if (this.type === CAMERA_TYPE.EXPLORING) {
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
        return;
      }
      this.computeMatrix();
    }

    this._getAxes();
    if (this.type === CAMERA_TYPE.ORBITING || this.type === CAMERA_TYPE.EXPLORING) {
      this._getPosition();
    } else if (this.type === CAMERA_TYPE.TRACKING) {
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
    if (this.type === CAMERA_TYPE.ORBITING || this.type === CAMERA_TYPE.EXPLORING) {
      // 重新计算视点距离
      this._getDistance();
    } else if (this.type === CAMERA_TYPE.TRACKING) {
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
      zoom?: number;
      roll?: number;
    }> = {},
  ): Landmark {
    const { position, focalPoint, roll, zoom } = params;

    const camera = this.clone();
    camera.setPosition(vec3.fromValues(position[0], position[1], position[2] || this.position[2]));
    camera.setFocalPoint(
      vec3.fromValues(focalPoint[0], focalPoint[1], focalPoint[2] || this.focalPoint[2]),
    );
    if (!isUndefined(roll)) {
      camera.setRoll(roll);
    }
    if (!isUndefined(zoom)) {
      camera.setZoom(zoom);
    }
    const landmark = new Landmark(name, camera);
    this.landmarks.push(landmark);
    return landmark;
  }

  setLandmark(name: string) {
    const landmark = new Landmark(name, this);
    this.landmarks.push(landmark);
    return this;
  }

  gotoLandmark(
    name: string | Landmark,
    options:
      | number
      | Partial<{
          easing: string;
          duration: number;
        }> = {},
  ) {
    const landmark = isString(name) ? this.landmarks.find((l) => l.name === name) : name;
    if (landmark) {
      const { easing = 'ease', duration = 1000 } = isNumber(options)
        ? { duration: options }
        : options;
      const epsilon = 0.01;

      if (duration === 0) {
        landmark.retrieve(this);
        return;
      }

      if (this.landmarkAnimationID !== undefined) {
        this.canvas.cancelAnimationFrame(this.landmarkAnimationID);
      }

      // TODO: do not process events during animation
      // this.interactor.disconnect();

      const destPosition = landmark.getPosition();
      const destFocalPoint = landmark.getFocalPoint();
      const destZoom = landmark.getZoom();
      const destRoll = landmark.getRoll();

      const easingFunction = parseEasingFunction(easing);

      let timeStart: number | undefined;
      const animate = (timestamp: number) => {
        if (timeStart === undefined) {
          timeStart = timestamp;
        }
        const elapsed = timestamp - timeStart;
        // use the same ease function in animatio system
        const t = easingFunction(elapsed / duration);

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

        this.computeMatrix();

        this.triggerUpdate();

        const dist =
          vec3.dist(interFocalPoint, destFocalPoint) + vec3.dist(interPosition, destPosition);
        if (dist <= epsilon) {
          this.setFocalPoint(destFocalPoint);
          this.setPosition(destPosition);
          this.setRoll(destRoll);
          this.setZoom(destZoom);
          this.computeMatrix();
          // this.interactor.connect();

          return;
        }

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
      ((this.rotateWorld && this.type !== CAMERA_TYPE.TRACKING) ||
      this.type === CAMERA_TYPE.TRACKING
        ? 1
        : -1) *
        this.elevation *
        DEG_2_RAD,
    );
    const rotY = quat.setAxisAngle(
      quat.create(),
      [0, 1, 0],
      ((this.rotateWorld && this.type !== CAMERA_TYPE.TRACKING) ||
      this.type === CAMERA_TYPE.TRACKING
        ? 1
        : -1) *
        this.azimuth *
        DEG_2_RAD,
    );

    let rotQ = quat.multiply(quat.create(), rotY, rotX);
    rotQ = quat.multiply(quat.create(), rotQ, rotZ);
    const rotMatrix = mat4.fromQuat(mat4.create(), rotQ);

    if (this.type === CAMERA_TYPE.ORBITING || this.type === CAMERA_TYPE.EXPLORING) {
      mat4.translate(this.matrix, this.matrix, this.focalPoint);
      mat4.multiply(this.matrix, this.matrix, rotMatrix);
      mat4.translate(this.matrix, this.matrix, [0, 0, this.distance]);
    } else if (this.type === CAMERA_TYPE.TRACKING) {
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

    if (this.type === CAMERA_TYPE.TRACKING) {
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
    if (this.projectionMode !== CAMERA_PROJECTION_MODE.ORTHOGRAPHIC) {
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
    // update frustum
    const viewMatrix = this.getViewTransform();
    const vpMatrix = mat4.multiply(mat4.create(), this.getPerspective(), viewMatrix);
    this.getFrustum().extractFromVPMatrix(vpMatrix);

    this.emit(CameraEvent.UPDATED);
  }
}
