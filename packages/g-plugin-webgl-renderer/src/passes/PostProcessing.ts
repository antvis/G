import { inject, singleton } from 'mana-syringe';
import { BufferGeometry } from '../geometries';
import { Format, InputLayout, InputState, Program, VertexBufferFrequency } from '../platform';
import { fullscreenMegaState } from '../platform/utils';
import { DeviceProgram, fillVec4, RenderHelper, TextureMapping } from '../render';
import { RGAttachmentSlot, RGGraphBuilder } from '../render/interfaces';
import { RenderInput } from '../render/RenderGraphHelpers';

@singleton()
export class PostProcessing {
  @inject(RenderHelper)
  private renderHelper: RenderHelper;

  protected deviceProgram: DeviceProgram;
  protected debugName: string;

  protected geometry: BufferGeometry;
  protected inputState: InputState;
  protected inputLayout: InputLayout;
  protected textureMappings: TextureMapping[] = [];
  protected program: Program;

  init() {
    const program = this.renderHelper.renderCache.createProgram(this.deviceProgram);

    this.geometry = new BufferGeometry(this.renderHelper.getDevice());
    this.geometry.setVertexBuffer({
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
    this.geometry.vertexCount = 3;

    this.inputLayout = this.renderHelper
      .getCache()
      .createInputLayout(this.geometry.inputLayoutDescriptor);

    this.inputState = this.renderHelper.getDevice().createInputState(
      this.inputLayout,
      this.geometry.vertexBuffers.map((buffer) => ({
        buffer,
        byteOffset: 0,
      })),
      null,
      program,
    );
  }

  build(builder: RGGraphBuilder, renderInput: RenderInput, mainColorTargetID: number) {
    builder.pushPass((pass) => {
      pass.setDebugName(this.debugName);
      pass.attachRenderTargetID(RGAttachmentSlot.Color0, mainColorTargetID);

      const mainColorResolveTextureID = builder.resolveRenderTarget(mainColorTargetID);
      pass.attachResolveTexture(mainColorResolveTextureID);

      const renderInst = this.renderHelper.renderInstManager.newRenderInst();
      renderInst.setUniformBuffer(this.renderHelper.uniformBuffer);
      renderInst.setAllowSkippingIfPipelineNotReady(false);

      renderInst.setMegaStateFlags(fullscreenMegaState);
      renderInst.drawPrimitives(3);

      renderInst.setBindingLayouts([{ numUniformBuffers: 1, numSamplers: 1 }]);

      // since gl_VertexID is not available in GLSL 100, we need to use a geometry
      let offs = renderInst.allocateUniformBuffer(0, 4);
      const d = renderInst.mapUniformBufferF32(0);
      fillVec4(d, offs, 1.0 / renderInput.backbufferWidth, 1.0 / renderInput.backbufferHeight);

      renderInst.setProgram(this.program);

      pass.exec((passRenderer, scope) => {
        this.textureMappings[0].texture = scope.getResolveTextureForID(mainColorResolveTextureID);
        renderInst.setSamplerBindingsFromTextureMappings(this.textureMappings);
        renderInst.setInputLayoutAndState(this.inputLayout, this.inputState);
        renderInst.drawOnPass(this.renderHelper.renderCache, passRenderer);
      });
    });
  }

  destroy() {
    this.geometry.destroy();
    this.inputLayout.destroy();
    this.inputState.destroy();
  }
}
