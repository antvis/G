import type { InputLayout } from '@antv/g-device-api';
import {
  Format,
  VertexStepMode,
  fullscreenMegaState,
  nArray,
} from '@antv/g-device-api';
import { BufferGeometry } from '../geometries';
import { DeviceProgram } from '../render/DeviceProgram';
import type { RGGraphBuilder } from '../render/interfaces';
import { RGAttachmentSlot } from '../render/interfaces';
import type { RenderHelper } from '../render/RenderHelper';
import { TextureMapping } from '../render/TextureHolder';
import { fillVec4 } from '../render/utils';
import vert from '../shader/passes/fullscreen.vert';
import frag from '../shader/passes/fxaa.frag';

class FXAAProgram extends DeviceProgram {
  features = {};

  both = `
layout(std140) uniform ub_Params {
    vec4 u_Misc[1];
};
#define u_InvResolution (u_Misc[0].xy)
`;

  vert = vert;
  frag = frag;
}

interface RenderInput {
  backbufferWidth: number;
  backbufferHeight: number;
}

const textureMapping = nArray(1, () => new TextureMapping());
let geometry: BufferGeometry;
let inputLayout: InputLayout;

export function pushFXAAPass(
  builder: RGGraphBuilder,
  renderHelper: RenderHelper,
  renderInput: RenderInput,
  mainColorTargetID: number,
): void {
  builder.pushPass((pass) => {
    pass.setDebugName('FXAA');
    pass.attachRenderTargetID(RGAttachmentSlot.Color0, mainColorTargetID);

    const mainColorResolveTextureID =
      builder.resolveRenderTarget(mainColorTargetID);
    pass.attachResolveTexture(mainColorResolveTextureID);

    const renderInst = renderHelper.renderInstManager.newRenderInst();
    renderInst.setUniformBuffer(renderHelper.uniformBuffer);
    renderInst.setAllowSkippingIfPipelineNotReady(false);

    renderInst.setMegaStateFlags(fullscreenMegaState);
    renderInst.setBindingLayout({ numUniformBuffers: 1, numSamplers: 1 });
    renderInst.drawPrimitives(3);

    // since gl_VertexID is not available in GLSL 100, we need to use a geometry
    const offs = renderInst.allocateUniformBuffer(0, 4);
    const d = renderInst.mapUniformBufferF32(0);
    fillVec4(
      d,
      offs,
      1.0 / renderInput.backbufferWidth,
      1.0 / renderInput.backbufferHeight,
    );

    const fxaaProgram = new FXAAProgram();
    const program = renderHelper.renderCache.createProgramSimple(fxaaProgram);

    renderInst.setProgram(program);

    if (!geometry) {
      geometry = new BufferGeometry(renderHelper.getDevice());
      geometry.setVertexBuffer({
        bufferIndex: 0,
        byteStride: 4 * 2,
        stepMode: VertexStepMode.VERTEX,
        attributes: [
          {
            format: Format.F32_RG,
            bufferByteOffset: 4 * 0,
            location: 0,
          },
        ],
        // rendering a fullscreen triangle instead of quad
        // @see https://www.saschawillems.de/blog/2016/08/13/vulkan-tutorial-on-rendering-a-fullscreen-quad-without-buffers/
        data: new Float32Array([1, 3, -3, -1, 1, -1]),
      });
      geometry.vertexCount = 3;

      inputLayout = renderHelper
        .getCache()
        .createInputLayout(geometry.inputLayoutDescriptor);
    }

    pass.exec((passRenderer, scope) => {
      textureMapping[0].texture = scope.getResolveTextureForID(
        mainColorResolveTextureID,
      );
      renderInst.setSamplerBindingsFromTextureMappings(textureMapping);
      renderInst.setVertexInput(
        inputLayout,
        geometry.vertexBuffers.map((buffer) => ({
          buffer,
          byteOffset: 0,
        })),
        null,
      );
      renderInst.drawOnPass(renderHelper.renderCache, passRenderer);
    });
  });
}
