---
title: 简介
order: -100
redirect_from:
    - /zh/api
---

我们在 G 核心包 `@antv/g` 中提供了 Canvas 画布这一核心对象，从渲染的角度上看，它是一个在浏览器中实现的“小浏览器”，承载着以下三类对象：

-   [场景图](/zh/api/canvas/scenegraph-lifecycle)。我们通过它描述场景中的各个图形及其层次关系。
-   [相机](/zh/api/camera/intro)。我们通过它定义观察整个场景的角度。我们为每一个画布内置了一个默认使用正交投影的相机，后续可随时修改。
-   [渲染器](/zh/api/renderer/intro)。我们通过它指定画布使用何种底层技术来渲染场景。不同的渲染器有着不同的渲染能力，例如只有 [g-webgl](/zh/api/renderer/webgl) 才能渲染 3D 图形。在 2D 场景下我们会尽力实现不同渲染器下一致的渲染效果。

在设计画布 API 时，我们参考了 DOM API，因此它们有着很多相似之处：

-   画布可以类比成浏览器环境中的 [window](https://developer.mozilla.org/en-US/docs/Web/API/Window) 对象。和 window 一样，在内部实现中我们也让画布继承了 [EventTarget](/zh/api/builtin-objects/event-target)。与 window 不同的是，在同一个页面中，多个画布可以共存，即可以同时存在多个“平行世界”。
-   在 DOM 树中页面的入口为 [window.document](https://developer.mozilla.org/en-US/docs/Web/API/Document)，在画布中为 `canvas.document`。
-   在 DOM 树中根节点为 [document.documentElement](https://developer.mozilla.org/en-US/docs/Web/API/Document/documentElement)，也就是 `<html>`。在画布中同样可以通过 `canvas.document.documentElement` 访问。

我们选择尽可能兼容 DOM API，一方面降低了前端使用者的记忆学习成本，另一方面可以充分利用现有的 Web 生态，例如可以无缝接入[现有的手势和拖拽库](/zh/api/event/gesture-dragndrop)。

对于非常规浏览器环境，我们也提供了例如 [WebWorker 中使用 OffscreenCanvas](/zh/api/canvas/offscreen-canvas-ssr)、[服务端渲染](/zh/api/canvas/offscreen-canvas-ssr)等方案。

# 继承自

[EventTarget](/zh/api/builtin-objects/event-target)
