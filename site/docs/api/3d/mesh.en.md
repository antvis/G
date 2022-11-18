---
title: Mesh
order: 3
---

在 3D 场景中 Mesh 的描述能力是最强大的，需要配合 [Geometry](/zh/api/3d/geometry) 和 [Material](/zh/api/3d/material) 使用。

```js
import {
    MeshPhongMaterial,
    SphereGeometry,
    DirectionalLight,
    Mesh,
    Plugin as Plugin3D,
} from '@antv/g-plugin-3d';

const sphereGeometry = new SphereGeometry();
const material = new MeshPhongMaterial({
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
        radius: 200,
        geometry: sphereGeometry,
        material,
    },
});
// 添加到画布
canvas.appendChild(sphere);
```

## 基础样式属性

我们复用 2D 图形的部分样式属性名。

### fill

填充色

### opacity

透明度

### z

局部坐标系下 Z 轴坐标

## 变换操作

和 2D 图形一样，简单推广到 3D 即可。例如平移、缩放、旋转：

```js
mesh.translate(0, 0, 0);
mesh.setPosition(0, 0, 0);
mesh.translateLocal(0, 0, 0);
mesh.setLocalPosition(0, 0, 0);

mesh.scale(1, 1, 1);
mesh.scaleLocal(1, 1, 1);
mesh.setLocalScale(1, 1, 1);

// 绕 Y 轴逆时针方向旋转
mesh.rotate(0, 0.1, 0);
```

## 包围盒

轴对齐包围盒也从 2D 的矩形推广到 3D 中的立方体：

```js
const bounds = mesh.getBounds();
// { center: [0, 0, 0], halfExtents: [100, 100, 100] }
```
