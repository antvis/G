---
title: 性能优化
order: 1
redirect_from:
  - /zh/docs/guide/advanced-topics
---

减少 drawCall 是提升渲染性能的常用手段，我们应该在每一帧中尽可能减少提交的绘制命令数量。我们在 G 中使用了以下三种优化手段：

- 脏矩形渲染
- Instance 绘制
- 剔除策略

# 脏矩形渲染

⚠️ 仅 `g-canvas/g-webgl` 下生效。

G 4.0 中已经支持了局部渲染，ECharts 5 中称之为[“脏矩形渲染”](https://zhuanlan.zhihu.com/p/346897719)。
很多 2D 渲染引擎也都支持该优化特性，例如 [egret](https://github.com/egret-labs/egret-docs/blob/master/Engine2D/update/update255/README.md#%E8%84%8F%E7%9F%A9%E5%BD%A2%E5%BC%80%E5%85%B3)。浏览器在绘制页面内容时也使用了这一策略。

例如下图 `Shape` 的位置发生了移动，通过包围盒计算得到了两个待重绘的“脏矩形”，在下一帧渲染时：

- 计算场景内与“脏矩形”相交的所有对象，本例中仅有一个 `Shape`
- 不需要清空整个画布，只需要清空所有的“脏矩形”
- 重绘 `Shape`，其他区域可以保持不变

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*oj9uTJfi9ckAAAAAAAAAAAAAARQnAQ)

该过程有以下优化点。

## 加速结构

对于每一个“脏矩形”，我们都需要在场景中查找与之相交的对象，每次在场景图中都进行遍历完成相交检测显然效率不高，因此可以考虑使用类似空间索引这样的加速结构。

在实现中我们选择了 [R-tree](https://github.com/mourner/rbush)。在 `Group/Shape` 被加入画布时向 R-tree 中添加节点，当包围盒改变时更新节点。

## 合并脏矩形

产生的 “脏矩形” 过多时可以考虑合并。

## 清空脏矩形

Canvas 2D 提供了 `clearRect` 和 `clip` API。而 WebGL 则需要通过 `scissor` 实现。

## 局限性

显然当动态变化的对象数目太多时，该优化手段就失去了意义，试想经过一番计算合并后的“脏矩形”几乎等于整个画布，那还不如直接清空重绘所有对象。因此例如 Pixi.js 这样的 2D 游戏渲染引擎就[不考虑内置](https://github.com/pixijs/pixi.js/issues/3503)。

但在可视化这类相对静态的场景下就显得有意义了，例如在触发拾取后只更新图表的局部，其余部分保持不变。

该特性可以通过开关 `dirtyRectangle` 控制，在开发模式下通过 `debug` 选项可以直观地看到“脏矩形”，帮助排查类似“残影”问题：

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*5gAnS71u5xEAAAAAAAAAAAAAARQnAQ)

# Instance 绘制

⚠️ 仅 `g-webgl` 下生效。

在可视化场景下常常需要批量绘制同类对象，这些对象往往绝大部分属性一致，仅位置/旋转角度/缩放不同。此时可以使用一种称作 Instance 的技术，最大程度利用 GPU 进行加速，在游戏引擎中常用来生成森林这样的场景。

例如我们想绘制 1000 个圆，它们仅仅位置、半径不同，通常会使用一个 `for` 循环依次添加到画布中。如果使用 Instance 可以这样：

```javascript
// 创建一个圆，仅设置通用样式属性，并不需要设置位置和半径
const circle = canvas.addShape('circle', {
  attrs: {
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
  },
});

for (let i = 0; i < 1000; i++) {
  // 使用同一个圆创建 1000 个 instance
  const instance = circle.createInstance({
    attrs: {
      x: Math.random() * 600, // 位置随机
      y: Math.random() * 500,
      r: 10 + Math.random() * 5, // 半径随机
    },
  });

  // 每个 instance 可以单独应用动画
  instance.animate(
    {
      x: Math.random() * 600,
      y: Math.random() * 500,
    },
    {
      delay: 0,
      duration: 1000,
      easing: 'easeLinear',
      callback: () => {},
      repeat: true,
      direction: 'alternate',
    }
  );
}
```

此时 FPS 仍能维持在 50，相比 `g-canvas` 的 10 左右提升不小。

## 局限性

创建出的 instance 仅具有原 `Shape` 的部分能力。例如 Babylon.js 只允许每个 instance 在部分变换属性上[有差异](https://doc.babylonjs.com/divingDeeper/mesh/copies/instances)。

# 剔除策略

对于视口之外的对象，我们并不希望渲染它们。

## g-canvas

仍然可以通过 R-tree 加速结构查询视口内可见的对象。

## g-webgl

- 背面剔除，简单通过 WebGL 全局状态实现
- 视锥剔除，基于 masking 等优化手段，[详见](https://github.com/antvis/GWebGPUEngine/issues/3)

⚠️ 遮挡查询需要 WebGL2 暂不支持。

# Offscreen Canvas

⚠️ 仅 `g-webgl` 下生效。

当主线程需要处理较重的交互时，我们可以将 Canvas 的渲染工作交给 Worker 完成，主线程仅负责同步结果。
目前很多渲染引擎已经支持，例如 [Babylon.js](https://doc.babylonjs.com/divingDeeper/scene/offscreenCanvas)。

为了支持该特性，引擎本身并不需要做很多改造，只要能够保证 `g-webgl` 能在 Worker 中运行即可。

## 局限性

由于运行在 Worker 环境，用户需要手动处理一些 DOM 相关的事件。
