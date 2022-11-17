---
title: 架构介绍
order: 0
redirect_from:
    - /zh/inside-g
---

通常用户使用 G 绘图可以分成三步：

1. 使用[场景图](/zh/guide/diving-deeper/scenegraph)描述待渲染对象
2. [按需引入](zh/docs/guide/diving-deeper/switch-renderer)一个或多个 Renderer 渲染器
3. 使用渲染器渲染场景图，可以在运行时切换不同渲染器

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*PAufRYPbf4UAAAAAAAAAAAAAARQnAQ)

其中，场景图是独立于各种渲染器的抽象，因此在组件库、布局系统这类与实际渲染效果无关的应用中，并不需要直接与渲染器打交道，各个渲染器应该保证在各自环境下的一致渲染效果。在构建场景图，操作图中节点的语法上，我们提供了与 [DOM API 一致的方法](/zh/api/display-object#添加删除节点)，同时提供[类似 CSS 选择器的语法](/zh/api/display-object#高级查询)来查询图中节点，尽可能减少前端的学习成本。

在扩展性上，我们从场景图和渲染服务两个维度提供了**插件机制**。

场景图的插件关心每个节点的[生命周期](/zh/guide/advanced-topics/container)，选取其中的某些阶段扩展节点能力。

我们定义了统一的核心渲染层，它不关心具体渲染器的实现，暴露生命周期供扩展。以 WebGL 渲染器为例，它通过注册插件，为场景图中每一个节点扩展了 Material 等组件，得以适应 WebGL 渲染环境。

通过[依赖注入](/zh/guide/advanced-topics/container)使各个渲染器实现统一的上下文、渲染服务接口，核心层并不关心具体渲染器实现，因此可以在运行时动态替换不同渲染器。

# 统一的渲染服务

我们在 G 的核心层定义了一套统一的渲染服务，该服务定义了如下生命周期。各个渲染器通过关联生命周期中的各个阶段，完成各自渲染环境下的渲染流程：

```js
hooks = {
    // 渲染服务初始化，切换到新渲染器时也会调用
    init: new SyncHook<[]>(),
    // 处理待渲染对象
    prepareEntities: new AsyncSeriesWaterfallHook<[Entity[], DisplayObject]>(['entities', 'root']),
    // 渲染帧开始
    beginFrame: new AsyncSeriesHook<[Entity[]]>(['entities']),
    // 渲染中
    renderFrame: new AsyncSeriesHook<[Entity[]]>(['entities']),
    // 渲染帧结束
    endFrame: new AsyncSeriesHook<[Entity[]]>(['entities']),
    // 渲染服务销毁，切换到新渲染器后，旧渲染器调用
    destroy: new SyncHook<[]>(),
};
```

其中核心层实现了一系列通用插件，它们与具体渲染环境无关：

**MountDisplayObjectPlugin**

-   prepareEntities 首次挂载到画布时调用，触发渲染对象的 `mounted` 生命周期

**DirtyCheckPlugin** 实现[脏矩形渲染](/zh/guide/advanced-topics/performance-optimization#脏矩形渲染)

-   init 监听每个待渲染对象的包围盒变更
-   prepareEntities 过滤包含了脏标记的待渲染对象列表，合并脏矩形，通过 R-Tree 加速查询增量重绘对象列表
-   endFrame 对于当前帧完成绘制的对象列表中的每一个对象，保存它的包围盒，供下次脏检查合并使用
-   destroy 移除对于每个待渲染对象的包围盒变更的监听

**CullingPlugin** 负责剔除，得到需要重绘的最小对象集合

-   prepareEntities 通过 `visiblity` 和视口包围盒剔除

**SortPlugin** 负责对象排序

-   prepareEntities 通过 `z-index` 排序

## g-renderer-canvas

**DirtyRectanglePlugin**

-   beginFrame
    -   `context.save()`
    -   擦除脏矩形，创建 clip
-   renderFrame
    -   应用变换矩阵
    -   在 Canvas 2D 上下文中应用属性
    -   绘制路径
    -   填充和描边
-   endFrame
    -   `context.restore()`

## g-renderer-svg

## g-renderer-webgl
