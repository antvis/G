import { WebGPUDeviceContribution } from '@antv/g-plugin-webgpu-device';
import {
  RenderHelper,
  BufferGeometry,
  VertexBufferFrequency,
  Format,
  fullscreenMegaState,
  fillVec4,
  DeviceProgram,
  AntialiasingMode,
  RGAttachmentSlot,
  makeBackbufferDescSimple,
  makeAttachmentClearDescriptor,
  TransparentWhite,
  ToneMapping,
  opaqueWhiteFullClearRenderPassDescriptor,
  // colorNewFromRGBA,
} from '@antv/g-plugin-device-renderer';

const $container = document.getElementById('container');
const $canvas = document.createElement('canvas');
$canvas.width = 1000;
$canvas.height = 1000;
$canvas.style.width = '500px';
$canvas.style.height = '500px';
$container?.appendChild($canvas);

const deviceContribution = new WebGPUDeviceContribution(
  {
    shaderCompilerPath: '/glsl_wgsl_compiler_bg.wasm',
  },
  // @ts-ignore
  {
    globalThis: window,
  },
);

class TriangleProgram extends DeviceProgram {
  features = {};

  vert = `
layout(location = 0) in vec2 a_Position;

void main() {
  gl_Position = vec4(a_Position, 0., 1.);
} 
`;
  frag = `
out vec4 outputColor;

void main() {
  outputColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`;
}

(async () => {
  // create swap chain and get device
  const swapChain = await deviceContribution.createSwapChain($canvas);
  const device = swapChain.getDevice();

  // TODO: resize
  swapChain.configureSwapChain($canvas.width, $canvas.height);

  const renderHelper = new RenderHelper({
    toneMapping: ToneMapping.NONE,
    toneMappingExposure: 1,
  });
  renderHelper.setDevice(device);
  const renderCache = renderHelper.getCache();
  const renderInstManager = renderHelper.renderInstManager;
  const builder = renderHelper.renderGraph.newGraphBuilder();

  // retrieve at each frame since canvas may resize
  const renderInput = {
    backbufferWidth: $canvas.width,
    backbufferHeight: $canvas.height,
    antialiasingMode: AntialiasingMode.None,
  };
  // create main Color RT
  const mainRenderDesc = makeBackbufferDescSimple(
    RGAttachmentSlot.Color0,
    renderInput,
    // makeAttachmentClearDescriptor(colorNewFromRGBA(1, 0, 0, 1)),
    makeAttachmentClearDescriptor(TransparentWhite),
  );
  // create main Depth RT
  const mainDepthDesc = makeBackbufferDescSimple(
    RGAttachmentSlot.DepthStencil,
    renderInput,
    opaqueWhiteFullClearRenderPassDescriptor,
  );
  const mainColorTargetID = builder.createRenderTargetID(
    mainRenderDesc,
    'Main Color',
  );
  const mainDepthTargetID = builder.createRenderTargetID(
    mainDepthDesc,
    'Main Depth',
  );

  builder.pushPass((pass) => {
    pass.setDebugName('Main Render Pass');
    pass.attachRenderTargetID(RGAttachmentSlot.Color0, mainColorTargetID);
    pass.attachRenderTargetID(RGAttachmentSlot.DepthStencil, mainDepthTargetID);

    const renderInst = renderInstManager.newRenderInst();
    renderInst.setUniformBuffer(renderHelper.uniformBuffer);
    renderInst.setAllowSkippingIfPipelineNotReady(false);
    renderInst.setMegaStateFlags(fullscreenMegaState);
    renderInst.setBindingLayouts([
      {
        numUniformBuffers: 1,
        numSamplers: 0,
        samplerEntries: [],
      },
    ]);
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

    const triangleProgram = new TriangleProgram();
    const program = renderCache.createProgram(triangleProgram);
    renderInst.setProgram(program);

    const geometry = new BufferGeometry(device);
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
      data: new Float32Array([-0.5, 0.5, -0.5, -0.5, 0.5, -0.5]),
    });
    geometry.vertexCount = 3;

    const inputLayout = renderHelper
      .getCache()
      .createInputLayout(geometry.inputLayoutDescriptor);

    const inputState = device.createInputState(
      inputLayout,
      geometry.vertexBuffers.map((buffer) => ({
        buffer,
        byteOffset: 0,
      })),
      null,
      program,
    );

    pass.exec((passRenderer, scope) => {
      // textureMapping[0].texture = scope.getResolveTextureForID(
      //   mainColorResolveTextureID,
      // );
      renderInst.setSamplerBindingsFromTextureMappings([]);
      renderInst.setInputLayoutAndState(inputLayout, inputState);
      renderInst.drawOnPass(renderHelper.renderCache, passRenderer);
    });
  });

  // output to screen
  builder.resolveRenderTargetToExternalTexture(
    mainColorTargetID,
    swapChain.getOnscreenTexture(),
  );

  renderHelper.prepareToRender();
  renderHelper.renderGraph.execute();

  renderInstManager.resetRenderInsts();
})();
