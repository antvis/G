import { Group, CustomEvent } from '@antv/g-lite';
import { vec3 } from 'gl-matrix';

const DEFAULT_EVENT = new CustomEvent('');

/**
 * @see https://github.com/mrdoob/three.js/blob/master/src/renderers/webxr/WebXRController.js
 */
export class WebXRController {
  private targetRay: Group = null;

  connect(inputSource: XRInputSource) {
    // if (inputSource && inputSource.hand) {
    //   const hand = this._hand;

    //   if (hand) {
    //     for (const inputjoint of inputSource.hand.values()) {
    //       // Initialize hand with joints when connected
    //       this._getHandJoint(hand, inputjoint);
    //     }
    //   }
    // }

    this.dispatchEvent({ type: 'connected', data: inputSource });

    return this;
  }

  disconnect(inputSource: XRInputSource) {
    this.dispatchEvent({ type: 'disconnected', data: inputSource });

    if (this.targetRay !== null) {
      this.targetRay.style.visible = false;
    }

    // if (this._grip !== null) {
    //   this._grip.visible = false;
    // }

    // if (this._hand !== null) {
    //   this._hand.visible = false;
    // }

    return this;
  }

  update(
    inputSource: XRInputSource,
    frame: XRFrame,
    referenceSpace: XRReferenceSpace,
  ) {
    let inputPose: XRPose & {
      linearVelocity?: Float32Array;
      angularVelocity?: Float32Array;
    } = null;
    // let gripPose = null;
    // let handPose = null;

    const { targetRay } = this;
    // const grip = this._grip;
    // const hand = this._hand;

    if (inputSource && frame.session.visibilityState !== 'visible-blurred') {
      // if (hand && inputSource.hand) {
      //   handPose = true;

      //   for (const inputjoint of inputSource.hand.values()) {
      //     // Update the joints groups with the XRJoint poses
      //     const jointPose = frame.getJointPose(inputjoint, referenceSpace);

      //     // The transform of this joint will be updated with the joint pose on each frame
      //     const joint = this._getHandJoint(hand, inputjoint);

      //     if (jointPose !== null) {
      //       joint.matrix.fromArray(jointPose.transform.matrix);
      //       joint.matrix.decompose(joint.position, joint.rotation, joint.scale);
      //       joint.matrixWorldNeedsUpdate = true;
      //       joint.jointRadius = jointPose.radius;
      //     }

      //     joint.visible = jointPose !== null;
      //   }

      //   // Custom events

      //   // Check pinchz
      //   const indexTip = hand.joints['index-finger-tip'];
      //   const thumbTip = hand.joints['thumb-tip'];
      //   const distance = indexTip.position.distanceTo(thumbTip.position);

      //   const distanceToPinch = 0.02;
      //   const threshold = 0.005;

      //   if (
      //     hand.inputState.pinching &&
      //     distance > distanceToPinch + threshold
      //   ) {
      //     hand.inputState.pinching = false;
      //     this.dispatchEvent({
      //       type: 'pinchend',
      //       handedness: inputSource.handedness,
      //       target: this,
      //     });
      //   } else if (
      //     !hand.inputState.pinching &&
      //     distance <= distanceToPinch - threshold
      //   ) {
      //     hand.inputState.pinching = true;
      //     this.dispatchEvent({
      //       type: 'pinchstart',
      //       handedness: inputSource.handedness,
      //       target: this,
      //     });
      //   }
      // } else {
      //   if (grip !== null && inputSource.gripSpace) {
      //     gripPose = frame.getPose(inputSource.gripSpace, referenceSpace);

      //     if (gripPose !== null) {
      //       grip.matrix.fromArray(gripPose.transform.matrix);
      //       grip.matrix.decompose(grip.position, grip.rotation, grip.scale);
      //       grip.matrixWorldNeedsUpdate = true;

      //       if (gripPose.linearVelocity) {
      //         grip.hasLinearVelocity = true;
      //         grip.linearVelocity.copy(gripPose.linearVelocity);
      //       } else {
      //         grip.hasLinearVelocity = false;
      //       }

      //       if (gripPose.angularVelocity) {
      //         grip.hasAngularVelocity = true;
      //         grip.angularVelocity.copy(gripPose.angularVelocity);
      //       } else {
      //         grip.hasAngularVelocity = false;
      //       }
      //     }
      //   }
      // }

      if (targetRay !== null) {
        inputPose = frame.getPose(inputSource.targetRaySpace, referenceSpace);

        // Some runtimes (namely Vive Cosmos with Vive OpenXR Runtime) have only grip space and ray space is equal to it
        // if (inputPose === null && gripPose !== null) {
        //   inputPose = gripPose;
        // }

        if (inputPose !== null) {
          targetRay.setLocalTransform(inputPose.transform.matrix);

          if (inputPose.linearVelocity) {
            targetRay.style.hasLinearVelocity = true;
            vec3.copy(targetRay.style.linearVelocity, inputPose.linearVelocity);
          } else {
            targetRay.style.hasLinearVelocity = false;
          }

          if (inputPose.angularVelocity) {
            targetRay.style.hasAngularVelocity = true;
            targetRay.style.angularVelocity.copy(inputPose.angularVelocity);
          } else {
            targetRay.style.hasAngularVelocity = false;
          }

          this.dispatchEvent({ type: 'move' });
        }
      }
    }

    if (targetRay !== null) {
      targetRay.style.visible = inputPose !== null;
    }

    // if (grip !== null) {
    //   grip.visible = gripPose !== null;
    // }

    // if (hand !== null) {
    //   hand.visible = handPose !== null;
    // }

    return this;
  }

  getTargetRaySpace() {
    if (this.targetRay === null) {
      this.targetRay = new Group();
      this.targetRay.style.visible = false;
      this.targetRay.style.hasLinearVelocity = false;
      this.targetRay.style.linearVelocity = vec3.create();
      this.targetRay.style.hasAngularVelocity = false;
      this.targetRay.style.angularVelocity = vec3.create();
    }

    return this.targetRay;
  }

  dispatchEvent(event: { type: string; data?: any }) {
    const { type, data } = event;
    DEFAULT_EVENT.type = type;
    DEFAULT_EVENT.detail = data;

    if (this.targetRay !== null) {
      this.targetRay.dispatchEvent(DEFAULT_EVENT);
    }

    // if (this._grip !== null) {
    //   this._grip.dispatchEvent(event);
    // }

    // if (this._hand !== null) {
    //   this._hand.dispatchEvent(event);
    // }

    return this;
  }
}
