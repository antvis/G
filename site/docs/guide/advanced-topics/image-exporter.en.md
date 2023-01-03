---
title: Exporting the contents of the canvas
order: 6
---

Some chart libraries offer the ability to save content to an image, the image below is from [Highcharts](https://www.highcharts.com/)：

<img src="https://user-images.githubusercontent.com/3608471/174998577-df1c54e9-d981-4d82-a4aa-7f0bedfb11a1.png" width="200" alt="exporter in highcharts">

For this purpose, we provide `g-image-exporter`, which supports functions such as selecting canvas area, exporting dataURL in specified format or saving it as image, [example](/en/examples/ecosystem/image-exporter/#image-exporter). Some of the functions depend on DOM API, for non-browser environment, please refer to [special platform adaptation of canvas](/en/api/canvas#special platform adaptation). For example, the download function needs to be implemented by `document.createElement('a')`, non-browser environment needs to pass `document` object by itself.

## Configuration

When creating, you can specify the following configuration items, where `canvas` is required, to pass the canvas into.

```js
import { ImageExporter } from '@antv/g-image-exporter';

const exporter = new ImageExporter({
    canvas, // pass canvas in
    defaultFilename: 'my-default-filename',
});
```

### defaultFilename

When calling [downloadImage](/en/guide/advanced-topics/image-exporter#downloadimage) to save and download an image, the value of this configuration item will be used as the default file name if no file name is specified.

## API

### toCanvas

This method is used to draw the canvas content of the specified area to an additional HTMLCanvasElement, which can then be further processed as needed, such as adding background colors, watermarks, etc.

The full method signature is as follows, and the method is **asynchronous**.

```js
toCanvas(options: Partial<CanvasOptions> = {}): Promise<HTMLCanvasElement>;

interface CanvasOptions {
  clippingRegion: Rectangle;
  beforeDrawImage: (context: CanvasRenderingContext2D) => void;
  afterDrawImage: (context: CanvasRenderingContext2D) => void;
}
```

The meaning of each configuration item is as follows.

-   `clippingRegion` The clipping region of the canvas, represented by a rectangle
-   `beforeDrawImage` Called before drawing the content of the canvas, suitable for drawing the background color
-   `afterDrawImage` is called after drawing the content of the canvas, suitable for drawing watermarks
-   `ignoreElements` How to determine whether an HTMLElement in the container is ignored when exporting HTML content

In this [example](/en/examples/ecosystem/image-exporter/#image-exporter), we add a background color and watermark that can be drawn by passing in [CanvasRenderingContext2D](https://developer.mozilla.org/en-US/ docs/Web/API/CanvasRenderingContext2D) can call the Canvas2D API to draw.

```js
import { Rectangle } from '@antv/g';

const canvas = await exporter.toCanvas({
    // Ignore DOM elements added inside containers such as stats.js lil-gui
    ignoreElements: (element) => {
        return [gui.domElement, stats.dom].indexOf(element) > -1;
    },
    // Specify the export canvas area
    clippingRegion: new Rectangle(
        clippingRegionX,
        clippingRegionY,
        clippingRegionWidth,
        clippingRegionHeight,
    ),
    beforeDrawImage: (context) => {
        // Drawing background color
        context.fillStyle = backgroundColor;
        context.fillRect(0, 0, clippingRegionWidth, clippingRegionHeight);
    },
    afterDrawImage: (context) => {
        // Draw watermark
        context.font = '24px Times New Roman';
        context.fillStyle = '#FFC82C';
        context.fillText('AntV', 20, 20);
    },
});
```

Note that the crop area uses `Rectangle` instead of [Rect](/en/api/basic/rect) graphics. Its constructor contains four parameters `x/y/width/height`. It is relative to [viewport coordinate system](/en/api/canvas#viewport) under [viewport](/en/api/canvas#viewport), i.e. for a 400 x 400 canvas, the maximum width and height of the crop is 400.

When exporting [HTML](/en/api/basic/html), all HTMLElement in the container will be exported by default, but sometimes some elements are not the ones we want to export, so we can use `ignoreElements: (element: Element): boolean;` method to filter. For example, in this [example](/en/examples/ecosystem/image-exporter/#image-exporter) there are DOM elements added by stats.js and lil-gui in the container that we don't want to export, so we can.

```js
ignoreElements: (element) => {
    return [gui.domElement, stats.dom].indexOf(element) > -1;
},
```

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*D8jdTK6xoJgAAAAAAAAAAAAAARQnAQ" alt="export html" width="400">

### toSVGDataURL

Sometimes we want to export vector images. Unlike [toCanvas](/en/guide/advanced-topics/image-exporter#tocanvas) which is supported for all renderers, only [g-svg](/en/api/renderer/svg) renderer supports generating SVG type dataURL, if other renderer is selected, `Promise<undefined>` will be returned.

The method signature is as follows.

```js
toSVGDataURL(): Promise<string>;
```

Implemented internally using [XMLSerializer](https://developer.mozilla.org/en-US/docs/Web/API/XMLSerializer) to serialize SVGElement into an XML string.

### downloadImage

To trigger browser download behavior, you can pass [exported dataURL](/en/plugins/image-exporter#export-dataurl) and specify the name of the saved file.

The full method signature is as follows.

```js
downloadImage(options: DownloadImageOptions): void;

interface DownloadImageOptions {
  dataURL: string;
  name?: string;
}
```

In this [example](/en/examples/ecosystem/image-exporter/#image-exporter), click the button to start downloading the image immediately, and if the `image/png` format is selected, it will eventually be saved as a `my-file.png` file.

```js
const canvas = await exporter.toCanvas();
const dataURL = canvas.toDataURL();

// Trigger downloading
exporter.downloadImage({
    dataURL,
    name: 'my-file',
});
```

The download behavior is achieved by creating an HTMLAnchorElement using `document` and triggering its default click behavior.

## Export dataURL

With [toCanvas](/en/plugins/image-exporter#tocanvas) we get the HTMLCanvasElement containing the canvas content, using its native method [toDataURL](https://developer.mozilla. org/en-cn/docs/Web/API/HTMLCanvasElement/toDataURL) to get the dataURL.

```js
const canvas = await exporter.toCanvas();
const dataURL = canvas.toDataURL(); // data:...
```

The [toDataURL](https://developer.mozilla.org/en-CN/docs/Web/API/HTMLCanvasElement/toDataURL) method allows you to specify the image format, which defaults to `image/png`, and the image quality, as described in [parameters] (https://developer.mozilla.org/en-CN/docs/Web/API/HTMLCanvasElement/toDataURL#%E5%8F%82%E6%95%B0).

## Export ImageData

HTMLCanvasElement also provides the [getImageData](https://developer.mozilla.org/en-CN/docs/Web/API/CanvasRenderingContext2D/getImageData) method for getting pixel data of the specified area.

```js
const canvas = await exporter.toCanvas();
const imageData = canvas.getContext('2d').getImageData(50, 50, 100, 100); // ImageData { width: 100, height: 100, data: Uint8ClampedArray[40000] }
```

## Export PDF

If we also want to generate PDF based on the image in the front-end, you can refer to. https://github.com/parallax/jsPDF

## Cautions

### Physical size of the exported image

The physical size of the exported image already includes resolution, i.e. for a canvas with a specified width and height of 400 x 400, if the [devicePixelRatio](https://developer.mozilla.org/en-US/docs/Web/API/Window/) of the current environment is 2 devicePixelRatio) is 2, an 800 x 800 image will be generated.

### Can I export HTML?

Yes, if the canvas contains [HTML](/en/api/basic/html), the different renderers currently implement the following.

-   Export SVG, which naturally contains [foreignObject](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/foreignObject)
-   export other image formats, which are implemented internally using [html2canvas](https://html2canvas.hertzen.com/)

In this [example](/en/examples/ecosystem/image-exporter/#image-exporter), the Tooltip in the top left corner is an HTML.

### Why is toCanvas an asynchronous method?

HTMLCanvasElement's native method [toDataURL](https://developer.mozilla.org/en-CN/docs/Web/API/HTMLCanvasElement/toDataURL) is indeed a synchronization method.

However, since WebGL / Canvaskit uses a double buffering mechanism, with a drawing buffer and a display buffer, the advantage is that it is more efficient to swap directly than to copy the contents of the drawing buffer to the display buffer every frame. Therefore, we turn off [preserveDrawingBuffer](https://stackoverflow.com/questions/27746091/preservedrawingbuffer-false-is-it-worth-) when creating the WebGL context. the-effort), but need to make sure that the rendering is not cleared when calling toDataURL (calling `gl.clear()`), which will cause the behavior to become asynchronous and wait for the next rendering tick to fetch the content.

Also when exporting [HTML](/en/api/basic/html) content, using the export method provided by [html2canvas](https://html2canvas.hertzen.com/) is also an asynchronous operation.

### How do I export graphics outside of the canvas viewport?

The export methods we provide are only for the canvas viewport range, even cropping is relative to [viewport coordinate system](/en/api/canvas#viewport). So if you want to export graphics outside the viewport, you can use [camera API](/en/api/camera) to change the viewport range without changing the scene structure, for example by [setZoom](http://localhost:8000/en/api/camera#setzoom) to zoom in and out to allow more graphics to fit inside the viewport.

### toDataURL polyfill

The HTMLCanvasElement's native method [toDataURL](https://developer.mozilla.org/en-CN/docs/Web/API/HTMLCanvasElement/toDataURL) may not be supported on some ancient browsers, in which case you can use polyfill: https://stackoverflow.com/a/47148969

### Export an animated SVG

In this [example](/en/examples/ecosystem/image-exporter/#animated-svg), the exported SVG contains the following `<style>` content, using CSS Animations to save some animation effects:

```css
#g-svg-xx {
  animation: u0 linear 2250ms infinite;
}
@keyframes u0{1.32%{transform:scale(0,1)}
```

But it should be noted that not all properties that support animation can be converted into CSS Animations representation, such as the path property used in [Deformation animation](/en/api/animation/waapi#Deformation animation).
In addition, in [EffectTiming](/en/api/animation/waapi#effecttiming), some configuration items are not supported by CSS Animations, so they cannot be reflected in the exported file:

-   [easing function](/en/api/animation/waapi#easingfunction)
-   [endDelay](/en/api/animation/waapi#enddelay)
-   [iterationStart](/en/api/animation/waapi#iterationstart)

Finally, when using this feature, you need to ensure that all animation effects are paused before exporting. Only in this way can we ensure that the graphics are in the initial state at the moment of export, otherwise the state at the intermediate moment will be saved in SVG:

```js
animation.pause();
const svgDataURL = await exporter.toSVGDataURL();
```
