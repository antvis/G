import { Canvas } from '@antv/g-lite';
import { DeviceRenderer } from '.';
import { WebXRController } from './WebXRController';

export class WebXRManager {
  private session: XRSession;
  private referenceSpaceType: XRReferenceSpaceType;
  private referenceSpace: XRReferenceSpace;
  private glBaseLayer: XRWebGLLayer;
  private controllers: WebXRController[] = [];
  private controllerInputSources: XRInputSource[] = [];

  constructor(private plugin: DeviceRenderer.Plugin) {}

  async setSession(canvas: Canvas, session: XRSession) {
    if (session) {
      this.session = session;
      const gl = this.plugin.getDevice().gl as WebGL2RenderingContext;
      // const swapChain = this.plugin.getSwapChain();
      const attributes = gl.getContextAttributes();

      if (attributes.xrCompatible !== true) {
        // @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/makeXRCompatible
        await gl.makeXRCompatible();
      }

      session.addEventListener('select', this.onSessionEvent);
      session.addEventListener('selectstart', this.onSessionEvent);
      session.addEventListener('selectend', this.onSessionEvent);
      session.addEventListener('squeeze', this.onSessionEvent);
      session.addEventListener('squeezestart', this.onSessionEvent);
      session.addEventListener('squeezeend', this.onSessionEvent);
      session.addEventListener('end', this.onSessionEnd);
      session.addEventListener('inputsourceschange', this.onInputSourcesChange);

      if (session.renderState.layers === undefined) {
        const layerInit = {
          antialias: attributes.antialias,
          alpha: true,
          depth: attributes.depth,
          stencil: attributes.stencil,
          framebufferScaleFactor: 1.0,
        };

        this.glBaseLayer = new XRWebGLLayer(session, gl, layerInit);
        session.updateRenderState({ baseLayer: this.glBaseLayer });

        this.referenceSpace = await session.requestReferenceSpace(
          this.referenceSpaceType,
        );

        // @ts-ignore
        session.referenceSpace = this.referenceSpace;
      }

      canvas.requestAnimationFrame =
        session.requestAnimationFrame.bind(session);
    }
  }

  setReferenceSpaceType(referenceSpaceType: XRReferenceSpaceType) {
    this.referenceSpaceType = referenceSpaceType;
  }

  getSession() {
    return this.session;
  }

  getReferenceSpace() {
    return this.referenceSpace;
  }

  private getOrCreateController(index: number) {
    let controller = this.controllers[index];
    if (controller === undefined) {
      controller = new WebXRController();
      this.controllers[index] = controller;
    }
    return controller;
  }

  getController(index: number) {
    return this.getOrCreateController(index).getTargetRaySpace();
  }

  // getControllerGrip(index: number) {
  //   return this.getOrCreateController(index).getGripSpace();
  // }

  // getHand(index: number) {
  //   return this.getOrCreateController(index).getHandSpace();
  // }

  private onSessionEnd = () => {
    this.session.removeEventListener('select', this.onSessionEvent);
    this.session.removeEventListener('selectstart', this.onSessionEvent);
    this.session.removeEventListener('selectend', this.onSessionEvent);
    this.session.removeEventListener('squeeze', this.onSessionEvent);
    this.session.removeEventListener('squeezestart', this.onSessionEvent);
    this.session.removeEventListener('squeezeend', this.onSessionEvent);
    this.session.removeEventListener('end', this.onSessionEnd);
    this.session.removeEventListener(
      'inputsourceschange',
      this.onInputSourcesChange,
    );

    for (let i = 0; i < this.controllers.length; i++) {
      const inputSource = this.controllerInputSources[i];
      if (inputSource === null) continue;
      this.controllerInputSources[i] = null;
      this.controllers[i].disconnect(inputSource);
    }
  };

  private onSessionEvent = (event: XRInputSourceEvent) => {
    const controllerIndex = this.controllerInputSources.indexOf(
      event.inputSource,
    );

    if (controllerIndex === -1) {
      return;
    }

    const controller = this.controllers[controllerIndex];

    if (controller !== undefined) {
      controller.update(
        event.inputSource,
        event.frame,
        // @ts-ignore
        this.session.referenceSpace,
      );
      controller.dispatchEvent({ type: event.type, data: event.inputSource });
    }
  };

  private onInputSourcesChange = (event: XRInputSourceChangeEvent) => {
    // Notify disconnected
    for (let i = 0; i < event.removed.length; i++) {
      const inputSource = event.removed[i];
      const index = this.controllerInputSources.indexOf(inputSource);

      if (index >= 0) {
        this.controllerInputSources[index] = null;
        this.controllers[index].disconnect(inputSource);
      }
    }

    // Notify connected
    for (let i = 0; i < event.added.length; i++) {
      const inputSource = event.added[i];

      let controllerIndex = this.controllerInputSources.indexOf(inputSource);

      if (controllerIndex === -1) {
        // Assign input source a controller that currently has no input source

        for (let i = 0; i < this.controllers.length; i++) {
          if (i >= this.controllerInputSources.length) {
            this.controllerInputSources.push(inputSource);
            controllerIndex = i;
            break;
          } else if (this.controllerInputSources[i] === null) {
            this.controllerInputSources[i] = inputSource;
            controllerIndex = i;
            break;
          }
        }

        // If all controllers do currently receive input we ignore new ones

        if (controllerIndex === -1) break;
      }

      const controller = this.controllers[controllerIndex];

      if (controller) {
        controller.connect(inputSource);
      }
    }
  };
}
