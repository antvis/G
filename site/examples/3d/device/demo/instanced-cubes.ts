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
 * @see https://webgpu.github.io/webgpu-samples/samples/instancedCube#main.ts
 */
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
  mat4 u_ModelViewProjectionMatrix[16];
};

layout(location = 0) in vec3 a_Position;

out vec4 v_Position;

void main() {
  v_Position = vec4(a_Position, 1.0);
  gl_Position = u_ModelViewProjectionMatrix[gl_InstanceID] * vec4(a_Position, 1.0);
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

  const xCount = 4;
  const yCount = 4;
  const numInstances = xCount * yCount;
  const matrixFloatCount = 16; // 4x4 matrix
  const matrixSize = 4 * matrixFloatCount;
  const uniformBufferSize = numInstances * matrixSize;

  const vertexBuffer = device.createBuffer({
    viewOrSize: cubeVertexArray,
    usage: BufferUsage.VERTEX,
  });

  const uniformBuffer = device.createBuffer({
    viewOrSize: uniformBufferSize, // mat4
    usage: BufferUsage.UNIFORM | BufferUsage.COPY_DST,
    hint: BufferFrequencyHint.DYNAMIC,
  });

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
    uniformBufferBindings: [
      {
        buffer: uniformBuffer,
        byteLength: matrixSize * numInstances,
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

  const aspect = $canvas.width / $canvas.height;
  const projectionMatrix = mat4.perspective(
    mat4.create(),
    (2 * Math.PI) / 5,
    aspect,
    1,
    100,
  );
  const modelMatrices = new Array<mat4>(numInstances);
  const mvpMatricesData = new Float32Array(matrixFloatCount * numInstances);

  const step = 4.0;

  // Initialize the matrix data for every instance.
  let m = 0;
  for (let x = 0; x < xCount; x++) {
    for (let y = 0; y < yCount; y++) {
      modelMatrices[m] = mat4.fromTranslation(
        mat4.create(),
        vec3.fromValues(
          step * (x - xCount / 2 + 0.5),
          step * (y - yCount / 2 + 0.5),
          0,
        ),
      );
      m++;
    }
  }

  const viewMatrix = mat4.fromTranslation(
    mat4.create(),
    vec3.fromValues(0, 0, -12),
  );
  const tmpMat4 = mat4.create();

  let id;
  const frame = () => {
    const now = Date.now() / 1000;

    let m = 0,
      i = 0;
    for (let x = 0; x < xCount; x++) {
      for (let y = 0; y < yCount; y++) {
        mat4.rotate(
          tmpMat4,
          modelMatrices[i],
          1,
          vec3.fromValues(
            Math.sin((x + 0.5) * now),
            Math.cos((y + 0.5) * now),
            0,
          ),
        );

        mat4.multiply(tmpMat4, viewMatrix, tmpMat4);
        mat4.multiply(tmpMat4, projectionMatrix, tmpMat4);

        mvpMatricesData.set(tmpMat4, m);

        i++;
        m += matrixFloatCount;
      }
    }

    uniformBuffer.setSubData(0, new Uint8Array(mvpMatricesData.buffer));

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
    renderPass.setBindings(bindings);
    renderPass.draw(cubeVertexCount, numInstances);

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
    .add(rendererConfig, 'renderer', ['webgl2', 'webgpu'])
    .onChange(async (renderer) => {
      if (disposeCallback) {
        disposeCallback();
        // @ts-ignore
        disposeCallback = undefined;
      }

      if (renderer === 'webgl2') {
        disposeCallback = await render(deviceContributionWebGL2);
      } else if (renderer === 'webgpu') {
        disposeCallback = await render(deviceContributionWebGPU);
      }
    });
  rendererFolder.open();
})();
