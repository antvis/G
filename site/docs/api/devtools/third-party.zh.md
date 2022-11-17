---
title: 第三方开发调试工具
order: 3
---

在使用 G 开发时，有很多通用的第三方工具可以辅助我们开发调试。

## stats.js

[stats.js](https://github.com/mrdoob/stats.js/) 常用于展示 FPS。配合 G 使用时可以监听 [CanvasEvent 画布事件](/zh/api/canvas#画布特有事件)，在每一帧结束时更新：

<img src="https://raw.githubusercontent.com/mrdoob/stats.js/master/files/fps.png" width="300px">

```js
import { CanvasEvent } from '@antv/g';

// 创建 stats
const stats = new Stats();
stats.showPanel(0);
const $stats = stats.dom;
$stats.style.position = 'absolute';
$stats.style.left = '0px';
$stats.style.top = '0px';
const $wrapper = document.getElementById('container');
$wrapper.appendChild($stats);

// 在每一帧结束时刷新帧数
canvas.addEventListener(CanvasEvent.AFTER_RENDER, () => {
    stats.update();
});
```

## Spector.js

如果使用 `g-webgl` 作为[渲染器](/zh/api/renderer)，可以安装 Chrome 浏览器插件 [Spector.js](https://spector.babylonjs.com/)，捕获当前帧执行的所有 WebGL API：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*TE8zT7vFq4gAAAAAAAAAAAAAARQnAQ" width="500px">
