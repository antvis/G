# @antv/g-shader-components

## 使用方式

基于 glslify 提供 chunks。

目前在 G 中 `g-plugin-3d` `g-plugin-device-renderer` 会使用该包，在使用时需要配合 rollup-plugin-glslify，例如下面是 MeshBasicMaterial 使用的 FS：

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

## 文件名命名规范

-   `.vert` 只能在 Vertex Shader 中使用。
-   `.frag` 只能在 Fragment Shader 中使用。

带有 `.declaration.` 部分的在 Shader 开头全局作用域中使用，反之在 `main` 函数中执行。

## 内置 Chunks

### scene

包含场景通用的 Uniform 声明

-   scene.both.glsl

### material

包含材质通用的 Uniform 声明

-   material.both.glsl

### uv

纹理坐标

-   uv.vert 将 a_Uv 顶点数据传给 v_Uv
-   uv.declaration.frag 声明 v_Uv，后续纹理查询使用

### wireframe

提供 wireframe 绘制，常用于调试或某种风格化效果。暂不支持边框颜色和宽度的配置。

-   wireframe.vert 将 a_Barycentric 重心坐标数据传给 v_Barycentric
-   wireframe.frag 调用计算 edgeFactor 函数
-   wireframe.declaration.frag 声明 edgeFactor 函数

### fog

提供简单的场景雾效果。支持 exp、exp2 和 linear 三种类型。

-   fog.declaration.vert 声明深度
-   fog.declaration.frag 提供深度雾函数
-   fog.frag 在计算完光照后，调用函数

### map

漫反射贴图

-   map.declaration.frag 声明采样器
-   map.frag 纹理采样

### bump map

参考 Three.js 的实现，基于原始论文：https://www.dropbox.com/s/l1yl164jb3rhomq/mm_sfgrad_bump.pdf?dl=0

-   bumpmap.declaration.frag

采样发生在 normal chunk 中。

### specular map

漫反射贴图

-   specularmap.declaration.frag 声明采样器
-   specularmap.frag 纹理采样

### normal

-   normal.frag 计算法线
-   normalmap.frag 使用凹凸贴图、法线贴图计算最终法线值

### sdf

提供 2D 图形的 SDF

-   sdf.circle.glsl
-   sdf.ellipse.glsl
-   sdf.rect.glsl

### 光照计算
