import { Canvas, CanvasEvent } from '@antv/g';
import { Renderer } from '@antv/g-webgl';
import {
  ShaderMaterial,
  BufferGeometry,
  Mesh,
  VertexBufferFrequency,
  Format,
  VertexAttributeLocation,
  Plugin as Plugin3D,
} from '@antv/g-plugin-3d';
import { Plugin as PluginControl } from '@antv/g-plugin-control';
import Stats from 'stats.js';
import * as dat from 'dat.gui';

// create a renderer
const renderer = new Renderer();
renderer.registerPlugin(new Plugin3D());
renderer.registerPlugin(new PluginControl());

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer,
});

// create buffer geometry
const bufferGeometry = new BufferGeometry();
bufferGeometry.setVertexBuffer({
  bufferIndex: 1,
  byteStride: 4 * 3,
  frequency: VertexBufferFrequency.PerVertex,
  attributes: [
    {
      format: Format.F32_RGB,
      bufferByteOffset: 4 * 0,
      location: VertexAttributeLocation.POSITION,
    },
  ],
  // use 6 vertices
  data: Float32Array.from([
    -300.0, 250.0, 100.0, 300.0, 250.0, 100.0, 300.0, -250.0, 100.0, 300.0, -250.0, 100.0, -300.0,
    -250.0, 100.0, -300.0, 250.0, 100.0,
  ]),
});
// draw 6 vertices
bufferGeometry.vertexCount = 6;

const shaderMaterial = new ShaderMaterial({
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
    // float u_NoiseMode;
  };

  layout(location = 0) attribute vec4 a_ModelMatrix0;
  layout(location = 1) attribute vec4 a_ModelMatrix1;
  layout(location = 2) attribute vec4 a_ModelMatrix2;
  layout(location = 3) attribute vec4 a_ModelMatrix3;
  layout(location = 4) attribute vec4 a_Color;
  layout(location = 5) attribute vec4 a_StrokeColor;
  layout(location = 6) attribute vec4 a_StylePacked1;
  layout(location = 7) attribute vec4 a_StylePacked2;
  layout(location = 8) attribute vec4 a_PickingColor;
  layout(location = 9) attribute vec2 a_Anchor;
  varying vec4 v_PickingResult;
  varying vec4 v_Color;
  varying vec4 v_StrokeColor;
  varying vec4 v_StylePacked1;
  varying vec4 v_StylePacked2;
  #define COLOR_SCALE 1. / 255.
  void setPickingColor(vec3 pickingColor) {
    v_PickingResult.rgb = pickingColor * COLOR_SCALE;
  }
  vec4 project(vec4 pos, mat4 pm, mat4 vm, mat4 mm) {
    return pm * vm * mm * pos;
  }
  layout(location = 10) attribute vec3 a_Position;

  void main() {
    mat4 u_ModelMatrix = mat4(a_ModelMatrix0, a_ModelMatrix1, a_ModelMatrix2, a_ModelMatrix3);
    vec4 u_StrokeColor = a_StrokeColor;
    float u_Opacity = a_StylePacked1.x;
    float u_FillOpacity = a_StylePacked1.y;
    float u_StrokeOpacity = a_StylePacked1.z;
    float u_StrokeWidth = a_StylePacked1.w;
    float u_ZIndex = a_PickingColor.w;
    setPickingColor(a_PickingColor.xyz);
    v_Color = a_Color;
    v_StrokeColor = a_StrokeColor;
    v_StylePacked1 = a_StylePacked1;
    v_StylePacked2 = a_StylePacked2;

    gl_Position = project(vec4(a_Position, 1.0), u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix);
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
    // float u_NoiseMode;
  };

  varying vec4 v_PickingResult;
  varying vec4 v_Color;
  varying vec4 v_StrokeColor;
  varying vec4 v_StylePacked1;
  varying vec4 v_StylePacked2;

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
    vec4 u_Color = v_Color;
    vec4 u_StrokeColor = v_StrokeColor;
    float u_Opacity = v_StylePacked1.x;
    float u_FillOpacity = v_StylePacked1.y;
    float u_StrokeOpacity = v_StylePacked1.z;
    float u_StrokeWidth = v_StylePacked1.w;
    float u_Visible = v_StylePacked2.x;
    gbuf_picking = vec4(v_PickingResult.rgb, 1.0);
    if (u_Visible < 1.0) {
      discard;
    }
    gl_FragColor = u_Color;
    gl_FragColor.a = gl_FragColor.a * u_Opacity;

    vec2 st = gl_FragCoord.xy / u_Viewport;
    vec2 pos = vec2(st * u_Level);
    float n = noise(pos);
    gl_FragColor = vec4(vec3(n), 1.0);
  }
  `,
});
shaderMaterial.addUniform({
  name: 'u_Level',
  format: Format.F32_R,
  data: 5,
});
// shaderMaterial.addUniform({
//   name: 'u_NoiseMode',
//   format: Format.F32_R,
//   data: 0,
// });

const mesh = new Mesh({
  style: {
    fill: '#1890FF',
    opacity: 1,
    geometry: bufferGeometry,
    material: shaderMaterial,
  },
});
mesh.setPosition(300, 250, 0);
canvas.appendChild(mesh);

// stats
const stats = new Stats();
stats.showPanel(0);
const $stats = stats.dom;
$stats.style.position = 'absolute';
$stats.style.left = '0px';
$stats.style.top = '0px';
const $wrapper = document.getElementById('container');
$wrapper.appendChild($stats);
canvas.addEventListener(CanvasEvent.AFTER_RENDER, () => {
  if (stats) {
    stats.update();
  }
});

// GUI
const gui = new dat.GUI({ autoPlace: false });
$wrapper.appendChild(gui.domElement);

const noiseFolder = gui.addFolder('noise');
const noiseConfig = {
  level: 5,
};
noiseFolder.add(noiseConfig, 'level', 1, 100, 1).onChange((level) => {
  shaderMaterial.updateUniformData('u_Level', level);
});
noiseFolder.open();
