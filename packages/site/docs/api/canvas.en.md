---
title: Canvas
order: -100
---

我们在 G 核心包 `@antv/g` 中提供了画布这一核心对象，它就是一个“虚拟世界”，承载着以下三类对象：

-   [场景图](/zh/docs/guide/diving-deeper/scenegraph)。我们通过它描述场景中的各个图形及其层次关系。
-   [相机](/zh/docs/api/camera)。我们通过它定义观察整个场景的角度。我们为每一个画布内置了一个默认使用正交投影的相机，后续可随时修改。
-   [渲染器](/zh/docs/api/renderer)。我们通过它指定画布使用何种底层技术来渲染场景。不同的渲染器有着不同的渲染能力，例如只有 `g-webgl` 才能渲染 3D 图形。

在同一个页面中，多个画布可以共存，即可以同时存在多个“平行世界”。

# 坐标系

为了保持与 Canvas 屏幕坐标系的一致，我们设定画布的原点`(0, 0)`为左上角，X 轴正向指向屏幕右侧，Y 轴正向指向屏幕下方。下图为“世界坐标系”，涉及到旋转时，我们设定沿坐标轴正向顺时针为旋转方向。

![](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes/canvas_default_grid.png)

⚠️ 如果使用了 [g-plugin-3d](/zh/docs/plugins/3d) 插件，Z 轴正向指向屏幕外。

# 初始化

在创建一个画布时，我们需要传入以下初始化参数：

-   画布容器的 id 或 DOM 元素
-   画布宽度和高度
-   渲染器

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

# 添加/删除场景图节点

在使用[场景图](/zh/docs/guide/diving-deeper/scenegraph)描述各个图形及其层次关系后，我们需要将它们添加到画布中才能完成渲染。

## appendChild(object: DisplayObject)

向画布中添加待渲染对象。如果该对象有子节点也会一并加入。

```js
const circle = new Circle({ attrs: { r: 10 } });

canvas.appendChild(circle);
```

## removeChild(object: DisplayObject)

从画布中移除对象。如果该对象有子节点也会一并移除。

```js
canvas.removeChild(circle);
```

# 修改初始化配置

在初始化画布时我们传入了画布尺寸、渲染器等配置，后续可能对它们进行修改，因此我们提供了以下 API。

## resize(width: number, height: number)

有时我们需要在初始化之后调整画布尺寸，例如当容器尺寸变化时：

```js
canvas.resize(1000, 1000);
```

## setRenderer(renderer: Renderer)

在绝大部分场景下我们都应该在画布初始化时指定一个渲染器，后续再也不会更改。但也有小部分场景需要在运行时[切换渲染器](/zh/docs/guide/diving-deeper/switch-renderer#运行时切换)，例如 G 官网中几乎所有的示例都是这样做的：

```js
// 当图元数目很多时切换到 WebGL 渲染器
if (tooManyShapes) {
    canvas.setRenderer(webglRenderer);
} else {
    canvas.setRenderer(svgRenderer);
}
```

# 生命周期

在实例化时会进行初始化逻辑，随后可调用以下生命周期方法。

## render()

渲染画布，由于渲染器默认开启了自动渲染，大多数情况下不需要手动调用。但有些场景需要手动控制渲染时机，此时可以进行[按需渲染](/zh/docs/guide/diving-deeper/rendering-on-demand) [示例](/zh/examples/canvas#rendering-on-demand)：

```js
// 关闭自动渲染
const webglRenderer = new WebGLRenderer({
    enableAutoRendering: false,
});

canvas.render();
```

## destroy(destroyScenegraph = true)

销毁画布，依次执行以下销毁逻辑：

-   如果开启了自动渲染，停止主渲染循环
-   将整个场景图从画布中移除，如果设置了 `destroyScenegraph` 还会销毁整个场景图
-   销毁渲染上下文

```js
// 仅销毁画布，保留场景图
canvas.destroy();

// 一并销毁画布中的场景图
canvas.destroy(true);
```

# 获取内置对象

通过以下方法可以快速获取画布中的一些内置对象。

## getCamera(): Camera

获取[相机](/zh/docs/api/camera)，后续可对该相机进行操作，例如切换投影模式、完成相机动作和动画等。

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

## getRoot(): DisplayObject

获取场景图根节点。每一个画布都会默认创建一个节点作为整个场景图的根节点，后续所有通过 [appendChild]() 加入画布的节点都是根节点的子节点。

```js
// 向画布中添加一个 Circle
canvas.appendChild(circle);

const root = canvas.getRoot();
root.children; // [circle]
```

## document

考虑兼容 DOM 中的 `window.document`，效果与 [getRoot](/zh/docs/api/canvas#getroot-displayobject) 相同。

# 事件

目前画布会触发以下事件：

-   `beforeRender` 在每一帧渲染前触发
-   `afterRender` 在每一帧渲染后触发
-   `beforeDestroy` 在销毁前触发
-   `afterDestroy` 在销毁后触发

例如我们在官网所有例子中展示实时帧率，该组件在每次渲染后更新：

```js
canvas.on('afterRender', () => {
    stats.update();
});
```

# 多个画布共存

在同一个页面中，多个画布可以共存，即可以同时存在多个“平行世界”。但受限于底层渲染 API，例如 WebGL 只允许至多 8 个上下文。

[示例](/zh/examples/canvas#multi-canvas)
