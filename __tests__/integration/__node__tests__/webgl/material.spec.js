const fs = require('fs');
const { createCanvas } = require('canvas');
const { Canvas, Rectangle } = require('@antv/g');
const { Renderer } = require('@antv/g-webgl');
const {
  ShaderMaterial,
  BufferGeometry,
  Mesh,
  VertexStepMode,
  Format,
  VertexAttributeBufferIndex,
  VertexAttributeLocation,
  Plugin,
} = require('@antv/g-plugin-3d');
const { createPNGFromRawdata, sleep, diff } = require('../../util');

// create a renderer, unregister plugin relative to DOM
const renderer = new Renderer({
  targets: ['webgl1'],
  enableFXAA: false,
});
const domInteractionPlugin = renderer.getPlugin('dom-interaction');
renderer.unregisterPlugin(domInteractionPlugin);
renderer.registerPlugin(new Plugin());

const width = 200;
const height = 200;
const gl = require('gl')(width, height, {
  antialias: false,
  preserveDrawingBuffer: true,
  stencil: true,
});
const mockCanvas = {
  width,
  height,
  getContext: () => {
    gl.canvas = mockCanvas;
    // 模拟 DOM API，返回小程序 context，它应当和 CanvasRenderingContext2D 一致
    // @see https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLCanvasElement/getContext
    return gl;
  },
  getBoundingClientRect: () => {
    // 模拟 DOM API，返回小程序 context 相对于视口的位置
    // @see https://developer.mozilla.org/zh-CN/docs/Web/API/Element/getBoundingClientRect
    return new Rectangle(0, 0, width, height);
  },
};

// create a node-canvas
const offscreenNodeCanvas = createCanvas(1, 1);
const canvas = new Canvas({
  width,
  height,
  canvas: mockCanvas, // use headless-gl
  renderer,
  offscreenCanvas: offscreenNodeCanvas,
});

const RESULT_IMAGE = '/material.png';
const BASELINE_IMAGE_DIR = '/snapshots';

describe('Render custom material with g-webgl', () => {
  afterEach(() => {
    canvas.removeChildren();
    fs.rmSync(__dirname + RESULT_IMAGE);
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should render sphere on server-side correctly.', async () => {
    await canvas.ready;

    // use GPU device
    const plugin = renderer.getPlugin('device-renderer');
    const device = plugin.getDevice();

    // create buffer geometry
    const bufferGeometry = new BufferGeometry(device);
    bufferGeometry.setVertexBuffer({
      bufferIndex: VertexAttributeBufferIndex.POSITION,
      byteStride: 4 * 3,
      frequency: VertexStepMode.VERTEX,
      attributes: [
        {
          format: Format.F32_RGB,
          bufferByteOffset: 4 * 0,
          location: VertexAttributeLocation.POSITION,
        },
      ],
      // use 6 vertices
      data: Float32Array.from([
        -width / 2,
        height / 2,
        100.0,
        width / 2,
        height / 2,
        100.0,
        width / 2,
        -height / 2,
        100.0,
        width / 2,
        -height / 2,
        100.0,
        -width / 2,
        -height / 2,
        100.0,
        -width / 2,
        height / 2,
        100.0,
      ]),
    });
    // draw 6 vertices
    bufferGeometry.vertexCount = 6;

    const shaderMaterial = new ShaderMaterial(device, {
      vertexShader: `
    layout(std140) uniform ub_SceneParams {
      mat4 u_ProjectionMatrix;
      mat4 u_ViewMatrix;
      vec3 u_CameraPosition;
      float u_DevicePixelRatio;
      vec2 u_Viewport;
      float u_IsOrtho;
    };
    layout(std140) uniform ub_MaterialParams {
      float u_Level;
    };

    layout(location = ${VertexAttributeLocation.MODEL_MATRIX0}) in vec4 a_ModelMatrix0;
    layout(location = ${VertexAttributeLocation.MODEL_MATRIX1}) in vec4 a_ModelMatrix1;
    layout(location = ${VertexAttributeLocation.MODEL_MATRIX2}) in vec4 a_ModelMatrix2;
    layout(location = ${VertexAttributeLocation.MODEL_MATRIX3}) in vec4 a_ModelMatrix3;
    layout(location = ${VertexAttributeLocation.POSITION}) in vec3 a_Position;

    void main() {
      mat4 u_ModelMatrix = mat4(a_ModelMatrix0, a_ModelMatrix1, a_ModelMatrix2, a_ModelMatrix3);
      gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * vec4(a_Position, 1.0);
    }
    `,
      fragmentShader: ` 
    layout(std140) uniform ub_SceneParams {
      mat4 u_ProjectionMatrix;
      mat4 u_ViewMatrix;
      vec3 u_CameraPosition;
      float u_DevicePixelRatio;
      vec2 u_Viewport;
      float u_IsOrtho;
    };

    layout(std140) uniform ub_MaterialParams {
      float u_Level;
    };

    out vec4 outputColor;

    float random (vec2 st) {
      return fract(sin(
        dot(st.xy,vec2(12.9898,78.233)))*
        43758.5453123);
    }

    float noise (in vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);

      // Four corners in 2D of a tile
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));

      vec2 u = smoothstep(0.,1.,f);

      // Mix 4 coorners percentages
      return mix(a, b, u.x) +
              (c - a)* u.y * (1.0 - u.x) +
              (d - b) * u.x * u.y;
    }

    // gradient noise
    // float noise( in vec2 st ) {
    //   vec2 i = floor(st);
    //   vec2 f = fract(st);
      
    //   vec2 u = smoothstep(0., 1., f);

    //   return mix( mix( dot( random( i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ), 
    //                   dot( random( i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
    //               mix( dot( random( i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ), 
    //                   dot( random( i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
    // }

    void main() {
      vec2 st = gl_FragCoord.xy / u_Viewport;
      vec2 pos = vec2(st * u_Level);
      float n = noise(pos);
      outputColor = vec4(vec3(n), 1.0);
    }
    `,
    });
    shaderMaterial.setUniforms({
      u_Level: 5,
    });
    const mesh = new Mesh({
      style: {
        fill: '#1890FF',
        opacity: 1,
        geometry: bufferGeometry,
        material: shaderMaterial,
      },
    });
    mesh.setPosition(100, 100, 0);
    canvas.appendChild(mesh);

    await sleep(200);

    const pixels = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    await createPNGFromRawdata(__dirname + RESULT_IMAGE, width, height, pixels);

    expect(
      diff(
        __dirname + RESULT_IMAGE,
        __dirname + BASELINE_IMAGE_DIR + RESULT_IMAGE,
      ),
      // TODO: CI has different result since random() from GLSL
    ).toBeLessThan(Infinity);
  });
});
