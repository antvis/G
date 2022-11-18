---
title: g-plugin-control
order: 10
---

Provides camera interaction for 3D scenes, internally using Hammer.js to respond to mouse-over, scroll-wheel events. Depending on the [camera type](/en/api/camera#camera#camera type), different interactions are provided.

## Usage

Create the `g-webgl` renderer and register the plugin.

```js
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Plugin } from '@antv/g-plugin-control';
// 创建 WebGL 渲染器
const webglRenderer = new WebGLRenderer();
// 注册 3D 插件
webglRenderer.registerPlugin(new Plugin());
```

[Example](/en/examples/plugins#orbit-control)：

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*1u8eRKMbVX8AAAAAAAAAAAAAARQnAQ)
