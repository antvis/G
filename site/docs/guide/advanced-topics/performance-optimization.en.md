---
title: 性能优化
order: 1
redirect_from:
    - /en/guide/advanced-topics
---

任何一个渲染引擎都会在性能优化上下足功夫，任何优化手段都需要结合场景与具体 API 应用。在我们的可视化场景（2D 图表、大规模图场景）中，高效绘制大量简单图形是一个核心诉求。下面我们结合 Canvas2D / SVG / WebGL 和 WebGPU 这些渲染 API 介绍目前在 G 中使用的优化手段。

首先我们需要引入一个核心概念 draw call，以下介绍的优化方法大多围绕它展开。

# 什么是 draw call

为啥 draw call 多了就会影响性能呢？在 CPU 和 GPU 进行异步协作的过程中，会向 [command buffer](https://www.w3.org/TR/webgpu/#command-buffers) 中提交需要 GPU 执行的命令，例如设置状态、绘制或者拷贝资源。CPU 准备这些命令的速度与 GPU 执行的速度存在不小差异，这就造成了性能瓶颈。

下图来自 https://toncijukic.medium.com/draw-calls-in-a-nutshell-597330a85381，分别展示了每一帧中 CPU 和 GPU 的时间线，可以看出 GPU 总是在执行上一帧 CPU 提交的命令，与此同时 CPU 在准备下一帧的命令。当这些绘制命令数量不多时，两者协作没问题，但如果数量很多，GPU 在做完这一帧的渲染任务后就不得不等待，也就无法在 16ms 内完成了，这造成了卡顿的体感。

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*OdI0SqKtWB0AAAAAAAAAAAAAARQnAQ)

# 减少 draw call

因此我们需要想办法减少 CPU 提交的绘制命令数量，即能少画就少画，能不画就不画。下面我们会介绍不同渲染 API 下常用的优化手段，它们各有适合的场景。

## 剔除

图场景中一种常见的交互是通过鼠标滚轮进行放大查看，此时场景中仅有一部分可见，大部分都在视口范围之外。如果我们能将视口之外的图形“剔除”掉，就能减少绘制命令的数量。

决定场景中一个图形是否需要绘制的标准是什么呢？在下图中，灰色区域代表画布视口，如果对象“处于”视口内，我们就画（绿色图形），反之则剔除（红色图形）。

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*IrstQLn0kVoAAAAAAAAAAAAAARQnAQ)

