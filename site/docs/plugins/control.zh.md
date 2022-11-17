---
title: g-plugin-control
order: 10
---

为 3D 场景提供相机交互，内部使用 Hammer.js 响应鼠标移动、滚轮事件。根据不同的 [相机类型](/zh/api/camera#相机类型)，提供不同的交互效果。

## 安装方式

创建 `g-webgl` 渲染器，注册该插件：

```js
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Plugin } from '@antv/g-plugin-control';
// 创建 WebGL 渲染器
const webglRenderer = new WebGLRenderer();
// 注册 3D 插件
webglRenderer.registerPlugin(new Plugin());
```

## 效果

[完整示例](/zh/examples/plugins#orbit-control)：

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*1u8eRKMbVX8AAAAAAAAAAAAAARQnAQ)
