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
  PrimitiveTopology,
  copyMegaState,
  defaultMegaState,
  BufferUsage,
  BufferFrequencyHint,
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

  const onscreenTexture = swapChain.getOnscreenTexture();

  const renderHelper = new RenderHelper({
    toneMapping: ToneMapping.NONE,
    toneMappingExposure: 1,
  });
  renderHelper.setDevice(device);

  // TODO: resize
  swapChain.configureSwapChain($canvas.width, $canvas.height);

  const program = renderHelper.renderCache.createProgram(new TriangleProgram());

  const vertexBuffer = device.createBuffer({
    viewOrSize: new Float32Array([-0.5, 0.5, -0.5, -0.5, 0.5, -0.5]),
    usage: BufferUsage.VERTEX,
    hint: BufferFrequencyHint.Dynamic,
  });

  const inputLayout = device.createInputLayout({
    vertexBufferDescriptors: [
      {
        byteStride: 4 * 2,
        frequency: VertexBufferFrequency.PerVertex,
      },
    ],
    vertexAttributeDescriptors: [
      {
        location: 0,
        bufferIndex: 0,
        bufferByteOffset: 0,
        format: Format.F32_RG,
      },
    ],
    indexBufferFormat: null,
    program,
  });

  const pipeline = device.createRenderPipeline({
    bindingLayouts: [],
    inputLayout,
    megaStateDescriptor: copyMegaState(defaultMegaState),
    program,
    topology: PrimitiveTopology.Triangles,
    colorAttachmentFormats: [Format.U8_RGBA_RT],
    depthStencilAttachmentFormat: null,
    sampleCount: 1,
  });

  const renderTarget = device.createRenderTargetFromTexture(onscreenTexture);

  const render = () => {
    const renderPass = device.createRenderPass({
      colorAttachment: [renderTarget],
      colorAttachmentLevel: [0],
      colorClearColor: [TransparentWhite],
      colorResolveTo: [null],
      colorResolveToLevel: [0],
      colorStore: [true],
      depthStencilAttachment: null,
      depthStencilResolveTo: null,
      depthStencilStore: false,
      depthClearValue: 'load',
      stencilClearValue: 'load',
      occlusionQueryPool: null,
    });

    renderPass.setPipeline(pipeline);
    renderPass.setVertexInput(
      inputLayout,
      [
        {
          buffer: vertexBuffer,
          byteOffset: 0,
        },
      ],
      null,
    );
    renderPass.setViewport(0, 0, $canvas.width, $canvas.height);
    // renderPass.setBindings();
    renderPass.draw(3, 0);

    device.submitPass(renderPass);
    requestAnimationFrame(render);
  };
  render();
})();
