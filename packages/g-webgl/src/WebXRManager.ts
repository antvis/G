import { Canvas } from '@antv/g-lite';
import { DeviceRenderer } from '.';

export class WebXRManager {
  private session: XRSession;
  private referenceSpaceType: XRReferenceSpaceType;
  private referenceSpace: XRReferenceSpace;
  private glBaseLayer: XRWebGLLayer;

  constructor(private plugin: DeviceRenderer.Plugin) {}

  async setSession(canvas: Canvas, session: XRSession) {
    if (session) {
      this.session = session;
      const gl = this.plugin.getDevice()['gl'] as WebGL2RenderingContext;
      // const swapChain = this.plugin.getSwapChain();
      const attributes = gl.getContextAttributes();

      if (attributes.xrCompatible !== true) {
        // @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/makeXRCompatible
        await gl.makeXRCompatible();
      }

      // session.addEventListener('select', this.onSessionEvent);
      session.addEventListener('end', this.onSessionEnd);

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
      }

      canvas.requestAnimationFrame =
        session.requestAnimationFrame.bind(session);

      // const onXRFrame: XRFrameRequestCallback = (time, frame) => {
      //   // Assumed to be a XRWebGLLayer for now.
      //   let layer = session.renderState.baseLayer;
      //   if (!layer) {
      //     layer = session.renderState.layers![0] as XRWebGLLayer;
      //   } else {
      //     // Bind the graphics framebuffer to the baseLayer's framebuffer.
      //     // Only baseLayer has framebuffer and we need to bind it, even if it is null (for inline sessions).
      //     // gl.bindFramebuffer(gl.FRAMEBUFFER, layer.framebuffer);
      //   }

      //   swapChain.configureSwapChain(
      //     layer.framebufferWidth,
      //     layer.framebufferHeight,
      //     layer.framebuffer,
      //   );

      //   // Retrieve the pose of the device.
      //   // XRFrame.getViewerPose can return null while the session attempts to establish tracking.
      //   const pose = frame.getViewerPose(this.referenceSpace);
      //   if (pose) {
      //     const p = pose.transform.position;

      //     // In mobile AR, we only have one view.
      //     const view = pose.views[0];
      //     const viewport = session.renderState.baseLayer!.getViewport(view)!;

      //     // Use the view's transform matrix and projection matrix
      //     // const viewMatrix = mat4.invert(mat4.create(), view.transform.matrix);
      //     const viewMatrix = view.transform.inverse.matrix;
      //     const projectionMatrix = view.projectionMatrix;
      //   }

      //   // Queue up the next draw request.
      //   session.requestAnimationFrame(onXRFrame);
      // };

      // session.requestAnimationFrame(onXRFrame);
    }
  }

  setReferenceSpaceType(referenceSpaceType: XRReferenceSpaceType) {
    this.referenceSpaceType = referenceSpaceType;
  }

  private onSessionEnd = () => {
    this.session.removeEventListener('end', this.onSessionEnd);
  };
}
