---
title: 画布
order: -2
---

为了保持与 Canvas 坐标系的一致，画布的原点为左上角。

```js
import { Canvas } from '@antv/g';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';

// 创建渲染器
const webglRenderer = new WebGLRenderer();

// 创建画布
const canvas = new Canvas({
  container: 'container', // 画布 DOM 容器 id
  width: 600, // 画布尺寸
  height: 500,
  renderer: webglRenderer, // 指定渲染器
});
```
