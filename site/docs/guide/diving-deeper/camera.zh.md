---
title: 使用相机
order: 2
---

相机（Camera）描述了我们观察世界的角度，视点、相机位置都会影响最终的成像。它适用于 2D 和 3D 场景。在创建 Canvas 画布时，我们已经内置了一个默认相机，它使用正交投影，后续可以随时改变它的投影模式以及其他参数。通过控制相机，我们能轻松实现某些过去需要移动整个画布的操作，甚至能实现相机动画。

在之前的教程中，我们已经掌握了如何创建场景、使用渲染器、监听事件。在本教程中，我们将在一个包含数千个图形的复杂场景中，通过相机实现场景的平移和缩放操作，`g-webgl` 渲染器将保证交互过程的流畅。

![](https://intranetproxy.alipay.com/skylark/lark/0/2021/gif/158945/1635332282646-f49c2f45-c40b-4273-ae5e-84c40b5d25d0.gif)

其中会涉及以下 API：

-   使用 [getCamera()](/zh/api/canvas#getcamera-camera) 获取画布相机
-   使用 [setZoom()](/zh/api/camera#setzoomzoom-number) 设置相机缩放参数
-   使用 [pan()](/zh/api/camera#pantx-number-ty-number) 平移相机
-   使用 [createLandmark()](/zh/api/camera#相机动画) 创建相机动画

最终示例：

-   [官网示例](/zh/examples/perf#nodes-8k)
-   [CodeSandbox 示例](https://codesandbox.io/s/jiao-cheng-shi-yong-xiang-ji-041xm?file=/index.js)

## 使用 g-webgl 渲染器

我们和之前一样创建一个画布，不同的是我们选择 `g-webgl` 渲染器：

```js
import { Canvas } from '@antv/g';
import { Renderer } from '@antv/g-webgl';

// 创建 WebGL 渲染器
const webglRenderer = new Renderer();

// 创建画布
const canvas = new Canvas({
    container: 'container',
    width: 600,
    height: 500,
    renderer: webglRenderer,
});
```

## 创建场景

这次我们的场景中包含大量的节点、边以及文本，节点和边的位置信息直接使用预计算的结果，我们通过 fetch 请求这个包含了结果的 JSON 数据：

```js
fetch('https://gw.alipayobjects.com/os/basement_prod/xxxx.json')
    .then((res) => res.json())
    .then((data) => {
        // 使用包含了节点、边位置信息的数据
    });
```

我们使用 [Line](/zh/api/basic/line) 表现边，[Circle](/zh/api/basic/circle) 表现节点，[Text](/zh/api/basic/text) 表现文本：

```js
// 使用预计算结果渲染边
data.edges.forEach(({ startPoint, endPoint }) => {
    const line = new Line({
        style: {
            x1: startPoint.x * 10,
            y1: startPoint.y * 10,
            x2: endPoint.x * 10,
            y2: endPoint.y * 10,
            stroke: '#1890FF',
            lineWidth: 3,
        },
    });

    canvas.appendChild(line);
});
// 省略渲染节点、文本
```

到这里都和之前的教程没有太大不同，接下来我们会给场景增加一些交互。

## 场景交互

我们希望给整个场景添加缩放、平移这两个交互，通过相机来实现。

### 获取相机

前面提到过，每个画布内置了一个相机，我们可以使用 [getCamera](/zh/api/canvas#getcamera-camera) 获取画布相机：

```js
const camera = canvas.getCamera();
```

### 实现缩放

我们希望通过鼠标滚轮实现对于整个场景的缩放，很自然的，我们使用 addEventListener 监听 wheel 事件。在获取到原生滚轮事件对象上携带的 deltaY 信息后，我们调用 [setZoom()](/zh/api/camera#setzoomzoom-number) 设置相机缩放参数，当然通过 [getZoom()](/zh/api/camera#setzoomzoom-number) 可以随时获取这个参数。当这个参数的值大于 1 时代表放大（好比我们拿着一个放大镜观察世界），小于 1 时代表缩小：

```js
// 设置最小和最大缩放比例
const minZoom = 0;
const maxZoom = Infinity;
canvas.addEventListener(
    'wheel',
    (e) => {
        e.preventDefault();
        let zoom;
        if (e.deltaY < 0) {
            zoom = Math.max(
                minZoom,
                Math.min(maxZoom, camera.getZoom() / 0.95),
            );
        } else {
            zoom = Math.max(
                minZoom,
                Math.min(maxZoom, camera.getZoom() * 0.95),
            );
        }

        // 设置相机缩放参数
        camera.setZoom(zoom);
    },
    { passive: false },
);
```

### 实现平移

有了缩放，很自然地我们也想实现利用鼠标拖拽完成场景的平移。在[入门教程](/zh/guide/chapter3)中我们借助 interact.js 实现了节点的拖拽，这里我们使用 hammer.js 帮助我们完成手势操作。

直接将我们的画布传给 hammer.js，并让它监听 pan 事件，得益于对 DOM API 的兼容，我们再次“欺骗”了它。hammer.js 会给事件对象加上 deltaX/Y，即鼠标移动过程中水平和垂直方向上的偏移量：

```js
import Hammer from 'hammerjs';
const hammer = new Hammer(canvas);
// 监听 pan 手势
hammer.on('pan', (ev) => {
    // 完成我们的逻辑
    // ev.deltaX/Y 为水平/垂直方向的偏移量
});
```

接下来让我们根据偏移量使用 [pan()](/zh/api/camera#pantx-number-ty-number) 来平移相机，需要注意的是，当我们向右拖拽鼠标想让场景向右平移时，需要让相机向左移动，这也和我们的生活常识相符：

```js
// 沿水平/垂直方向移动相机
camera.pan(-ev.deltaX, -ev.deltaY);
```

最后让我们做一个小小的优化，当放大场景时，我们希望移动的幅度小一点，反之当场景被缩小时，我们希望更快速地进行移动。因此我们可以根据相机当前的缩放参数来实现，使用 [getZoom()](/zh/api/camera#setzoomzoom-number) 获取它：

```js
const zoom = Math.pow(2, camera.getZoom());
camera.pan(-ev.deltaX / zoom, -ev.deltaY / zoom);
```

## 性能提升的秘密

既然平移相机等价于反向操作画布，那前者相比后者的优势是什么呢？

```js
camera.pan(100, 100);
// 等价于反向移动根节点
canvas.document.documentElement.translate(-100, -100);
```

简单来说，当我们改变根节点的位置时，整个画布中的图形都需要重绘。具体到内部实现，每个图形在世界坐标系下的变换矩阵都需要重新计算。把矩阵计算过程放在 Shader 中交给 GPU 完成能带来明显的性能提升，显然只有配合 `g-webgl` 才能发挥效果。

矩阵计算过程可以分解成相机矩阵和每个图形的模型矩阵。后者是需要考虑父节点，因此当我们改变根节点时，每个图形的模型矩阵都需要在 CPU 端重新计算后传给 GPU，而如果只改变相机矩阵，将极大程度减少 CPU 的运算量：

```glsl
// MVP 矩阵 = 相机矩阵 * 模型矩阵
mat4 MVPMatrix = ProjectionViewMatrix * ModelMatrix;
```

## 更多相机设置

除了使用 pan 平移相机，我们还可以进行以下[相机动作](/zh/api/camera#相机动作)：

-   [dolly()](/zh/api/camera#dollydistance-number) 沿 n 轴移动相机。正交投影下没有“近大远小”，因此不会对画面产生影响。
-   [rotate()](/zh/api/camera#rotateazimuth-number-elevation-number-roll-number) 按相机方位角旋转，逆时针方向为正。

另外在 3D 场景中，我们还可以使用[透视投影](/zh/api/camera#setperspectivenear-number-far-number-fov-number-aspect-number)代替默认的正交投影。

最后，[相机动画](/zh/api/camera#相机动画)能让我们在不同视角间平滑切换。
