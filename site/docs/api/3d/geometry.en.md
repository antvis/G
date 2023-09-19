---
title: 几何
order: 2
---

再复杂的模型都可以用“三角面”来描述，区别只在于数量多少。因此在 3D 世界中我们用这种描述能力更强的方式定义几何形状，它们可以是我们熟悉的 Circle、Rect，也可以是“犹他茶壶”。

我们内置了一些常用的几何，例如 Cube、Sphere 等，它们在运行时程序化生成。

可以随时启用材质的 [wireframe](/zh/api/3d/material#wireframe) 属性查看几何中包含的三角面：

```js
material.wireframe = true;
```

在该[示例](/zh/examples/3d#sphere)中效果如下，可以看出一个 Sphere 球体是由不同经纬度上的众多三角面组成：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*bsj2S4upLBgAAAAAAAAAAAAAARQnAQ" height='200'/>

## 内置几何

当我们想修改几何信息时，例如改变一个几何形状为 CubeGeometry 的 Mesh 时，应该在几何而非 Mesh 上操作：

```js
import {
    MeshBasicMaterial,
    CubeGeometry,
    Mesh,
    Plugin as Plugin3D,
} from '@antv/g-plugin-3d';

// 创建几何
const cubeGeometry = new CubeGeometry(device, {
    width: 200,
    height: 200,
    depth: 200,
});

// 创建 Mesh
const cube = new Mesh({
    style: {
        fill: '#1890FF',
        opacity: 1,
        geometry: cubeGeometry,
        material: basicMaterial,
    },
});

// 修改这个形状为 Cube 的 Mesh 宽度
// 正确用法
cubeGeometry.width = 300;
// 或者
cube.style.geometry.width = 300;

// 错误用法
cube.style.width = 300;
```

### CubeGeometry

立方体，[示例](/zh/examples/3d#cube)

<img alt="cube" src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*sHGXQpeIYzoAAAAAAAAAAAAAARQnAQ" height='200'/>

| 属性名         | 说明                       |
| -------------- | -------------------------- |
| width          | 宽度，必填                 |
| height         | 高度，必填                 |
| depth          | 深度，必填                 |
| widthSegments  | 影响程序化生成，默认值为 1 |
| heightSegments | 影响程序化生成，默认值为 1 |
| depthSegments  | 影响程序化生成，默认值为 1 |

### SphereGeometry

球体，[示例](/zh/examples/3d#sphere)

<img alt="sphere" src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*bsj2S4upLBgAAAAAAAAAAAAAARQnAQ" height='200'/>

| 属性名         | 说明                       |
| -------------- | -------------------------- |
| radius         | 球半径，必填，默认值为 0.5 |
| latitudeBands  | 默认值为 16                |
| longitudeBands | 默认值为 16                |

### PlaneGeometry

平面，默认躺在 XZ 平面上，[示例](/zh/examples/3d#plane)

<img alt="plane" src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*jN9zQp3RflAAAAAAAAAAAAAAARQnAQ" height='200'/>

| 属性名        | 说明       |
| ------------- | ---------- |
| width         | 宽度       |
| depth         | 深度       |
| widthSegments | 默认值为 5 |
| depthSegments | 默认值为 5 |

### TorusGeometry

圆环，[示例](/zh/examples/3d#torus)

<img alt="torus" src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*So7oT4qDvLkAAAAAAAAAAAAAARQnAQ" height='200'/>

| 属性名     | 说明               |
| ---------- | ------------------ |
| tubeRadius | 选填，默认值为 0.2 |
| ringRadius | 选填，默认值为 0.3 |
| segments   | 选填，默认值为 30  |
| sides      | 选填，默认值为 20  |

### CylinderGeometry

圆柱，[示例](/zh/examples/3d#cylinder)

<img alt="cylinder" src="https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*Vx-bSZTGKrIAAAAAAAAAAAAADmJ7AQ/original" height='200'/>

| 属性名         | 说明                               |
| -------------- | ---------------------------------- |
| radius         | 圆柱体顶面半径，默认值为 0.5       |
| height         | 圆柱体高度，默认值为 1             |
| heightSegments | 圆柱体身体曲面划分数目，默认值为 5 |
| capSegments    | 圆柱体顶面划分数目，默认值为 20    |

### ConeGeometry

圆锥，[示例](/zh/examples/3d#cone)

<img alt="cone" src="https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*4v4GQrGXA_UAAAAAAAAAAAAADmJ7AQ/original" height='200'/>

| 属性名         | 说明                               |
| -------------- | ---------------------------------- |
| baseRadius     | 圆锥体底面半径，默认值为 0.5       |
| peakRadius     | 圆锥体顶面半径，默认值为 0         |
| height         | 圆锥体高度，默认值为 1             |
| heightSegments | 圆锥体身体曲面划分数目，默认值为 5 |
| capSegments    | 圆锥体顶面划分数目，默认值为 20    |

### CapsuleGeometry

胶囊，[示例](/zh/examples/3d#capsule)

<img alt="capsule" src="https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*5czISLOqEeUAAAAAAAAAAAAADmJ7AQ/original" height='200'/>

| 属性名         | 说明                             |
| -------------- | -------------------------------- |
| radius         | 胶囊半径，默认值为 0.5           |
| height         | 胶囊高度，默认值为 1             |
| heightSegments | 胶囊身体曲面划分数目，默认值为 1 |
| sides          | 胶囊顶面划分数目，默认值为 20    |

## BufferGeometry

以上内置几何都继承自 BufferGeometry，因此需要自定义时也可以使用它。

在[示例](/zh/examples/3d#buffer-geometry)中，我们创建了一个完全自定义的几何体，配合 [Mesh](/zh/api/3d/mesh) 和 [MeshBasicMaterial](/zh/api/3d/material#meshbasicmaterial)：

```js
import { BufferGeometry, MeshBasicMaterial, Mesh } from '@antv/g-plugin-3d';

const bufferGeometry = new BufferGeometry(device);
const basicMaterial = new MeshBasicMaterial(device);
const mesh = new Mesh({
    style: {
        fill: '#1890FF',
        opacity: 1,
        geometry: bufferGeometry,
        material: basicMaterial,
    },
});

bufferGeometry.setVertexBuffer({
    bufferIndex: 1,
    byteStride: 4 * 3,
    stepMode: VertexStepMode.VERTEX,
    attributes: [
        {
            format: Format.F32_RGB,
            bufferByteOffset: 4 * 0,
            location: VertexAttributeLocation.POSITION,
        },
    ],
    data: Float32Array.from([
        -100.0,
        100.0,
        100.0, // 顶点1
        100.0,
        100.0,
        100.0, // 顶点2
        100.0,
        -100.0,
        100.0, // 顶点3
        100.0,
        -100.0,
        100.0, // 顶点4
        -100.0,
        -100.0,
        100.0, // 顶点5
        -100.0,
        100.0,
        100.0, // 顶点6
    ]),
});
bufferGeometry.vertexCount = 6;
```

### vertexCount

设置需要绘制的顶点数目，默认全部绘制，后续可以随时修改。

```js
geometry.vertexCount = 10;
```

### instancedCount

在 instanced 模式下，绘制的实例数目。

```js
geometry.instancedCount = 10;
```

### indexStart

使用索引数组（drawElements）绘制时的起始位置，默认为 0。

```js
geometry.indexStart = 3;
```

### primitiveStart

使用非索引数组（drawArrays）绘制时的起始位置，默认为 0。

```js
geometry.primitiveStart = 3;
```

## 通用方法

### setIndices

设置索引数组。

参数列表：

-   indices `number[] | Int32Array | Uint32Array | Uint16Array` 索引数组

例如在内置程序化生成的几何中，最终都会设置索引数组：

```js
geometry.setIndices(new Uint32Array(indices));
```

### setVertexBuffer

设置顶点数组。

参数列表：

-   descriptor `GeometryVertexBufferDescriptor` 顶点描述符

其中描述符结构如下：

-   bufferIndex 索引
-   byteStride stride 长度（以 byte 为单位）
-   stepMode 支持 vertex 和 instance 两种
-   attributes 支持 interleave，其中每个属性包括：
    -   format 对应 Shader 中的数据类型
    -   bufferByteOffset 在 stride 中的偏移量
    -   byteStride 属性长度
    -   location 与 Shader 中 location 对应
    -   divisor 选择 instance 模式后生效
-   data 数据

```js
export interface GeometryVertexBufferDescriptor {
    bufferIndex: number;
    byteStride: number;
    stepMode: VertexStepMode;
    attributes: Array<{
        format: Format,
        bufferByteOffset: number,
        byteStride?: number,
        location: number,
        divisor?: number,
    }>;
    data: ArrayBufferView;
}
```

例如在 Vertex Shader 中声明了如下顶点属性：

```glsl
layout(location = 10) attribute vec3 a_Position;
```

在不使用 interleave 的情况下，数组中仅包含位置属性：

```js
geometry.setVertexBuffer({
    bufferIndex: ProceduralGeometryAttributeLocation.POSITION,
    byteStride: 4 * 3,
    stepMode: VertexStepMode.VERTEX,
    attributes: [
        {
            format: Format.F32_RGB, // 与 vec3 对应
            bufferByteOffset: 4 * 0,
            location: VertexAttributeLocation.POSITION, // 与 location 对应
        },
    ],
    data: Float32Array.from(positions),
});
```

### updateVertexBuffer

在初始化之后，顶点数据有时也需要修改。

例如更新上面的位置属性时，首先通过 `bufferIndex` 定位到具体 Buffer，再通过 `bufferByteOffset` 指定偏移量，最后更新部分或者全部数据：

```js
geometry.updateVertexBuffer(
    ProceduralGeometryAttributeLocation.POSITION,
    VertexAttributeLocation.MAX,
    0,
    new Uint8Array(positions.buffer),
);
```

### applyMat4

对程序化生成的几何应用变换矩阵。由于 G 的坐标系 Y 轴正向向下，因此在生成后需要进行 Y 轴翻转。该方法对位置、法线应用变换。

参数列表：

-   matrix `mat4` 变换矩阵

```js
geometry.applyMat4(mat4.fromScaling(mat4.create(), vec3.fromValues(1, -1, 1)));
```
