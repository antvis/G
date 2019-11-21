---
title: G 4.0 Release
order: 1
---

> G 是一款易用、高效、强大的 2D 可视化渲染引擎，提供 Canvas、SVG 等多种渲染方式的实现。目前，已有多个顶级的可视化开源项目基于 G 开发，比如图形语法库 [G2](https://antv.alipay.com/g2)、图可视化库 [G6](https://antv.alipay.com/g6) 等。

- 经过近半年的开发，G 4.0 虽然在架构和内部实现上几乎全部重写，但整体上实现了对 G 3.0 的接口兼容，上层的迁移成本非常小。同时，G 4.0 也带了一些新的特性，包括:
  - 多平台支持
  - 多种渲染模式支持
  - 事件完善
  - 动画增强

## ✨ 新功能及改进

### 多平台支持

- G 4.0 同时提供了基于 Canvas 和 SVG 两种渲染技术的实现：
  - [g-canvas](https://www.npmjs.com/package/@antv/g-canvas)：Canvas 版本的实现，是性能最优的一个 2D 渲染版本。
  - [g-svg](https://www.npmjs.com/package/@antv/g-svg): SVG 版本的实现，提供一些 SVG 的特性。
- 这两个版本除了各自支持的一些特性外，对外 API 均保持一致。两者在使用层面的差异性主要在于:
  - g-canvas
    - 支持局部渲染/全局渲染的切换。
    - 支持自动渲染/手动渲染的切换。
  - g-svg:
    - 支持 CSS
    - 支持嵌入 HTML

### 多种渲染模式支持

- 🌟  支持 [局部渲染](https://www.yuque.com/antv/ou292n/pcgt5g)，每次更新只会重绘变化的图形，而不会重绘整个画布，实现精准更新。
- 🌟  支持 自动渲染，每次更新都会自动触发渲染，无需手动调用 `canvas.draw()`  方法。
- 🌟  支持 [延迟渲染](https://www.yuque.com/antv/ou292n/xw2wcq)，保证每一次渲染之间都会留有足够的时间用于事件和交互，提升响应速度。
- 🌟  支持 [自动裁剪](https://www.yuque.com/antv/ou292n/hfgspk)，优化包围盒合并算法，使得重绘的区域尽可能小，降低渲染成本，提高渲染性能。

> 新的渲染模式能够极大提升渲染和交互的性能，优化后的效果展示如下(以 100,000 个图元的渲染和拾取为例):

|                                                                                                                         G 3.0                                                                                                                         |                                                                                                                        G 4.0                                                                                                                        |
| :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| ![G-3.0.gif](https://cdn.nlark.com/yuque/0/2019/gif/103291/1573529509429-c1a02ae5-d525-49bb-9067-a872210b5d4a.gif#align=left&display=inline&height=1028&name=G-3.0.gif&originHeight=1028&originWidth=1356&search=&size=380965&status=done&width=1356) | ![G-4.0.gif](https://cdn.nlark.com/yuque/0/2019/gif/103291/1573529521487-4a20c117-3f35-42ef-81a1-e68d03c2e0c1.gif#align=left&display=inline&height=228&name=G-4.0.gif&originHeight=1028&originWidth=1356&search=&size=841849&status=done&width=302) |
|                                                                                                                  响应缓慢，交互卡顿                                                                                                                   |                                                                                                                 响应迅速，交互流畅                                                                                                                  |

### 事件完善

- 💄  对 `mouseenter` 、 `mouseleave` 、`dragenter` 和 `dragleave` 事件进行改造，使其符合 DOM 事件的触发规则。
- 🌟  支持事件委托和事件冒泡，使得上层能够直接监听子元素的事件:

```javascript
// 新增一个 name 值为 circle 的圆形
canvas.addShape('circle', {
  name: 'circle',
  attrs: {
    x: 100,
    y: 100,
    r: 50,
    fill: 'red',
  },
});

// 通过事件委托的方式和 name 匹配的方式，直接在 canvas 上就能监听到图形的事件
canvas.on('circle:click', () => {
  // do something
});
```

### 动画增强

- 💄  提供更易用的动画接口，并兼容 G 3.0 的写法:

```javascript
// G 4.0 写法(推荐)
shape.animate(
  {
    x: 100,
    y: 100,
  },
  {
    duration: 2000,
    easing: 'easeLinear',
    callback: () => {},
  }
);

// 兼容 G 3.0 写法
shape.animate(
  {
    x: 100,
    y: 100,
  },
  2000,
  'easeLinear',
  (callback: () => {})
);
```

- 🌟  支持自定义帧动画，通过传入自定义的帧函数即可实现，常用于实现路径动画等场景:

```javascript
shape.animate(onFrame, {
  duration: 2000,
  easing: 'easeLinear',
  callback: () => {},
});

// 自定义帧函数 onFrame
function onFrame(ratio) {
  // 获取路径上点的坐标
  const point = path.getPoint(ratio);
  return {
    x: point.x,
    y: point.y,
  };
}
```

- 🌟  更丰富的动画配置，比如 `pauseCallback`  和 `resumeCallback` ，分别用于动画暂停和动画恢复时的回调。

```javascript
shape.animate(
  {
    x: 100,
    y: 100,
  },
  {
    duration: 2000,
    callback: () => {}, // 动画停止时的回调
    pauseCallback: () => {}, // 动画暂停时的回调
    resumeCallback: () => {}, // 动画恢复时的回调
  }
);
```

## ⚠️  不兼容变动

- ⚠️ 动画配置项 `repeat` ，在动画函数的第一个参数配置中不生效，改为在第二个参数配置项中生效:

```javascript
// G 4.0 写法
shape.animate(
  {
    x: 100,
    y: 100,
  },
  {
    duration: 2000,
    repeat: true, // 位于第二个参数配置项
  }
);

// G 3.0 写法(已废弃)
shape.animate(
  {
    x: 100,
    y: 100,
    repeat: true, // 位于第一个参数配置项
  },
  2000
);
```

## 🗑  在 4.0 中废弃的特性

### 矩阵变换函数

- 考虑到 G 4.0 将来可能支持 WebGL 的三维渲染，需要进行 4*4 的矩阵运算。因此移除了 Element 上只适用于 3*3 矩阵的变换函数:
  - 🗑  平移函数 `translate`
  - 🗑  移动函数 `move`
  - 🗑  缩放函数 `scale`
  - 🗑  旋转函数 `rotate`
  - 🗑  以 (0, 0) 点为中心的旋转函数 `rotateAtStart`
- 如果想要应用矩阵变换的效果，需要手动设置矩阵的值:
  - 设置矩阵 `setMatrix(matrix)`
  - 重置矩阵 `resetMatrix`
  - 设置矩阵 `attr('matrix', matrix)`
- 当然，为了方面上层使用，我们也提供了矩阵变换的工具方法:

```javascript
import { transform } from '@antv/matrix-util';

// 3*3 矩阵变换，用于二维渲染
trasform(m, [
  ['t', x, y], // translate
  ['r', Math.PI], // rotate
  ['s', 2, 2], // scale
]);
```

## 🚶 规划

- 除了会继续打磨和优化 g-canvas 和 g-svg，我们还在开发 g-mobile 和 g-webgl 这两个版本:
  - g-mobile: Mobile 版本的实现，用于支持 H5、小程序、Node 端。
  - g-webgl: WebGL 版本的实现，是一款 3D 可视化的渲染引擎。
- 未来的 G，应该不只是一款易用、高效、强大的 2D 可视化渲染引擎，而且是一款跨平台的易用、高效、强大的 2D 和 3D 可视化渲染引擎。
- 🤝 欢迎社区一起参与共建，尤其是有移动端和三维可视化开发经验的同学。
