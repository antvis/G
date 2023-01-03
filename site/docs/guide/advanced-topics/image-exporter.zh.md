---
title: 导出画布内容
order: 6
---

一些图表库提供了保存内容到图片的功能，下图来自 [Highcharts](https://www.highcharts.com/)：

<img src="https://user-images.githubusercontent.com/3608471/174998577-df1c54e9-d981-4d82-a4aa-7f0bedfb11a1.png" width="200" alt="exporter in highcharts">

为此我们提供了 `g-image-exporter`，它支持选定画布区域，导出指定格式的 dataURL 或保存成图片等功能，[示例](/zh/examples/ecosystem/image-exporter/#image-exporter)。其中部分功能依赖 DOM API，对于非浏览器运行环境，请参考 [画布的特殊运行平台适配](/zh/api/canvas#特殊运行平台适配)。例如下载功能需要通过 `document.createElement('a')` 实现，非浏览器环境需要自行传入 `document` 对象。

## 配置项

创建时可以指定以下配置项，其中 `canvas` 为必填项，将画布传入：

```js
import { ImageExporter } from '@antv/g-image-exporter';

const exporter = new ImageExporter({
    canvas, // 传入画布
    defaultFilename: 'my-default-filename',
});
```

### defaultFilename

在调用 [downloadImage](/zh/guide/advanced-topics/image-exporter#downloadimage) 保存并下载图片时，如果没有指定文件名，将使用该配置项的值作为默认文件名。

## API

### toCanvas

该方法用以将指定区域的画布内容绘制到额外的 HTMLCanvasElement 中，随后可以根据需要进一步加工，例如添加背景色、水印等。

完整方法签名如下，该方法为**异步**：

```js
toCanvas(options: Partial<CanvasOptions> = {}): Promise<HTMLCanvasElement>;

interface CanvasOptions {
  clippingRegion: Rectangle;
  beforeDrawImage: (context: CanvasRenderingContext2D) => void;
  afterDrawImage: (context: CanvasRenderingContext2D) => void;
}
```

各配置项含义如下：

-   clippingRegion 画布裁剪区域，用矩形表示
-   beforeDrawImage 在绘制画布内容前调用，适合绘制背景颜色
-   afterDrawImage 在绘制画布内容后调用，适合绘制水印
-   ignoreElements 在导出 HTML 内容时，如何判断容器内一个 HTMLElement 是否被忽略

在该[示例](/zh/examples/ecosystem/image-exporter/#image-exporter)中，我们添加了背景色和水印，通过传入的 [CanvasRenderingContext2D](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D) 可以调用 Canvas2D API 进行绘制：

```js
import { Rectangle } from '@antv/g';

const canvas = await exporter.toCanvas({
    // 忽略 stats.js lil-gui 等在容器内添加的 DOM 元素
    ignoreElements: (element) => {
        return [gui.domElement, stats.dom].indexOf(element) > -1;
    },
    // 指定导出画布区域
    clippingRegion: new Rectangle(
        clippingRegionX,
        clippingRegionY,
        clippingRegionWidth,
        clippingRegionHeight,
    ),
    beforeDrawImage: (context) => {
        // 绘制背景色
        context.fillStyle = backgroundColor;
        context.fillRect(0, 0, clippingRegionWidth, clippingRegionHeight);
    },
    afterDrawImage: (context) => {
        // 绘制水印
        context.font = '24px Times New Roman';
        context.fillStyle = '#FFC82C';
        context.fillText('AntV', 20, 20);
    },
});
```

注意裁剪区域使用的是 `Rectangle` 而非 [Rect](/zh/api/basic/rect) 图形。它的构造函数中包含 `x/y/width/height` 四个参数。它相对于[视口坐标系](/zh/api/canvas#viewport)下，即对于一个 400 x 400 的画布，裁剪的最大宽高就是 400。

在导出 [HTML](/zh/api/basic/html) 时，默认会导出容器内的全部 HTMLElement，但有时有些元素并不是我们想导出的，此时可以使用 `ignoreElements: (element: Element): boolean;` 方法进行过滤。例如该[示例](/zh/examples/ecosystem/image-exporter/#image-exporter)中容器内还有 stats.js 和 lil-gui 添加的 DOM 元素，我们并不希望导出，此时可以：

```js
ignoreElements: (element) => {
    return [gui.domElement, stats.dom].indexOf(element) > -1;
},
```

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*D8jdTK6xoJgAAAAAAAAAAAAAARQnAQ" alt="export html" width="400">

### toSVGDataURL

有时我们想导出矢量图。不同于 [toCanvas](/zh/guide/advanced-topics/image-exporter#tocanvas) 对于所有渲染器都支持，只有 [g-svg](/zh/api/renderer/svg) 渲染器支持生成 SVG 类型的 dataURL，如果选择了其他渲染器，将返回 `Promise<undefined>`。

方法签名如下：

```js
toSVGDataURL(): Promise<string>;
```

内部使用 [XMLSerializer](https://developer.mozilla.org/en-US/docs/Web/API/XMLSerializer) 实现，将 SVGElement 序列化成 XML 字符串。

### downloadImage

触发浏览器下载行为，可以将 [导出的 dataURL](/zh/plugins/image-exporter#导出-dataurl) 传入并指定保存的文件名。

完整方法签名如下：

```js
downloadImage(options: DownloadImageOptions): void;

interface DownloadImageOptions {
  dataURL: string;
  name?: string;
}
```

在该[示例](/zh/examples/ecosystem/image-exporter/#image-exporter)中，点击按钮立即开始下载图片，如果选择了 `image/png` 格式，最终保存成 `my-file.png` 文件：

```js
const canvas = await exporter.toCanvas();
const dataURL = canvas.toDataURL();

// 触发下载
exporter.downloadImage({
    dataURL,
    name: 'my-file',
});
```

下载行为是通过使用 `document`创建 HTMLAnchorElement 并触发它的默认点击行为实现的。

## 导出 dataURL

通过 [toCanvas](/zh/plugins/image-exporter#tocanvas) 我们得到了包含画布内容的 HTMLCanvasElement，使用其原生方法 [toDataURL](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLCanvasElement/toDataURL) 就可以得到 dataURL：

```js
const canvas = await exporter.toCanvas();
const dataURL = canvas.toDataURL(); // data:...
```

在 [toDataURL](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLCanvasElement/toDataURL) 方法中可以指定图片格式，默认为 `image/png`，以及图片质量，详见[参数](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLCanvasElement/toDataURL#%E5%8F%82%E6%95%B0)。

## 导出 ImageData

HTMLCanvasElement 同样提供了 [getImageData](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/getImageData) 方法用于获取指定区域的像素数据：

```js
const canvas = await exporter.toCanvas();
const imageData = canvas.getContext('2d').getImageData(50, 50, 100, 100); // ImageData { width: 100, height: 100, data: Uint8ClampedArray[40000] }
```

## 导出 PDF

如果我们还想在前端根据图片生成 PDF，可以参考：https://github.com/parallax/jsPDF

## 注意事项

### 导出图片的物理尺寸

导出图片的物理尺寸已经包含了 resolution，即对于指定了宽高 400 x 400 的画布，如果当前环境的 [devicePixelRatio](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio) 为 2，将生成 800 x 800 的图片。

### 可以导出 HTML 吗？

可以，如果画布中包含 [HTML](/zh/api/basic/html)，目前不同的渲染器实现如下：

-   导出 SVG，其中天然包含 [foreignObject](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/foreignObject)
-   导出其他图片格式，内部使用 [html2canvas](https://html2canvas.hertzen.com/) 实现

在该[示例](/zh/examples/ecosystem/image-exporter/#image-exporter)中，左上角 Tooltip 就是一个 HTML。

### 为何 toCanvas 为异步方法？

HTMLCanvasElement 的原生方法 [toDataURL](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLCanvasElement/toDataURL) 的确是一个同步方法。

但由于 WebGL / Canvaskit 使用双缓冲机制，拥有绘制 Buffer 和展示 Buffer。好处是相比每一帧都拷贝绘制 Buffer 的内容到展示 Buffer，直接交换效率更高。因此在创建 WebGL 上下文时我们关闭了 [preserveDrawingBuffer](https://stackoverflow.com/questions/27746091/preservedrawingbuffer-false-is-it-worth-the-effort)，但需要确保调用 toDataURL 时渲染没有被清除（调用 `gl.clear()`），这会导致该行为变成异步，等待下一次渲染 tick 时才能获取内容。

另外在导出 [HTML](/zh/api/basic/html) 内容时，使用 [html2canvas](https://html2canvas.hertzen.com/) 提供的导出方法同样也是一个异步操作。

### 如何导出画布视口之外的图形？

我们提供的导出方法都只针对画布视口范围，即使是裁剪也是相对[视口坐标系](/zh/api/canvas#viewport)下。因此如果想导出视口之外的图形，可以使用[相机 API](/zh/api/camera) 在不改变场景结构的前提下改变视口范围，例如通过 [setZoom](http://localhost:8000/zh/api/camera#setzoom) 进行缩放，让视口内容纳更多图形。

### toDataURL polyfill

HTMLCanvasElement 的原生方法 [toDataURL](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLCanvasElement/toDataURL) 有可能在某些古早浏览器上不支持，此时可以使用 polyfill： https://stackoverflow.com/a/47148969

### 导出带动画效果的 SVG

在该[示例](/zh/examples/ecosystem/image-exporter/#animated-svg)中，导出的 SVG 中包含如下 `<style>` 内容，使用 CSS Animations 保存了部分动画效果：

```css
#g-svg-xx {
  animation: u0 linear 2250ms infinite;
}
@keyframes u0{1.32%{transform:scale(0,1)}
```

但需要注意的是，不是所有支持动画的属性都可以转换成 CSS Animations 表示，例如[形变动画](/zh/api/animation/waapi#形变动画)中使用到的 path 属性。
另外在 [EffectTiming](/zh/api/animation/waapi#effecttiming) 中，有些配置项 CSS Animations 还不支持，因此也无法体现在导出的文件中：

-   [自定义的缓动函数](/zh/api/animation/waapi#easingfunction)
-   [endDelay](/zh/api/animation/waapi#enddelay)
-   [iterationStart](/zh/api/animation/waapi#iterationstart)

最后，在使用该功能时，需要确保导出前所有动画效果处于暂停状态。只有这样才能保证在导出的这一刻，图形都处于初始状态，否则 SVG 中将保存中间时刻的状态：

```js
animation.pause();
const svgDataURL = await exporter.toSVGDataURL();
```
