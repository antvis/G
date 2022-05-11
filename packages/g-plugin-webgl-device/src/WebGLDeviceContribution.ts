import { DeviceContribution } from '@antv/g-plugin-device-renderer';
import { inject, singleton } from 'mana-syringe';
import { WebGLRendererPluginOptions } from './interfaces';
import { Device_GL } from './platform/Device';

@singleton({
  token: DeviceContribution,
})
export class WebGLDeviceContribution implements DeviceContribution {
  @inject(WebGLRendererPluginOptions)
  private pluginOptions: WebGLRendererPluginOptions;

  async createSwapChain($canvas: HTMLCanvasElement) {
    const options: WebGLContextAttributes = {
      antialias: false,
      // @see https://stackoverflow.com/questions/27746091/preservedrawingbuffer-false-is-it-worth-the-effort
      preserveDrawingBuffer: false,
      // @see https://webglfundamentals.org/webgl/lessons/webgl-qna-how-to-use-the-stencil-buffer.html
      stencil: true,
      // @see https://webglfundamentals.org/webgl/lessons/webgl-and-alpha.html
      // premultipliedAlpha: false,
    };
    // this.handleContextEvents($canvas);

    const { targets } = this.pluginOptions;

    let gl: WebGLRenderingContext | WebGL2RenderingContext;
    if (targets.includes('webgl2')) {
      gl =
        $canvas.getContext('webgl2', options) ||
        ($canvas.getContext('experimental-webgl2', options) as WebGL2RenderingContext);
    }

    if (!gl && targets.includes('webgl1')) {
      gl =
        $canvas.getContext('webgl', options) ||
        ($canvas.getContext('experimental-webgl', options) as WebGLRenderingContext);
    }

    return new Device_GL(gl as WebGLRenderingContext | WebGL2RenderingContext, {
      shaderDebug: true,
      trackResources: true,
    });
  }

  // private handleContextEvents($canvas: HTMLCanvasElement) {
  //   const { onContextLost, onContextRestored, onContextCreationError } = this.pluginOptions;
  //   // bind context event listeners
  //   if (onContextCreationError) {
  //     // @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextcreationerror_event
  //     $canvas.addEventListener('webglcontextcreationerror', onContextCreationError, false);
  //   }
  //   if (onContextLost) {
  //     $canvas.addEventListener('webglcontextlost', onContextLost, false);
  //   }
  //   if (onContextRestored) {
  //     $canvas.addEventListener('webglcontextrestored', onContextRestored, false);
  //   }

  //   // TODO: https://github.com/gpuweb/gpuweb/blob/main/design/ErrorHandling.md#fatal-errors-requestadapter-requestdevice-and-devicelost
  // }
}
