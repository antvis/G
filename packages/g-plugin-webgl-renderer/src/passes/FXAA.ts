import { Geometry } from '../geometries';
import { Format, InputLayout, InputState, VertexBufferFrequency } from '../platform';
import { fullscreenMegaState, nArray } from '../platform/utils';
import { DeviceProgram } from '../render/DeviceProgram';
import { RGAttachmentSlot, RGGraphBuilder } from '../render/interfaces';
import { RenderHelper } from '../render/RenderHelper';
import { TextureMapping } from '../render/TextureHolder';
import { fillVec4, ShaderLibrary } from '../render/utils';

class FXAAProgram extends DeviceProgram {
  features = {
    MRT: false,
  };

  both = `
layout(std140) uniform ub_Params {
    vec4 u_Misc[1];
};
#define u_InvResolution (u_Misc[0].xy)
`;

  vert = ShaderLibrary.fullscreenVS;

  frag = `
uniform sampler2D u_Texture;
varying vec2 v_TexCoord;

#define gl_FragColor gbuf_color
layout(location = 0) out vec4 gbuf_color;

${ShaderLibrary.monochromeNTSC}
${ShaderLibrary.fxaa}

void main() {
    gl_FragColor.rgba = FXAA(PP_SAMPLER_2D(u_Texture), v_TexCoord.xy, u_InvResolution.xy);
}
`;
}

interface RenderInput {
  backbufferWidth: number;
  backbufferHeight: number;
}

const textureMapping = nArray(1, () => new TextureMapping());
let geometry: Geometry;
let inputState: InputState;
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

    const mainColorResolveTextureID = builder.resolveRenderTarget(mainColorTargetID);
    pass.attachResolveTexture(mainColorResolveTextureID);

    const renderInst = renderHelper.renderInstManager.newRenderInst();
    renderInst.setUniformBuffer(renderHelper.uniformBuffer);
    renderInst.setAllowSkippingIfPipelineNotReady(false);

    renderInst.setMegaStateFlags(fullscreenMegaState);
    renderInst.setBindingLayouts([{ numUniformBuffers: 1, numSamplers: 1 }]);
    renderInst.drawPrimitives(3);

    let offs = renderInst.allocateUniformBuffer(0, 4);
    const d = renderInst.mapUniformBufferF32(0);
    fillVec4(d, offs, 1.0 / renderInput.backbufferWidth, 1.0 / renderInput.backbufferHeight);

    const fxaaProgram = new FXAAProgram();
    const program = renderHelper.renderCache.createProgram(fxaaProgram);

    renderInst.setProgram(program);

    if (!geometry) {
      geometry = new Geometry();
      geometry.device = renderHelper.getDevice();
      geometry.setVertexBuffer({
        bufferIndex: 0,
        byteStride: 4 * 2,
        frequency: VertexBufferFrequency.PerVertex,
        attributes: [
          {
            format: Format.F32_RG,
            bufferByteOffset: 4 * 0,
            location: 0,
          },
        ],
        // rendering a fullscreen triangle instead of quad
        // @see https://www.saschawillems.de/blog/2016/08/13/vulkan-tutorial-on-rendering-a-fullscreen-quad-without-buffers/
        data: new Float32Array([-4, -4, 4, -4, 0, 4]),
      });
      geometry.vertexCount = 3;

      inputLayout = renderHelper.getCache().createInputLayout(geometry.inputLayoutDescriptor);

      inputState = renderHelper.getDevice().createInputState(
        inputLayout,
        geometry.vertexBuffers.map((buffer) => ({
          buffer,
          byteOffset: 0,
        })),
        null,
        program,
      );
    }

    pass.exec((passRenderer, scope) => {
      textureMapping[0].texture = scope.getResolveTextureForID(mainColorResolveTextureID);
      renderInst.setSamplerBindingsFromTextureMappings(textureMapping);
      renderInst.setInputLayoutAndState(inputLayout, inputState);
      renderInst.drawOnPass(renderHelper.renderCache, passRenderer);
    });
  });
}
