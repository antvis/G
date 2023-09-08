import { WebGPUDeviceContribution } from '@antv/g-plugin-webgpu-device';
import {
  VertexStepMode,
  Format,
  TransparentWhite,
  BufferUsage,
  BufferFrequencyHint,
} from '@antv/g-plugin-device-renderer';

/**
 * Draw a triangle
 * @see https://webgpu.github.io/webgpu-samples/samples/helloTriangle
 */

const deviceContributionWebGPU = new WebGPUDeviceContribution(
  {
    shaderCompilerPath: '/glsl_wgsl_compiler_bg.wasm',
  },
  // @ts-ignore
  {
    globalThis: window,
  },
);

const $container = document.getElementById('container')!;
const $canvasContainer = document.createElement('div');
$canvasContainer.id = 'canvas';
$container.appendChild($canvasContainer);

async function render(deviceContribution: WebGPUDeviceContribution) {
  $canvasContainer.innerHTML = '';
  const $canvas = document.createElement('canvas');
  $canvas.width = 1000;
  $canvas.height = 1000;
  $canvas.style.width = '500px';
  $canvas.style.height = '500px';
  $canvasContainer.appendChild($canvas);

  // create swap chain and get device
  const swapChain = await deviceContribution.createSwapChain($canvas);

  // TODO: resize
  swapChain.configureSwapChain($canvas.width, $canvas.height);
  const device = swapChain.getDevice();

  const onscreenTexture = swapChain.getOnscreenTexture();

  const program = device.createProgram({
    vertex: {
      wgsl: `
@vertex
fn main(
  @builtin(vertex_index) VertexIndex : u32
) -> @builtin(position) vec4<f32> {
  var pos = array<vec2<f32>, 3>(
    vec2(0.0, 0.5),
    vec2(-0.5, -0.5),
    vec2(0.5, -0.5)
  );

  return vec4<f32>(pos[VertexIndex], 0.0, 1.0);
}
`,
    },
    fragment: {
      wgsl: `
@fragment
fn main() -> @location(0) vec4<f32> {
  return vec4(1.0, 0.0, 0.0, 1.0);
}
`,
    },
  });

  const vertexBuffer = device.createBuffer({
    viewOrSize: new Float32Array([0, 0.5, -0.5, -0.5, 0.5, -0.5]),
    usage: BufferUsage.VERTEX,
    hint: BufferFrequencyHint.DYNAMIC,
  });
  device.setResourceName(vertexBuffer, 'a_Position');

  const inputLayout = device.createInputLayout({
    vertexBufferDescriptors: [
      {
        byteStride: 4 * 2,
        stepMode: VertexStepMode.VERTEX,
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
    inputLayout,
    program,
    colorAttachmentFormats: [Format.U8_RGBA_RT],
  });

  const renderTarget = device.createRenderTarget({
    pixelFormat: Format.U8_RGBA_RT,
    width: $canvas.width,
    height: $canvas.height,
  });
  device.setResourceName(renderTarget, 'Main Render Target');

  let id;
  const frame = () => {
    const renderPass = device.createRenderPass({
      colorAttachment: [renderTarget],
      colorResolveTo: [onscreenTexture],
      colorClearColor: [TransparentWhite],
    });

    renderPass.setPipeline(pipeline);
    renderPass.setVertexInput(
      inputLayout,
      [
        {
          buffer: vertexBuffer,
        },
      ],
      null,
    );
    renderPass.setViewport(0, 0, $canvas.width, $canvas.height);
    renderPass.draw(3, 0);

    device.submitPass(renderPass);
    id = requestAnimationFrame(frame);
  };

  frame();

  return () => {
    if (id) {
      cancelAnimationFrame(id);
    }
    program.destroy();
    vertexBuffer.destroy();
    inputLayout.destroy();
    pipeline.destroy();
    renderTarget.destroy();
    device.destroy();

    // For debug.
    device.checkForLeaks();
  };
}

(async () => {
  await render(deviceContributionWebGPU);
})();
