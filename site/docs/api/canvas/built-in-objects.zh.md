---
title: 内置对象
order: 2
---

我们都知道浏览器中的 `window` 对象，DOM 树的入口为 `window.document`，而入口中通常会包含一个根节点 `<html>` 元素，它可以通过 `window.document.documentElement` 获得。我们向这个根节点下添加各种 DOM 元素，例如 `<head>` `<body>` 等。

Canvas 画布可以类比到 `window` 对象。与之类似，每一个画布在创建时都内置了一个入口 [Document](/zh/api/builtin-objects/document)，可以通过 `canvas.document` 获取。这个入口包含了[场景图](/zh/guide/diving-deeper/scenegraph)的根节点，这个根节点可以通过 `canvas.document.documentElement` 获取，随后可以通过 `appendChild` 向这个根节点中添加图形完成渲染。

## document

返回一个内置的 [Document](/zh/api/builtin-objects/document) 对象，它拥有场景图的根节点。通过 `document.documentElement` 获取到这个根节点后，可以使用场景图能力添加子节点：

```js
// 向画布中添加一个 Circle
canvas.document.documentElement.appendChild(circle);
canvas.document.documentElement.children; // [circle]
```

除了添加/删除节点能力，其他场景图能力、事件能力也都可以在根节点上使用：

```js
canvas.document.documentElement.getBounds(); // 获取当前场景包围盒大小
canvas.document.addEventListener('click', () => {}); // 绑定事件
```

## document.documentElement

`getRoot()` 的别名，因此以下两种写法等价：

```js
const root = canvas.getRoot();
const root = canvas.document.documentElement;
```

## getContextService

获取[渲染上下文](/zh/api/renderer#渲染环境上下文)，由渲染器（`g-canvas/svg/webgl`）实现。该渲染上下文上有很多常用的方法，例如：

-   getDomElement() 返回上下文所处的 DOM 元素，例如 `g-canvas/webgl` 会返回 `<canvas>`，而 `g-svg` 会返回 `<svg>`
-   getDPR() 返回上下文的 devicePixelRatio

## getCamera

获取[相机](/zh/api/camera/intro)，后续可对该相机进行操作，例如切换投影模式、完成相机动作和动画等。

```js
const camera = canvas.getCamera();

// 相机动作
camera.pan();
camera.rotate();

// 切换透视投影模式
camera
    .setPosition(300, 100, 500)
    .setFocalPoint(300, 250, 0)
    .setPerspective(0.1, 1000, 75, 600 / 500);
```
