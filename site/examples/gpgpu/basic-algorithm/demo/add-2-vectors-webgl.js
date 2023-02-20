import { Canvas, CanvasEvent } from '@antv/g';
import { Kernel, Plugin } from '@antv/g-plugin-gpgpu';
import { DeviceRenderer, Renderer } from '@antv/g-webgl';

const { BufferUsage } = DeviceRenderer;

const CANVAS_SIZE = 1;
const $canvas = document.createElement('canvas');

// use WebGPU
const renderer = new Renderer();
renderer.registerPlugin(new Plugin());

// create a canvas
const canvas = new Canvas({
  canvas: $canvas,
  width: CANVAS_SIZE,
  height: CANVAS_SIZE,
  renderer,
});

canvas.addEventListener(CanvasEvent.READY, () => {
  const plugin = renderer.getPlugin('device-renderer');
  const device = plugin.getDevice();

  const kernel = new Kernel(device, {
    bundle: {
      shaders: {
        WGSL: '',
        GLSL450:
          '\n\n\nbool gWebGPUDebug = false;\nvec4 gWebGPUDebugOutput = vec4(0.0);\n\nivec3 globalInvocationID = ivec3(gl_GlobalInvocationID);\nivec3 workGroupSize = ivec3(gl_WorkGroupSize);\nivec3 workGroupID = ivec3(gl_WorkGroupID);\nivec3 localInvocationID = ivec3(gl_LocalInvocationID);\nivec3 numWorkGroups = ivec3(gl_NumWorkGroups);\nint localInvocationIndex = int(gl_LocalInvocationIndex);\n\n\nlayout(std430, set = 0, binding = 0) buffer   GWebGPUBuffer0 {\n  float vectorA[];\n} gWebGPUBuffer0;\n\nlayout(std430, set = 0, binding = 1) buffer readonly  GWebGPUBuffer1 {\n  float vectorB[];\n} gWebGPUBuffer1;\n\n\n\nlayout (\n  local_size_x = 8,\n  local_size_y = 1,\n  local_size_z = 1\n) in;\n\n\nfloat sum(float a, float b) {return a + b;}\nvoid main() {float a = gWebGPUBuffer0.vectorA[globalInvocationID.x];\nfloat b = gWebGPUBuffer1.vectorB[globalInvocationID.x];\ngWebGPUBuffer0.vectorA[globalInvocationID.x] = sum(a, b);}\n',
        GLSL100:
          '#ifdef GL_FRAGMENT_PRECISION_HIGH\n  precision highp float;\n#else\n  precision mediump float;\n#endif\n\n\nfloat epsilon = 0.00001;\nvec2 addrTranslation_1Dto2D(float address1D, vec2 texSize) {\n  vec2 conv_const = vec2(1.0 / texSize.x, 1.0 / (texSize.x * texSize.y));\n  vec2 normAddr2D = float(address1D) * conv_const;\n  return vec2(fract(normAddr2D.x + epsilon), normAddr2D.y);\n}\n\nvoid barrier() {}\n  \n\nuniform vec2 u_OutputTextureSize;\nuniform int u_OutputTexelCount;\nvarying vec2 v_TexCoord;\n\nbool gWebGPUDebug = false;\nvec4 gWebGPUDebugOutput = vec4(0.0);\n\n\nuniform sampler2D vectorA;\nuniform vec2 vectorASize;\nfloat getDatavectorA(vec2 address2D) {\n  return float(texture2D(vectorA, address2D).r);\n}\nfloat getDatavectorA(float address1D) {\n  return getDatavectorA(addrTranslation_1Dto2D(address1D, vectorASize));\n}\nfloat getDatavectorA(int address1D) {\n  return getDatavectorA(float(address1D));\n}\nuniform sampler2D vectorB;\nuniform vec2 vectorBSize;\nfloat getDatavectorB(vec2 address2D) {\n  return float(texture2D(vectorB, address2D).r);\n}\nfloat getDatavectorB(float address1D) {\n  return getDatavectorB(addrTranslation_1Dto2D(address1D, vectorBSize));\n}\nfloat getDatavectorB(int address1D) {\n  return getDatavectorB(float(address1D));\n}\nfloat sum(float a, float b) {\nivec3 workGroupSize = ivec3(1, 1, 1);\nivec3 numWorkGroups = ivec3(1, 1, 1);     \nint globalInvocationIndex = int(floor(v_TexCoord.x * u_OutputTextureSize.x))\n  + int(floor(v_TexCoord.y * u_OutputTextureSize.y)) * int(u_OutputTextureSize.x);\nint workGroupIDLength = globalInvocationIndex / (workGroupSize.x * workGroupSize.y * workGroupSize.z);\nivec3 workGroupID = ivec3(workGroupIDLength / numWorkGroups.y / numWorkGroups.z, workGroupIDLength / numWorkGroups.x / numWorkGroups.z, workGroupIDLength / numWorkGroups.x / numWorkGroups.y);\nint localInvocationIDZ = globalInvocationIndex / (workGroupSize.x * workGroupSize.y);\nint localInvocationIDY = (globalInvocationIndex - localInvocationIDZ * workGroupSize.x * workGroupSize.y) / workGroupSize.x;\nint localInvocationIDX = globalInvocationIndex - localInvocationIDZ * workGroupSize.x * workGroupSize.y - localInvocationIDY * workGroupSize.x;\nivec3 localInvocationID = ivec3(localInvocationIDX, localInvocationIDY, localInvocationIDZ);\nivec3 globalInvocationID = workGroupID * workGroupSize + localInvocationID;\nint localInvocationIndex = localInvocationID.z * workGroupSize.x * workGroupSize.y\n                + localInvocationID.y * workGroupSize.x + localInvocationID.x;\nreturn a + b;}\nvoid main() {\nivec3 workGroupSize = ivec3(1, 1, 1);\nivec3 numWorkGroups = ivec3(1, 1, 1);     \nint globalInvocationIndex = int(floor(v_TexCoord.x * u_OutputTextureSize.x))\n  + int(floor(v_TexCoord.y * u_OutputTextureSize.y)) * int(u_OutputTextureSize.x);\nint workGroupIDLength = globalInvocationIndex / (workGroupSize.x * workGroupSize.y * workGroupSize.z);\nivec3 workGroupID = ivec3(workGroupIDLength / numWorkGroups.y / numWorkGroups.z, workGroupIDLength / numWorkGroups.x / numWorkGroups.z, workGroupIDLength / numWorkGroups.x / numWorkGroups.y);\nint localInvocationIDZ = globalInvocationIndex / (workGroupSize.x * workGroupSize.y);\nint localInvocationIDY = (globalInvocationIndex - localInvocationIDZ * workGroupSize.x * workGroupSize.y) / workGroupSize.x;\nint localInvocationIDX = globalInvocationIndex - localInvocationIDZ * workGroupSize.x * workGroupSize.y - localInvocationIDY * workGroupSize.x;\nivec3 localInvocationID = ivec3(localInvocationIDX, localInvocationIDY, localInvocationIDZ);\nivec3 globalInvocationID = workGroupID * workGroupSize + localInvocationID;\nint localInvocationIndex = localInvocationID.z * workGroupSize.x * workGroupSize.y\n                + localInvocationID.y * workGroupSize.x + localInvocationID.x;\nfloat a = getDatavectorA(globalInvocationID.x);\nfloat b = getDatavectorB(globalInvocationID.x);\ngl_FragColor = vec4(sum(a, b));if (gWebGPUDebug) {\n  gl_FragColor = gWebGPUDebugOutput;\n}}\n',
      },
      context: {
        name: '',
        dispatch: [1, 1, 1],
        threadGroupSize: [1, 1, 1],
        maxIteration: 1,
        defines: [],
        uniforms: [
          {
            name: 'vectorA',
            type: 'Float[]',
            storageClass: 'StorageBuffer',
            readonly: false,
            writeonly: false,
            size: [1, 1],
          },
          {
            name: 'vectorB',
            type: 'Float[]',
            storageClass: 'StorageBuffer',
            readonly: true,
            writeonly: false,
            size: [1, 1],
          },
        ],
        globalDeclarations: [],
        output: {
          name: 'vectorA',
          size: [1, 1],
          length: 1,
        },
        needPingpong: true,
      },
    },
  });

  const inputBuffer = device.createBuffer({
    usage: BufferUsage.STORAGE | BufferUsage.COPY_SRC,
    viewOrSize: new Int32Array([1, 2, 3, 4]),
  });
  const outputBuffer = device.createBuffer({
    usage: BufferUsage.STORAGE | BufferUsage.COPY_SRC,
    viewOrSize: new Int32Array([1, 2, 3, 4]),
  });
  const readback = device.createReadback();

  kernel.setBinding(0, inputBuffer);
  kernel.setBinding(1, outputBuffer);

  kernel.dispatch(1, 1);

  (async () => {
    const output = await readback.readBuffer(outputBuffer);

    console.log(output);
  })();
});