在判断一个图形是否在视口内时，我们通常会使用一种称作“包围盒”的结构。图形可以千变万化，但总可以找到一个包裹住它的最小基础几何结构，这个结构可以是“包围盒”，也可以是“包围球”，总之是为何后续与视口求交方便。在 G 中我们选择轴对齐包围盒。推广到 3D 场景中，视口也变成了视锥，下图来自 [Unreal - Visibility and Occlusion Culling](https://docs.unrealengine.com/Engine/Rendering/VisibilityCulling#viewfrustum)：

![](https://user-images.githubusercontent.com/3608471/78733815-18111d80-7979-11ea-940b-9886ec5cf5e4.png)

在每一帧都在 CPU 端进行这样的求交运算开销不小，特别当场景中图形数量较多时。另外在 3D 场景中视锥与包围盒（立方体）各个面的求交开销更大，因此我们也采用了一系列优化方法：

在 3D 场景进行视锥剔除时，我们尽量使用了如下[加速检测方法](https://github.com/antvis/GWebGPUEngine/issues/3)：

-   基础相交测试 the basic intersection test
-   平面一致性测试 the plane-coherency test
-   八分测试 the octant test
-   标记 masking
-   平移旋转一致性测试 TR coherency test

更多可以参考：

-   [Optimized View Frustum Culling Algorithms for Bounding Boxes](http://fileadmin.cs.lth.se/cs/Personal/Tomas_Akenine-Moller/pubs/vfcullbox.pdf.gz)
-   [Efficient View Frustum Culling](http://old.cescg.org/CESCG-2002/DSykoraJJelinek/)
-   [视锥体剔除 AABB 和 OBB 包围盒的优化方法](https://zhuanlan.zhihu.com/p/55915345)

在 2D 场景中我们使用了空间索引（R-tree）进行区域查询的加速。首次为场景对象构建索引需要消耗一定时间，后续当图形发生变换时，也需要随时更新。

最后，由于剔除发生在 CPU 侧，与具体渲染 API 无关，因此这是一种相对通用的优化手段。

### 其他剔除手段

在 WebGL / WebGPU 这样的渲染 API 中，还提供了其他剔除手段：

-   背面剔除，[gl.cullFace](https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/cullFace)
-   遮挡剔除，[gl.createQuery](https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/createQuery)。至少需要 WebGL2，G 中暂未使用

## “脏矩形”渲染

另一种常见的交互是通过鼠标高亮某个图形。此时场景中仅有一小部分发生了改变，擦除画布中的全部图形再重绘就显得没有必要了。类比 React diff 算法能够找出真正变化的最小部分，“脏矩形”渲染能尽可能复用上一帧的渲染结果，仅绘制变更部分，特别适合 Canvas2D API。

下图展示了这个思路：

-   当鼠标悬停在圆上时，我们知道了对应的“脏矩形”，也就是这个圆的包围盒
-   找到场景中与这个包围盒区域相交的其他图形，这里找到了另一个矩形
-   使用 [clearRect](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/clearRect) 清除这个“脏矩形”，代替清空整个画布
-   按照 z-index 依次绘制一个矩形和圆形

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*6zyLTL-AIbQAAAAAAAAAAAAAARQnAQ)

在以上求交与区域查询的过程中，我们可以复用剔除方案中的优化手段，例如加速结构。

显然当动态变化的对象数目太多时，该优化手段就失去了意义，试想经过一番计算合并后的“脏矩形”几乎等于整个画布，那还不如直接清空重绘所有对象。因此例如 Pixi.js 这样的 2D 游戏渲染引擎就[不考虑内置](https://github.com/pixijs/pixi.js/issues/3503)。

但在可视化这类相对静态的场景下就显得有意义了，例如在触发拾取后只更新图表的局部，其余部分保持不变。

我们将该渲染器特性做成了开关，可以随时[根据具体情况关闭](/zh/api/renderer#enabledirtyrectanglerendering)。

## batching

以上两种方法当然有不适合的场景，例如希望总览一个大规模图场景的全貌时，无法应用剔除（所有节点/边都在视口内）。拖拽移动整个场景时，“脏矩形”渲染效果也不佳（整个场景都变“脏”了）。

除了使用一些上层的 LOD 手段，例如缩放等级较高时，隐藏掉边和文本（因为也看不清），以此减少绘制命令数量之外，[draw call batching](https://docs.unity3d.com/Manual/DrawCallBatching.html) 是非常合适的。

不同于 Canvas2D / Skia 提供的抽象层次较高的绘制 API，WebGL / WebGPU 提供了更低层次的 API，可以让我们将一批“同类”图形合并成一次绘制命令。在渲染引擎中，常用于渲染类似森林中大量树木这种场景。图场景同样十分契合，场景中包含大量同类但简单的图形（节点、边）。

结合我们的[这个教程](/zh/guide/diving-deeper/camera)，配合 Chrome Spector.js 插件能看出，一次 draw call 完成了 8k 个节点的绘制，这是性能提升的关键：

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*-8GtQrpM-jsAAAAAAAAAAAAAARQnAQ)

通常创建出的 instance 仅具有原图形的部分能力。例如 Babylon.js 只允许每个 instance 在部分变换属性上[有差异](https://doc.babylonjs.com/divingDeeper/mesh/copies/instances)。在 G 中并不需要用户显式声明 instance，按照常规图形创建即可，内部会进行自动合并。

值得一提的是我们使用 SDF 绘制部分 2D 图形例如 Circle、Ellipse、Rect。一方面能减少顶点数目（通常三角化一个圆需要 30+ 三角形，SDF 固定 2 个），另一方面也增加了不同图形合并的可能性。

# Offscreen Canvas

⚠️ 仅 `g-webgl` 下生效。

当主线程需要处理较重的交互时，我们可以将 Canvas 的渲染工作交给 Worker 完成，主线程仅负责同步结果。目前很多渲染引擎已经支持，例如 [Babylon.js](https://doc.babylonjs.com/divingDeeper/scene/offscreenCanvas)。

为了支持该特性，引擎本身并不需要做很多改造，只要能够保证 `g-webgl` 能在 Worker 中运行即可。

## 局限性

由于运行在 Worker 环境，用户需要手动处理一些 DOM 相关的事件。

# 参考资料

-   https://unrealartoptimization.github.io/book/pipelines/
