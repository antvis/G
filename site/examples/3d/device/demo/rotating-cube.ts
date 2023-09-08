import { WebGLDeviceContribution } from '@antv/g-plugin-webgl-device';
import { WebGPUDeviceContribution } from '@antv/g-plugin-webgpu-device';
import {
  VertexStepMode,
  Format,
  TransparentWhite,
  BufferUsage,
  BufferFrequencyHint,
  BlendMode,
  BlendFactor,
  TextureUsage,
  CullMode,
  ChannelWriteMask,
  TransparentBlack,
  CompareMode,
} from '@antv/g-plugin-device-renderer';
import * as lil from 'lil-gui';
import { mat4, vec3 } from 'gl-matrix';

/**
 * @see https://webgpu.github.io/webgpu-samples/samples/rotatingCube
 */

const deviceContributionWebGL1 = new WebGLDeviceContribution({
  targets: ['webgl1'],
  onContextCreationError: () => {},
  onContextLost: () => {},
  onContextRestored(e) {},
});
const deviceContributionWebGL2 = new WebGLDeviceContribution({
  targets: ['webgl2', 'webgl1'],
  onContextCreationError: () => {},
  onContextLost: () => {},
  onContextRestored(e) {},
});
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

async function render(
  deviceContribution: WebGLDeviceContribution | WebGPUDeviceContribution,
) {
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

  const program = device.createProgram({
    vertex: {
      glsl: `
layout(std140) uniform Uniforms {
  mat4 u_ModelViewProjectionMatrix;
};

layout(location = 0) in vec3 a_Position;

out vec4 v_Position;

void main() {
  v_Position = vec4(a_Position, 1.0);
  gl_Position = u_ModelViewProjectionMatrix * vec4(a_Position, 1.0);
} 
`,
    },
    fragment: {
      glsl: `
in vec4 v_Position;
out vec4 outputColor;

void main() {
  outputColor = v_Position;
}
`,
    },
  });

  const cubeVertexSize = 4 * 10; // Byte size of one cube vertex.
  const cubePositionOffset = 0;
  const cubeColorOffset = 4 * 4; // Byte offset of cube vertex color attribute.
  const cubeUVOffset = 4 * 8;
  const cubeVertexCount = 36;

  const cubeVertexArray = new Float32Array([
    // float4 position, float4 color, float2 uv,
    1, -1, 1, 1, 1, 0, 1, 1, 0, 1, -1, -1, 1, 1, 0, 0, 1, 1, 1, 1, -1, -1, -1,
    1, 0, 0, 0, 1, 1, 0, 1, -1, -1, 1, 1, 0, 0, 1, 0, 0, 1, -1, 1, 1, 1, 0, 1,
    1, 0, 1, -1, -1, -1, 1, 0, 0, 0, 1, 1, 0,

    1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, -1, 1, 1, 1, 0, 1, 1, 1, 1, 1, -1, -1, 1,
    1, 0, 0, 1, 1, 0, 1, 1, -1, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0,
    1, 1, -1, -1, 1, 1, 0, 0, 1, 1, 0,

    -1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, -1, 1, 1,
    1, 0, 1, 1, 0, -1, 1, -1, 1, 0, 1, 0, 1, 0, 0, -1, 1, 1, 1, 0, 1, 1, 1, 0,
    1, 1, 1, -1, 1, 1, 1, 0, 1, 1, 0,

    -1, -1, 1, 1, 0, 0, 1, 1, 0, 1, -1, 1, 1, 1, 0, 1, 1, 1, 1, 1, -1, 1, -1, 1,
    0, 1, 0, 1, 1, 0, -1, -1, -1, 1, 0, 0, 0, 1, 0, 0, -1, -1, 1, 1, 0, 0, 1, 1,
    0, 1, -1, 1, -1, 1, 0, 1, 0, 1, 1, 0,

    1, 1, 1, 1, 1, 1, 1, 1, 0, 1, -1, 1, 1, 1, 0, 1, 1, 1, 1, 1, -1, -1, 1, 1,
    0, 0, 1, 1, 1, 0, -1, -1, 1, 1, 0, 0, 1, 1, 1, 0, 1, -1, 1, 1, 1, 0, 1, 1,
    0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1,

    1, -1, -1, 1, 1, 0, 0, 1, 0, 1, -1, -1, -1, 1, 0, 0, 0, 1, 1, 1, -1, 1, -1,
    1, 0, 1, 0, 1, 1, 0, 1, 1, -1, 1, 1, 1, 0, 1, 0, 0, 1, -1, -1, 1, 1, 0, 0,
    1, 0, 1, -1, 1, -1, 1, 0, 1, 0, 1, 1, 0,
  ]);

  const vertexBuffer = device.createBuffer({
    viewOrSize: cubeVertexArray,
    usage: BufferUsage.VERTEX,
    // hint: BufferFrequencyHint.DYNAMIC,
  });

  const uniformBuffer = device.createBuffer({
    viewOrSize: 16 * 4, // mat4
    usage: BufferUsage.UNIFORM | BufferUsage.COPY_DST,
    hint: BufferFrequencyHint.DYNAMIC,
  });

  const bindingLayouts = [{ numSamplers: 0, numUniformBuffers: 1 }];

  const inputLayout = device.createInputLayout({
    vertexBufferDescriptors: [
      {
        byteStride: cubeVertexSize,
        stepMode: VertexStepMode.VERTEX,
      },
    ],
    vertexAttributeDescriptors: [
      {
        location: 0,
        bufferIndex: 0,
        bufferByteOffset: 0,
        format: Format.F32_RGB,
      },
    ],
    indexBufferFormat: null,
    program,
  });

  const pipeline = device.createRenderPipeline({
    bindingLayouts,
    inputLayout,
    program,
    colorAttachmentFormats: [Format.U8_RGBA_RT],
    depthStencilAttachmentFormat: Format.D24_S8,
    megaStateDescriptor: {
      attachmentsState: [
        {
          channelWriteMask: ChannelWriteMask.ALL,
          rgbBlendState: {
            blendMode: BlendMode.ADD,
            blendSrcFactor: BlendFactor.SRC_ALPHA,
            blendDstFactor: BlendFactor.ONE_MINUS_SRC_ALPHA,
          },
          alphaBlendState: {
            blendMode: BlendMode.ADD,
            blendSrcFactor: BlendFactor.ONE,
            blendDstFactor: BlendFactor.ONE_MINUS_SRC_ALPHA,
          },
        },
      ],
      blendConstant: TransparentBlack,
      depthWrite: true,
      depthCompare: CompareMode.LESS,
      cullMode: CullMode.BACK,
      stencilWrite: false,
    },
  });

  const bindings = device.createBindings({
    pipeline,
    bindingLayout: bindingLayouts[0],
    uniformBufferBindings: [
      {
        buffer: uniformBuffer,
        wordCount: 16,
      },
    ],
    samplerBindings: [],
  });

  const mainColorRT = device.createRenderTargetFromTexture(
    device.createTexture({
      pixelFormat: Format.U8_RGBA_RT,
      width: $canvas.width,
      height: $canvas.height,
      usage: TextureUsage.RENDER_TARGET,
    }),
  );
  const mainDepthRT = device.createRenderTargetFromTexture(
    device.createTexture({
      pixelFormat: Format.D24_S8,
      width: $canvas.width,
      height: $canvas.height,
      usage: TextureUsage.RENDER_TARGET,
    }),
  );

  let id;
  const frame = () => {
    const aspect = $canvas.width / $canvas.height;
    const projectionMatrix = mat4.perspective(
      mat4.create(),
      (2 * Math.PI) / 5,
      aspect,
      0.1,
      1000,
    );
    const viewMatrix = mat4.identity(mat4.create());
    const modelViewProjectionMatrix = mat4.create();
    mat4.translate(viewMatrix, viewMatrix, vec3.fromValues(0, 0, -4));
    const now = Date.now() / 1000;
    mat4.rotate(
      viewMatrix,
      viewMatrix,
      1,
      vec3.fromValues(Math.sin(now), Math.cos(now), 0),
    );
    mat4.multiply(modelViewProjectionMatrix, projectionMatrix, viewMatrix);
    uniformBuffer.setSubData(
      0,
      new Uint8Array((modelViewProjectionMatrix as Float32Array).buffer),
    );
    // WebGL1 need this
    program.setUniformsLegacy({
      u_ModelViewProjectionMatrix: modelViewProjectionMatrix,
    });

    /**
     * An application should call getCurrentTexture() in the same task that renders to the canvas texture.
     * Otherwise, the texture could get destroyed by these steps before the application is finished rendering to it.
     */
    const onscreenTexture = swapChain.getOnscreenTexture();

    const renderPass = device.createRenderPass({
      colorAttachment: [mainColorRT],
      colorResolveTo: [onscreenTexture],
      colorClearColor: [TransparentWhite],
      depthStencilAttachment: mainDepthRT,
      depthClearValue: 1,
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
    renderPass.setBindings(0, bindings, [0]);
    renderPass.draw(cubeVertexCount, 0);

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
    uniformBuffer.destroy();
    inputLayout.destroy();
    bindings.destroy();
    pipeline.destroy();
    mainColorRT.destroy();
    mainDepthRT.destroy();
    device.destroy();

    // For debug.
    device.checkForLeaks();
  };
}

(async () => {
  let disposeCallback = await render(deviceContributionWebGL2);

  // GUI
  const gui = new lil.GUI({ autoPlace: false });
  $container.appendChild(gui.domElement);
  const rendererFolder = gui.addFolder('renderer');
  const rendererConfig = {
    renderer: 'webgl2',
  };
  rendererFolder
    .add(rendererConfig, 'renderer', ['webgl1', 'webgl2', 'webgpu'])
    .onChange(async (renderer) => {
      if (disposeCallback) {
        disposeCallback();
        // @ts-ignore
        disposeCallback = undefined;
      }

      if (renderer === 'webgl1') {
        disposeCallback = await render(deviceContributionWebGL1);
      } else if (renderer === 'webgl2') {
        disposeCallback = await render(deviceContributionWebGL2);
      } else if (renderer === 'webgpu') {
        disposeCallback = await render(deviceContributionWebGPU);
      }
    });
  rendererFolder.open();
})();
