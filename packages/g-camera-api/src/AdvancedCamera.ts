import {
  Camera,
  CameraType,
  getAngle,
  createVec3,
  deg2rad,
  runtime,
} from '@antv/g-lite';
import { isString, isNumber } from '@antv/util';
import { mat4, quat, vec3 } from 'gl-matrix';
import type { vec2 } from 'gl-matrix';
import type { TypeEasingFunction, Landmark } from '@antv/g-lite';

/**
 * Provides camera action & animation.
 */
export class AdvancedCamera extends Camera {
  /**
   * switch between multiple landmarks
   */
  private landmarks: Landmark[] = [];
  private landmarkAnimationID: number | undefined;

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
        deg2rad((this.rotateWorld ? 1 : -1) * this.relElevation),
      );
      const rotY = quat.setAxisAngle(
        quat.create(),
        [0, 1, 0],
        deg2rad((this.rotateWorld ? 1 : -1) * this.relAzimuth),
      );

      const rotZ = quat.setAxisAngle(
        quat.create(),
        [0, 0, 1],
        deg2rad(this.relRoll),
      );
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
    if (
      this.type === CameraType.ORBITING ||
      this.type === CameraType.EXPLORING
    ) {
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
    step =
      Math.max(Math.min(updatedDistance, this.maxDistance), this.minDistance) -
      this.distance;
    pos[0] += step * n[0];
    pos[1] += step * n[1];
    pos[2] += step * n[2];

    this._setPosition(pos);
    if (
      this.type === CameraType.ORBITING ||
      this.type === CameraType.EXPLORING
    ) {
      // 重新计算视点距离
      this._getDistance();
    } else if (this.type === CameraType.TRACKING) {
      // 保持视距，移动视点位置
      vec3.add(this.focalPoint, pos, this.distanceVector);
    }

    this.triggerUpdate();
    return this;
  }

  cancelLandmarkAnimation() {
    if (this.landmarkAnimationID !== undefined) {
      this.canvas.cancelAnimationFrame(this.landmarkAnimationID);
    }
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
    const {
      position = this.position,
      focalPoint = this.focalPoint,
      roll,
      zoom,
    } = params;

    const camera = new runtime.CameraContribution() as AdvancedCamera;
    camera.setType(this.type, undefined);
    camera.setPosition(
      position[0],
      position[1] ?? this.position[1],
      position[2] ?? this.position[2],
    );
    camera.setFocalPoint(
      focalPoint[0],
      focalPoint[1] ?? this.focalPoint[1],
      focalPoint[2] ?? this.focalPoint[2],
    );
    camera.setRoll(roll ?? this.roll);
    camera.setZoom(zoom ?? this.zoom);

    const landmark: Landmark = {
      name,
      matrix: mat4.clone(camera.getWorldTransform()),
      right: vec3.clone(camera.right),
      up: vec3.clone(camera.up),
      forward: vec3.clone(camera.forward),
      position: vec3.clone(camera.getPosition()),
      focalPoint: vec3.clone(camera.getFocalPoint()),
      distanceVector: vec3.clone(camera.getDistanceVector()),
      distance: camera.getDistance(),
      dollyingStep: camera.getDollyingStep(),
      azimuth: camera.getAzimuth(),
      elevation: camera.getElevation(),
      roll: camera.getRoll(),
      relAzimuth: camera.relAzimuth,
      relElevation: camera.relElevation,
      relRoll: camera.relRoll,
      zoom: camera.getZoom(),
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
          onframe: (t: number) => void;
          onfinish: () => void;
        }> = {},
  ) {
    const landmark = isString(name)
      ? this.landmarks.find((l) => l.name === name)
      : name;
    if (landmark) {
      const {
        easing = 'linear',
        duration = 100,
        easingFunction = undefined,
        onfinish = undefined,
        onframe = undefined,
      } = isNumber(options) ? { duration: options } : options;
      const epsilon = 0.01;

      // cancel ongoing animation
      this.cancelLandmarkAnimation();

      const destPosition = landmark.position;
      const destFocalPoint = landmark.focalPoint;
      const destZoom = landmark.zoom;
      const destRoll = landmark.roll;

      const easingFunc = easingFunction || runtime.EasingFunction(easing);

      let timeStart: number | undefined;
      const end = () => {
        this.setFocalPoint(destFocalPoint);
        this.setPosition(destPosition);
        this.setRoll(destRoll);
        this.setZoom(destZoom);
        this.computeMatrix();
        this.triggerUpdate();
        onfinish?.();
      };

      if (duration === 0) return end();

      const animate = (timestamp: number) => {
        if (timeStart === undefined) {
          timeStart = timestamp;
        }
        const elapsed = timestamp - timeStart;

        if (elapsed >= duration) {
          end();
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
          vec3.dist(interFocalPoint, destFocalPoint) +
          vec3.dist(interPosition, destPosition);
        if (
          dist <= epsilon &&
          destZoom === undefined &&
          destRoll === undefined
        ) {
          return end();
        }

        this.computeMatrix();
        this.triggerUpdate();

        if (elapsed < duration) {
          onframe?.(t);
          this.landmarkAnimationID = this.canvas.requestAnimationFrame(animate);
        }
      };

      this.canvas.requestAnimationFrame(animate);
    }
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
