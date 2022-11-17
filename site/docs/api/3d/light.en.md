---
title: 光源
order: 3
---

[材质](/zh/api/3d/material)需要配合光源呈现出某种“立体感”。

日常生活中的光源有很多，太阳、台灯、手电筒。它们需要被抽象成可参数化描述的光源。

例如太阳可以看作是“平行光”，它通过颜色、强度、方向来描述。通常光源是作用于整个场景的，因此在具体使用渲染引擎时，会将它添加到场景 / 画布上，以 G 为例：

```js
import { DirectionalLight } from '@antv/g-plugin-3d';
// 创建一个平行光
const light = new DirectionalLight({
    style: {
        fill: 'white',
        direction: [-1, 0, 1],
    },
});
// 加入画布
canvas.appendChild(light);
```

对于某些光源来说，在世界坐标系下的位置是有意义的，当我们想移动光源时，和其他 2D 图形完全一致：

```js
light.translate();
light.setPosition();
```

## 通用属性

我们复用 G 中基础图形的部分样式属性，不同光源也有独有的属性。例如我们可以随时改变一个光源的颜色：

```js
light.style.fill = 'red';
```

### fill

光源颜色

### intensity

光照强度，默认为 `Math.PI`

## 内置光源

### 平行光

#### direction

世界坐标系下的方向，类型为 `[number, number, number]`。[示例](/zh/examples/3d#sphere)

```js
light.style.direction = [-1, 0, 1];
```

### 点光源

### 聚光灯

### 环境光

严格意义上讲这并不是一种光源，它是一种简单模拟全局光照的手段。当我们想提亮整个场景时，可以使用它。[示例](/zh/examples/3d#sphere)

```js
import { AmbientLight } from '@antv/g-plugin-3d';
const ambientLight = new AmbientLight({
    style: {
        fill: 'white',
    },
});
canvas.appendChild(ambientLight);
```

## 阴影
