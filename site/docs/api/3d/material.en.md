---
title: 材质
order: 1
---

不同于 2D 场景下我们用“填充色”、“描边色”、“透明度”等属性描述图形的外观，3D 场景由于需要营造某种“立体感”甚至是“真实感”，需要更为强大、复杂的描述能力，通常称之为“材质” Material。

材质定义了渲染 API 的一些全局状态（例如 OpenGL / WebGL 中的 Blend、深度测试、模版测试等）以及 Shader。其中 Shader 通过程序定义了该材质对于光照的“反应”。

我们知道人眼之所以能看到物体，是由于光线经过场景中一系列复杂的传播，由各种不同的物体表面反射进入人眼。最简单的材质当然是无视“光照”，它呈现出类似 2D 图形的质感，Three.js 中称作 “MeshBasicMaterial”。另一个极端当然是追求极致的“真实感”，也称作 PBR（Physically based rendering），在绝大多数游戏级别的渲染引擎中你都能看到它。在我们熟悉的可视化场景中通常使用介于两者之间的光照模型，它既能看出一定的立体感，又不需要追求极度的真实，Phong 模型就符合这样的要求。

当然除了内置的材质，也可以通过 ShaderMaterial 这种完全自定义的方式使用。

在[示例](/zh/examples/3d#sphere)中，我们使用 [Mesh](/zh/api/3d/mesh) 创建了一个球体，它的几何形体由 [Geometry](/zh/api/3d/geometry) 定义，而外观由 [MeshPhongMaterial](/zh/api/3d/material#meshphongmaterial) 决定。可以看到它的很多用法和 2D 基础图形完全一样，例如添加到画布、变换等：

```js
import {
    MeshPhongMaterial,
    SphereGeometry,
    DirectionalLight,
    Mesh,
    Plugin as Plugin3D,
} from '@antv/g-plugin-3d';

// 等待画布初始化完成
await canvas.ready;
// 获取 GPU Device
const plugin = renderer.getPlugin('device-renderer');
const device = plugin.getDevice();

const sphereGeometry = new SphereGeometry(device, {
    radius: 200,
});
const material = new MeshPhongMaterial(device, {
    map: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*npAsSLPX4A4AAAAAAAAAAAAAARQnAQ',
    // 省略其他参数,
});

// 创建一个 Mesh
const sphere = new Mesh({
    style: {
        x: 300, // 设置局部坐标系下的位置
        y: 250,
        z: 0, // z 轴坐标
        fill: '#1890FF',
        opacity: 1,
        geometry: sphereGeometry,
        material,
    },
});
// 添加到画布
canvas.appendChild(sphere);
```

## 基础属性

我们可以随时修改以下属性，例如：

```js
material.wireframe = true;
material.cullMode = CullMode.BACK;
```

### vertexShader

使用 GLSL 300 语法编写的 Shader 字符串。

### fragmentShader

使用 GLSL 300 语法编写的 Shader 字符串。

### wireframe

是否绘制 wireframe，常用于直观展示三角面。开启后将额外生成重心坐标，原理详见 <https://zhuanlan.zhihu.com/p/48499247>。

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*bsj2S4upLBgAAAAAAAAAAAAAARQnAQ" height='200'/>

```js
const basicMaterial = new MeshBasicMaterial({
    wireframe: true,
    map: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*_aqoS73Se3sAAAAAAAAAAAAAARQnAQ',
});
```

### wireframeColor

开启 wireframe 后可指定颜色，默认为 `'black'`。

### wireframeLineWidth

开启 wireframe 后可指定线宽，默认为 1。

### cullMode

支持以下枚举值，默认使用 `CullMode.NONE`，即不开启背面剔除：

```js
export enum CullMode {
  None,
  Front,
  Back,
  FrontAndBack,
}
```

### frontFace

默认使用 `FrontFace.CCW`，即逆时针方向作为正面 winding order：

```js
export enum FrontFace {
  CCW = GL.CCW,
  CW = GL.CW,
}
```

### depthWrite

是否开启深度测试，默认开启。

### depthCompare

默认使用 `CompareMode.LessEqual`，不同于 WebGL 的默认值 `CompareMode.Less`：

```js
export enum CompareMode {
  Never = GL.NEVER,
  Less = GL.LESS,
  Equal = GL.EQUAL,
  LessEqual = GL.LEQUAL,
  Greater = GL.GREATER,
  NotEqual = GL.NOTEQUAL,
  GreaterEqual = GL.GEQUAL,
  Always = GL.ALWAYS,
}
```

### stencilWrite

是否开启模版测试，默认不开启。

### stencilFront & stencilBack

-   compare 默认使用 `CompareMode.Never`，枚举值同 `depthCompare`。
-   passOp 默认使用 `StencilOp.Keep`，支持以下枚举值：

```js
export enum StencilOp {
  Keep = GL.KEEP,
  Zero = GL.ZERO,
  Replace = GL.REPLACE,
  Invert = GL.INVERT,
  IncrementClamp = GL.INCR,
  DecrementClamp = GL.DECR,
  IncrementWrap = GL.INCR_WRAP,
  DecrementWrap = GL.DECR_WRAP,
}
```

### blendEquation

混合模式支持以下枚举值：

```js
export enum BlendMode {
  Add = GL.FUNC_ADD,
  Subtract = GL.FUNC_SUBTRACT,
  ReverseSubtract = GL.FUNC_REVERSE_SUBTRACT,
}
```

### blendEquationAlpha

枚举值同 blendEquation

### blendSrc

```js
export enum BlendFactor {
  Zero = GL.ZERO,
  One = GL.ONE,
  Src = GL.SRC_COLOR,
  OneMinusSrc = GL.ONE_MINUS_SRC_COLOR,
  Dst = GL.DST_COLOR,
  OneMinusDst = GL.ONE_MINUS_DST_COLOR,
  SrcAlpha = GL.SRC_ALPHA,
  OneMinusSrcAlpha = GL.ONE_MINUS_SRC_ALPHA,
  DstAlpha = GL.DST_ALPHA,
  OneMinusDstAlpha = GL.ONE_MINUS_DST_ALPHA,
}
```

### blendDst

枚举值同 blendSrc

### blendSrcAlpha

枚举值同 blendSrc

### blendDstAlpha

枚举值同 blendSrc

## 基础方法

### setUniforms

添加一组 Uniform，需要与 Shader 中声明的变量类型匹配。

参数列表：

-   uniforms: `Record<string, number | number[] | Texture>`

例如 MeshPhongMaterial 在初始化时会添加如下：

```js
material.setUniform({
    u_Specular: [0, 0, 0],
    u_BumpScale: 5,
    u_Map: mapTexture,
});
```

对应 Shader 中的 Uniform 声明，例如 `u_Specular` 的类型为 `vec3`，在设置时就需要使用长度为 3 的数组进行赋值：

```glsl
layout(std140) uniform ub_MaterialParams {
  vec3 u_Specular;
  float u_BumpScale;
};

uniform sampler2D u_Map;
```

#### 纹理

一个特殊的情况是纹理，例如上面的例子中 `u_Map` 为采样器，在设置时就需要使用纹理：

```js
const mapTexture = plugin.loadTexture(
    'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*_aqoS73Se3sAAAAAAAAAAAAAARQnAQ',
);
material.setUniform({
    u_Map: mapTexture,
});
```

#### 结构体

例如我们为平行光定义了如下结构体：

```glsl
struct DirectionalLight {
  vec3 direction;
  float intensity;
  vec3 color;
};
```

一种特殊情况是结构体数组，例如在 Shader 中声明了一个平行光数组：

```glsl
DirectionalLight directionalLights[NUM_DIR_LIGHTS];
```

当我们想给数组中第一个元素赋值时：

```js
material.setUniform({
    'directionalLights[0].direction': [0, 0, 0],
    'directionalLights[0].color': [0, 0, 0],
});
```

## 内置材质

### PointMaterial

使用 Point 原语绘制。[示例](/zh/examples/3d#point)

#### size

默认值为 1。例如 WebGL 有最大值限制 `gl.ALIASED_POINT_SIZE_RANGE`。

#### map

贴图。

### MeshBasicMaterial

和 Three.js 保持一致：<https://threejs.org/docs/#api/en/materials/MeshBasicMaterial>

该材质不受光照影响，从 FragmentShader 可以看出直接使用 fill 定义的颜色或者 map 定义的贴图：

```glsl
// material.basic.frag

// 公共的 Uniform 定义
#pragma glslify: import('@antv/g-shader-components/scene.both.glsl')
#pragma glslify: import('@antv/g-shader-components/material.both.glsl')

#pragma glslify: import('@antv/g-shader-components/batch.declaration.frag')
#pragma glslify: import('@antv/g-shader-components/uv.declaration.frag')
#pragma glslify: import('@antv/g-shader-components/map.declaration.frag')
#pragma glslify: import('@antv/g-shader-components/wireframe.declaration.frag')
#pragma glslify: import('@antv/g-shader-components/fog.declaration.frag')

void main() {
  // 通用属性，例如 fill opacity
  #pragma glslify: import('@antv/g-shader-components/batch.frag')
  // 贴图
  #pragma glslify: import('@antv/g-shader-components/map.frag')

  gbuf_color = u_Color;
  gbuf_color.a = gbuf_color.a * u_Opacity;

  // 绘制 wireframe
  #pragma glslify: import('@antv/g-shader-components/wireframe.frag')
  // 场景雾
  #pragma glslify: import('@antv/g-shader-components/fog.frag')
}
```

#### map

漫反射贴图，例如：

```js
const map = plugin.loadTexture(
    'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*_aqoS73Se3sAAAAAAAAAAAAAARQnAQ',
);
const basicMaterial = new MeshBasicMaterial({
    map,
});
```

### MeshLambertMaterial

继承自 MeshBasicMaterial，使用 Lambertian 模型，无高光。

### MeshPhongMaterial

继承自 MeshBasicMaterial，使用 Blinn-Phong 光照模型。

在多伦多大学的某教学页面上可以看到 Phong 模型的一个基础实现： <http://www.cs.toronto.edu/~jacobson/phong-demo/>

该模型将直接光照部分“漫反射”、高光与间接光照部分“环境光”累加，得出最终的贡献值。从下图中我们能看到物体表面的法线、光源到物体表面的入射方向，以及人眼（相机）的观察方向都需要考虑。

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*5T2tRpOO8P8AAAAAAAAAAAAAARQnAQ" height='200'/>

下图为实际渲染效果：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*WeScR4Wmg2YAAAAAAAAAAAAAARQnAQ" height='200'/>

以下参数可以在该[示例](/zh/examples/3d#sphere)中调整。

#### emissive

自发光颜色。

#### specular

高光颜色。

#### specularMap

高光贴图。例如[示例](/zh/examples/3d#sphere)中使用的：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*8wz0QaP_bjoAAAAAAAAAAAAAARQnAQ" height='200'/>

#### shininess

高光闪亮程度

#### bumpMap

凹凸贴图，用于干扰法线。例如[示例](/zh/examples/3d#sphere)中使用的：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*IZNyQ4_m7aMAAAAAAAAAAAAAARQnAQ" height='200'/>

#### bumpScale

凹凸贴图影响程度。

### ShaderMaterial

自定义材质，其中 vertex/fragmentShader 需要指定：

```js
const shaderMaterial = new ShaderMaterial(device, {
    vertexShader: ``,
    fragmentShader: ``,
});
```

## 注意事项

### 尽可能复用

考虑到渲染性能，在使用过程中应该尽可能少地创建材质。特别是在可视化场景下，完全可以做到大量图形共享同一个材质：

```js
// 创建共享材质
const material = new MeshBasicMaterial();

// 1k 个 Mesh 共享
for (let i = 0; i < 1000; i++) {
    const mesh = new Mesh({
        style: {
            // 省略其他样式属性
            material,
        },
    });
}
```

## Shader 工程化

我们尝试解决以下问题：

-   一套 Shader 适应不同渲染 API，例如 WebGL 1/2、WebGPU
-   Shader 开发体验，例如编辑器的高亮、智能提示
-   模块化，即 Shader chunks 的复用

### Shader 语言选择

在 Shader 语言上我们选择 WebGL 2 使用的 GLSL 300，通过运行时简单字符串替换完成对 WebGL 1 使用的 GLSL 100 的兼容。同时使用 Rust 社区的 naga（打包成 wasm 形式）完成在运行时从 GLSL 到 WGSL 的转译，以支持 WebGPU。

例如下面展示了对于 UBO 从 GLSL 300 到 WGSL 的转译：

```glsl
// GLSL
layout(std140) uniform ub_SceneParams {
  mat4 u_ProjectionMatrix;
  mat4 u_ViewMatrix;
  vec3 u_CameraPosition;
  float u_DevicePixelRatio;
};

// WGSL
[[block]]
struct ub_SceneParams {
    u_ProjectionMatrix: mat4x4<f32>;
    u_ViewMatrix: mat4x4<f32>;
    u_CameraPosition: vec3<f32>;
    u_DevicePixelRatio: f32;
};
```

### Shader 语法高亮

很多引擎使用模版字符串存放 Shader 代码，例如 Three.js、Clay.gl 等：

```js
// https://github.com/mrdoob/three.js/blob/e1ead8c5c2/src/renderers/shaders/ShaderChunk/alphamap_fragment.glsl.js
export default /* glsl */ `
#ifdef USE_ALPHAMAP
 diffuseColor.a *= texture2D( alphaMap, vUv ).g;
#endif
`;
```

好处是无需额外的构建工具 loader/插件，坏处就是丧失了语法高亮，在 Shader 开发时容易犯错。我们希望使用编辑器的高亮以及 Lint，例如配合 VS Code GLSL Lint 插件。因此 shader 需要以 \*.glsl/vert/frag 形式存在，使用时以文本形式引入：

```js
// 引入文本字符串
import vert from './xxx.vert';
import frag from './xxx.frag';
```

可以使用构建工具的插件/ loader 实现，例如：

-   babel-inline-import
-   webpack raw-loader

我们希望使用同一个构建工具打 esm / cjs / umd，另外考虑到 wasm，最终选择 rollup-plugin-glslify，并且这个插件还有另一个好处。

### Shader chunks 复用

如何组织 shader chunks 是一个很麻烦的问题，总有需要复用的代码片段。

Babylon.js 会使用预编译指令，自行完成片段 / 占位符的引入，但这发生在运行时：

```glsl
#include<clipPlaneFragmentDeclaration>

uniform vec4 color;

void main(void) {
  #include<clipPlaneFragment>
 gbuf_color = color;
}
```

在构建时完成替换可以省掉 compiler 代码，现成的方案是 glslify，但需要配合构建工具，例如：

-   webpack <https://github.com/glslify/glslify-loader>
-   babel <https://github.com/onnovisser/babel-plugin-glsl>
-   rollup rollup-plugin-glslify 我们选择它

```glsl
// main.frag
#pragma glslify: import('./common.glsl')

void main() {
  gbuf_color = vec4(color, 1.0);
}
```

但问题是会增大包体积，毕竟共用的 chunk 都内联在每个内置 Shader 字符串中了。

参考 stack.gl 建立的一系列 shader components：<https://github.com/glslify/glsl-easings> 我们也提供一个 `@antv/g-shader-components` 包提供内置的所有 chunks。

### Shader 压缩

Shader 代码中多余的空格、换行、注释最好压缩掉，因为经过上述基于 glslify 的构建流程后，它们都包含在字符串中：

```js
// index.esm.js
var vert$1 = '#define GLSLIFY 1\n#define PI 3.1415926535...';
```
